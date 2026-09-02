import {
  createInitialGhosts, updateGhost, checkGhostCollision,
  frightenGhost, eatGhost, releaseGhost,
  type GhostState,
} from './ghost'
import {
  createPacman, updatePacman, pacmanDying,
  type PacmanState,
} from './pacman'
import {
  TOTAL_DOTS, BLINKY,
  PACMAN_SPEEDS, PACMAN_FRIGHT_SPEEDS,
  FRIGHT_DURATION, SCORE_DOT, SCORE_PELLET, SCORE_GHOST, EXTRA_LIFE_AT,
  DIR_LEFT, DIR_RIGHT,
  PACMAN_START, PACMAN1_START, PACMAN2_START,
  getModeCycle,
  type GameMode,
} from './constants'
import {
  createMaze, countDots, isDot, isPellet, getTile, setTile,
  T_EMPTY, type Maze,
} from './maze'
import {
  playEatDot, playEatPellet, playEatGhost, playDeath,
  playLevelClear, playExtraLife, playReady, soundEngine,
} from './sounds'

// ─── Phase types ──────────────────────────────────────────────────────────────
export type GamePhase =
  | 'start'       // title screen
  | 'ready'       // "READY!" before play begins
  | 'playing'     // active gameplay
  | 'dying'       // pac-man death animation
  | 'levelClear'  // brief flash then next level
  | 'gameover'    // game over screen
  | 'paused'      // paused

// ─── Score popup ──────────────────────────────────────────────────────────────
export interface ScorePopup {
  x: number; y: number; value: number; ttl: number
}

// ─── Full game state ──────────────────────────────────────────────────────────
export interface GameState {
  phase: GamePhase
  gameMode: GameMode
  level: number
  score: number
  score2: number
  highScore: number
  lives: number
  lives2: number
  maze: Maze
  dotsLeft: number
  pacman: PacmanState
  pacman2: PacmanState | null
  ghosts: GhostState[]
  globalMode: 'scatter' | 'chase'
  modeCycleIndex: number
  modeCycleTimer: number
  frightenedGhostCount: number  // sequential eat counter within one pellet
  readyTimer: number            // countdown for READY! phase
  dyingTimer: number            // countdown after life lost before respawn
  levelClearTimer: number
  popups: ScorePopup[]
  // Input
  inputDir: number
  inputDir2: number
  // Speed setting
  speedMultiplier: number
}

// ─── Actions ──────────────────────────────────────────────────────────────────
export type Action =
  | { type: 'START'; level?: number; mode?: GameMode }
  | { type: 'TICK'; dt: number }
  | { type: 'INPUT'; dir: number }
  | { type: 'INPUT_P2'; dir: number }
  | { type: 'SET_GAME_MODE'; mode: GameMode }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART'; level?: number; mode?: GameMode }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'HOME' }
  | { type: 'SYNC_ONLINE_STATE'; state: Partial<GameState> }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeLevelState(
  level: number,
  score: number,
  score2: number,
  highScore: number,
  lives: number,
  lives2: number,
  speedMultiplier = 1.0,
  gameMode: GameMode = 'solo',
): GameState {
  const maze = createMaze()
  const dotsLeft = countDots(maze)
  const lvlIdx = Math.min(level - 1, PACMAN_SPEEDS.length - 1)
  const pSpeed = PACMAN_SPEEDS[lvlIdx]
  const is2Player = gameMode !== 'solo'

  const p1Col = is2Player ? PACMAN1_START.col : PACMAN_START.col
  const pacman = createPacman(pSpeed, p1Col, PACMAN_START.row, 1)
  const pacman2 = is2Player ? createPacman(pSpeed, PACMAN2_START.col, PACMAN_START.row, 2) : null

  return {
    phase: 'ready',
    gameMode,
    level,
    score,
    score2,
    highScore,
    lives,
    lives2,
    maze,
    dotsLeft,
    pacman,
    pacman2,
    ghosts: createInitialGhosts(),
    globalMode: 'scatter',
    modeCycleIndex: 0,
    modeCycleTimer: 0,
    frightenedGhostCount: 0,
    readyTimer: 2.0,
    dyingTimer: 1.5,
    levelClearTimer: 2.0,
    popups: [],
    inputDir: DIR_LEFT,
    inputDir2: DIR_RIGHT,
    speedMultiplier,
  }
}

function resetAfterDeath(
  state: GameState,
  preservedMaze: Maze,
  preservedDots: number,
  p1Died: boolean,
  p2Died: boolean,
): GameState {
  const lvlIdx = Math.min(state.level - 1, PACMAN_SPEEDS.length - 1)
  const pSpeed = PACMAN_SPEEDS[lvlIdx]
  const is2Player = state.gameMode !== 'solo'

  const newLives1 = p1Died ? Math.max(0, state.lives - 1) : state.lives
  const newLives2 = p2Died ? Math.max(0, state.lives2 - 1) : state.lives2

  const p1Col = is2Player ? PACMAN1_START.col : PACMAN_START.col
  const pacman = newLives1 > 0 ? createPacman(pSpeed, p1Col, PACMAN_START.row, 1) : { ...state.pacman, isMoving: false }
  const pacman2 = is2Player && newLives2 > 0 ? createPacman(pSpeed, PACMAN2_START.col, PACMAN_START.row, 2) : null

  return {
    ...state,
    phase: 'ready',
    lives: newLives1,
    lives2: newLives2,
    maze: preservedMaze,
    dotsLeft: preservedDots,
    pacman,
    pacman2,
    ghosts: createInitialGhosts(),
    globalMode: 'scatter',
    modeCycleIndex: 0,
    modeCycleTimer: 0,
    frightenedGhostCount: 0,
    readyTimer: 2.0,
    dyingTimer: 1.5,
    levelClearTimer: 2.0,
    popups: [],
    inputDir: DIR_LEFT,
    inputDir2: DIR_RIGHT,
  }
}

export function createInitialState(): GameState {
  let highScore = 0
  let savedSpeed = 1.0
  try {
    highScore = parseInt(localStorage.getItem('pacman-highscore') ?? '0', 10)
    const spd = localStorage.getItem('pacman-speed-mult')
    if (spd) savedSpeed = parseFloat(spd)
  } catch {}

  return {
    ...makeLevelState(1, 0, 0, highScore, 3, 3, savedSpeed, 'solo'),
    phase: 'start',
  }
}

// Dot thresholds to release ghosts from house
const DOT_RELEASE = [0, 0, 30, 60] // Blinky free, Pinky@0, Inky@30, Clyde@60

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
    case 'RESTART': {
      soundEngine.stopAllContinuous()
      playReady()
      const targetLevel = action.level ?? state.level
      const targetMode = action.mode ?? state.gameMode
      return {
        ...makeLevelState(targetLevel, 0, 0, state.highScore, 3, 3, state.speedMultiplier, targetMode),
        phase: 'ready',
      }
    }

    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.mode,
      }

    case 'PAUSE':
      soundEngine.stopAllContinuous()
      return state.phase === 'playing' ? { ...state, phase: 'paused' } : state

    case 'RESUME':
      return state.phase === 'paused' ? { ...state, phase: 'playing' } : state

    case 'INPUT':
      return {
        ...state,
        inputDir: action.dir,
        pacman: { ...state.pacman, nextDir: action.dir },
      }

    case 'INPUT_P2':
      if (!state.pacman2) return state
      return {
        ...state,
        inputDir2: action.dir,
        pacman2: { ...state.pacman2, nextDir: action.dir },
      }

    case 'SET_SPEED': {
      try {
        localStorage.setItem('pacman-speed-mult', String(action.speed))
      } catch {}
      return { ...state, speedMultiplier: action.speed }
    }

    case 'SET_LEVEL': {
      const lvl = Math.max(1, Math.min(256, action.level))
      return { ...state, level: lvl }
    }

    case 'HOME': {
      soundEngine.stopAllContinuous()
      return {
        ...makeLevelState(state.level, 0, 0, state.highScore, 3, 3, state.speedMultiplier, state.gameMode),
        phase: 'start',
      }
    }

    case 'SYNC_ONLINE_STATE': {
      return {
        ...state,
        ...action.state,
      }
    }

    case 'TICK':
      return tick(state, action.dt)

    default:
      return state
  }
}

// ─── Tick dispatcher ──────────────────────────────────────────────────────────
function tick(state: GameState, dt: number): GameState {
  switch (state.phase) {
    case 'ready': {
      const readyTimer = state.readyTimer - dt
      if (readyTimer <= 0) {
        return { ...state, phase: 'playing', readyTimer: 0 }
      }
      return { ...state, readyTimer }
    }

    case 'dying': {
      const dyingTimer = state.dyingTimer - dt
      let updatedPac = state.pacman
      if (updatedPac.deathFrame >= 0) {
        const { pacman: advancedPac } = updatePacman(updatedPac, state.maze, dt, state.speedMultiplier)
        updatedPac = advancedPac
      }

      let updatedPac2 = state.pacman2
      if (updatedPac2 && updatedPac2.deathFrame >= 0) {
        const { pacman: advancedPac2 } = updatePacman(updatedPac2, state.maze, dt, state.speedMultiplier)
        updatedPac2 = advancedPac2
      }

      if (dyingTimer <= 0) {
        const p1Died = state.pacman.deathFrame >= 0
        const p2Died = state.pacman2 ? state.pacman2.deathFrame >= 0 : false

        const newLives1 = p1Died ? state.lives - 1 : state.lives
        const newLives2 = p2Died ? state.lives2 - 1 : state.lives2

        const isGameOver =
          state.gameMode === 'solo'
            ? newLives1 <= 0
            : newLives1 <= 0 && newLives2 <= 0

        if (isGameOver) {
          try {
            if (state.score > state.highScore) {
              localStorage.setItem('pacman-highscore', String(state.score))
            }
            if (state.score2 > state.highScore) {
              localStorage.setItem('pacman-highscore', String(state.score2))
            }
          } catch {}
          return {
            ...state,
            phase: 'gameover',
            lives: Math.max(0, newLives1),
            lives2: Math.max(0, newLives2),
            highScore: Math.max(state.highScore, state.score, state.score2),
          }
        }

        playReady()
        return resetAfterDeath(state, state.maze, state.dotsLeft, p1Died, p2Died)
      }

      return { ...state, dyingTimer, pacman: updatedPac, pacman2: updatedPac2 }
    }

    case 'levelClear': {
      soundEngine.stopAllContinuous()
      const levelClearTimer = state.levelClearTimer - dt
      if (levelClearTimer <= 0) {
        playReady()
        return makeLevelState(
          state.level + 1,
          state.score,
          state.score2,
          state.highScore,
          state.lives,
          state.lives2,
          state.speedMultiplier,
          state.gameMode,
        )
      }
      return { ...state, levelClearTimer }
    }

    case 'playing':
      return tickPlaying(state, dt)

    default:
      return state
  }
}

function tickPlaying(s: GameState, dt: number): GameState {
  let {
    maze, dotsLeft, score, score2, highScore, lives, lives2,
    pacman, pacman2, ghosts,
    globalMode, modeCycleIndex, modeCycleTimer,
    frightenedGhostCount, popups, level, speedMultiplier,
  } = s

  // ── Ambient sounds: Siren / Frightened / Retreat ──────────────────────────
  const anyEaten = ghosts.some(g => g.mode === 'eaten')
  const anyFrightened = ghosts.some(g => g.mode === 'frightened')

  if (anyEaten) {
    soundEngine.startRetreat()
  } else if (anyFrightened) {
    soundEngine.startFrightened()
  } else {
    soundEngine.startSiren(level)
  }

  // ── Mode cycle (scatter ↔ chase) ─────────────────────────────────────────
  if (!anyFrightened) {
    modeCycleTimer -= dt
    if (modeCycleTimer <= 0) {
      const cycle = getModeCycle(level)
      modeCycleIndex = Math.min(modeCycleIndex + 1, cycle.length - 1)
      modeCycleTimer = cycle[modeCycleIndex]
      globalMode = modeCycleIndex % 2 === 0 ? 'scatter' : 'chase'
      ghosts = ghosts.map(g =>
        g.mode !== 'frightened' && g.mode !== 'eaten' && g.mode !== 'house' && g.mode !== 'leaving'
          ? { ...g, dir: (g.dir + 2) % 4 }
          : g
      )
    }
  }

  const lvlIdx = Math.min(level - 1, PACMAN_SPEEDS.length - 1)
  const pacSpeed = anyFrightened ? PACMAN_FRIGHT_SPEEDS[lvlIdx] : PACMAN_SPEEDS[lvlIdx]

  // ── Update Player 1 ───────────────────────────────────────────────────────
  let atTile1: { col: number; row: number } | null = null
  if (lives > 0 && pacman.deathFrame < 0) {
    const res1 = updatePacman(
      { ...pacman, speed: pacSpeed },
      maze,
      dt,
      speedMultiplier,
    )
    pacman = res1.pacman
    atTile1 = res1.atTile
  }

  // ── Update Player 2 (if active) ───────────────────────────────────────────
  let atTile2: { col: number; row: number } | null = null
  if (pacman2 && lives2 > 0 && pacman2.deathFrame < 0) {
    const res2 = updatePacman(
      { ...pacman2, speed: pacSpeed },
      maze,
      dt,
      speedMultiplier,
    )
    pacman2 = res2.pacman
    atTile2 = res2.atTile
  }

  // Helper for eating dots
  const processEatTile = (tilePos: { col: number; row: number } | null, isP2: boolean) => {
    if (!tilePos) return
    const { col, row } = tilePos
    const tile = getTile(maze, col, row)

    if (isDot(tile)) {
      maze = maze.map(r => [...r])
      setTile(maze, col, row, T_EMPTY)
      dotsLeft--
      if (isP2) score2 += SCORE_DOT
      else score += SCORE_DOT
      playEatDot()

      const eaten = TOTAL_DOTS - dotsLeft
      ghosts = ghosts.map(g =>
        g.mode === 'house' && eaten >= DOT_RELEASE[g.id] ? releaseGhost(g) : g
      )
    } else if (isPellet(tile)) {
      maze = maze.map(r => [...r])
      setTile(maze, col, row, T_EMPTY)
      dotsLeft--
      if (isP2) score2 += SCORE_PELLET
      else score += SCORE_PELLET
      frightenedGhostCount = 0
      playEatPellet()

      const duration = FRIGHT_DURATION[Math.min(level - 1, FRIGHT_DURATION.length - 1)]
      ghosts = ghosts.map(g => frightenGhost(g, duration))
    }
  }

  processEatTile(atTile1, false)
  processEatTile(atTile2, true)

  highScore = Math.max(highScore, score, score2)

  // ── Update ghosts targeting closest active player ────────────────────────
  const blinky = ghosts[BLINKY]
  const blinkyCol = Math.floor(blinky.x / 16)
  const blinkyRow = Math.floor(blinky.y / 16)

  // Find target coordinates from closest alive player
  let targetCol = Math.floor(pacman.x / 16)
  let targetRow = Math.floor(pacman.y / 16)
  let targetDir = pacman.dir

  if (pacman2 && lives2 > 0 && (lives <= 0 || Math.hypot(pacman2.x - blinky.x, pacman2.y - blinky.y) < Math.hypot(pacman.x - blinky.x, pacman.y - blinky.y))) {
    targetCol = Math.floor(pacman2.x / 16)
    targetRow = Math.floor(pacman2.y / 16)
    targetDir = pacman2.dir
  }

  ghosts = ghosts.map(g =>
    updateGhost(
      g, maze, dt, level, dotsLeft,
      targetCol, targetRow, targetDir,
      blinkyCol, blinkyRow, globalMode,
      speedMultiplier,
    )
  )

  // ── Ghost collisions ──────────────────────────────────────────────────────
  let newPhase: GameState['phase'] = 'playing'
  let dyingTimer = 0

  // Decay popups
  popups = popups
    .map(p => ({ ...p, ttl: p.ttl - dt }))
    .filter(p => p.ttl > 0)

  for (let i = 0; i < ghosts.length; i++) {
    const g = ghosts[i]

    // Check collision with Player 1
    const p1Hit = lives > 0 && pacman.deathFrame < 0 && checkGhostCollision(g, pacman.x, pacman.y)
    // Check collision with Player 2
    const p2Hit = pacman2 && lives2 > 0 && pacman2.deathFrame < 0 && checkGhostCollision(g, pacman2.x, pacman2.y)

    if (p1Hit || p2Hit) {
      if (g.mode === 'frightened') {
        const pts = SCORE_GHOST[Math.min(frightenedGhostCount, SCORE_GHOST.length - 1)]
        playEatGhost(pts)
        frightenedGhostCount++
        if (p2Hit && !p1Hit) score2 += pts
        else score += pts
        highScore = Math.max(highScore, score, score2)

        ghosts = [...ghosts]
        ghosts[i] = eatGhost(g)
        popups = [...popups, { x: g.x, y: g.y, value: pts, ttl: 1.5 }]
      } else if (g.mode === 'scatter' || g.mode === 'chase') {
        soundEngine.stopAllContinuous()
        playDeath()
        if (p1Hit) pacman = pacmanDying(pacman)
        if (p2Hit && pacman2) pacman2 = pacmanDying(pacman2)
        newPhase = 'dying'
        dyingTimer = 2.5
        break
      }
    }
  }

  // ── Level clear ───────────────────────────────────────────────────────────
  if (dotsLeft <= 0 && newPhase === 'playing') {
    soundEngine.stopAllContinuous()
    playLevelClear()
    newPhase = 'levelClear'
  }

  // ── Extra life ────────────────────────────────────────────────────────────
  if (Math.floor(score / EXTRA_LIFE_AT) > Math.floor(s.score / EXTRA_LIFE_AT)) {
    lives = Math.min(lives + 1, 5)
    playExtraLife()
  }
  if (Math.floor(score2 / EXTRA_LIFE_AT) > Math.floor(s.score2 / EXTRA_LIFE_AT)) {
    lives2 = Math.min(lives2 + 1, 5)
    playExtraLife()
  }

  return {
    ...s,
    maze, dotsLeft, score, score2, highScore, lives, lives2,
    pacman, pacman2, ghosts, globalMode, modeCycleIndex, modeCycleTimer,
    frightenedGhostCount, popups,
    phase: newPhase,
    dyingTimer: newPhase === 'dying' ? dyingTimer : s.dyingTimer,
    levelClearTimer: newPhase === 'levelClear' ? 2.5 : s.levelClearTimer,
  }
}
