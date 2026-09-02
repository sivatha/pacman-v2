import {
  SCORE_DOT, SCORE_PELLET, SCORE_GHOST, EXTRA_LIFE_AT,
  TOTAL_DOTS, FRIGHT_DURATION, getModeCycle,
  PACMAN_SPEEDS, PACMAN_FRIGHT_SPEEDS,
  BLINKY, PINKY, INKY, CLYDE,
} from './constants'
import { createMaze, countDots, isDot, isPellet, getTile, setTile, T_EMPTY, type Maze } from './maze'
import { createPacman, updatePacman, pacmanDying, type PacmanState } from './pacman'
import {
  createGhost, updateGhost, frightenGhost, eatGhost, releaseGhost, checkGhostCollision,
  type GhostState,
} from './ghost'
import {
  soundEngine, playEatDot, playEatPellet, playEatGhost,
  playExtraLife, playDeath, playLevelClear, playReady,
} from './sounds'

// ─── Game phase ───────────────────────────────────────────────────────────────
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
  level: number
  score: number
  highScore: number
  lives: number
  maze: Maze
  dotsLeft: number
  pacman: PacmanState
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
  // Speed setting
  speedMultiplier: number
}

// ─── Actions ──────────────────────────────────────────────────────────────────
export type Action =
  | { type: 'START'; level?: number }
  | { type: 'TICK'; dt: number }
  | { type: 'INPUT'; dir: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART'; level?: number }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'HOME' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeLevelState(
  level: number,
  score: number,
  highScore: number,
  lives: number,
  speedMultiplier = 1.0,
): GameState {
  const maze = createMaze()
  const dotsLeft = countDots(maze)
  const lvlIdx = Math.min(level - 1, PACMAN_SPEEDS.length - 1)
  return {
    phase: 'ready',
    level,
    score,
    highScore,
    lives,
    maze,
    dotsLeft,
    pacman: createPacman(PACMAN_SPEEDS[lvlIdx]),
    ghosts: [createGhost(BLINKY), createGhost(PINKY), createGhost(INKY), createGhost(CLYDE)],
    globalMode: 'scatter',
    modeCycleIndex: 0,
    modeCycleTimer: getModeCycle(level)[0],
    frightenedGhostCount: 0,
    readyTimer: 2.0, // 2 seconds of READY!
    dyingTimer: 0,
    levelClearTimer: 0,
    popups: [],
    inputDir: -1,
    speedMultiplier,
  }
}

/** Reset characters to starting positions on life loss WITHOUT erasing remaining dots */
function resetAfterDeath(state: GameState, lives: number): GameState {
  const lvlIdx = Math.min(state.level - 1, PACMAN_SPEEDS.length - 1)
  return {
    ...state,
    phase: 'ready',
    lives,
    pacman: createPacman(PACMAN_SPEEDS[lvlIdx]),
    ghosts: [createGhost(BLINKY), createGhost(PINKY), createGhost(INKY), createGhost(CLYDE)],
    globalMode: 'scatter',
    modeCycleIndex: 0,
    modeCycleTimer: getModeCycle(state.level)[0],
    frightenedGhostCount: 0,
    readyTimer: 1.5,
    dyingTimer: 0,
    popups: [],
    inputDir: -1,
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
    ...makeLevelState(1, 0, highScore, 3, savedSpeed),
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
      return {
        ...makeLevelState(targetLevel, 0, state.highScore, 3, state.speedMultiplier),
        phase: 'ready',
      }
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

    case 'SET_SPEED': {
      try {
        localStorage.setItem('pacman-speed-mult', String(action.speed))
      } catch {}
      return { ...state, speedMultiplier: action.speed }
    }

    case 'SET_LEVEL': {
      const lvl = Math.max(1, Math.min(21, action.level))
      return { ...state, level: lvl }
    }

    case 'HOME': {
      soundEngine.stopAllContinuous()
      return {
        ...makeLevelState(state.level, 0, state.highScore, 3, state.speedMultiplier),
        phase: 'start',
      }
    }

    case 'TICK':
      return tick(state, action.dt)

    default:
      return state
  }
}

function tick(state: GameState, dt: number): GameState {
  switch (state.phase) {
    case 'start':
    case 'gameover':
    case 'paused':
      return state

    case 'ready': {
      const readyTimer = state.readyTimer - dt
      if (readyTimer <= 0) {
        return { ...state, phase: 'playing', readyTimer: 0 }
      }
      return { ...state, readyTimer }
    }

    case 'dying': {
      soundEngine.stopAllContinuous()
      const dyingTimer = state.dyingTimer - dt
      if (dyingTimer <= 0) {
        const lives = state.lives - 1
        if (lives <= 0) {
          const highScore = Math.max(state.score, state.highScore)
          try {
            localStorage.setItem('pacman-highscore', String(highScore))
          } catch {}
          return { ...state, lives: 0, phase: 'gameover', highScore }
        }
        playReady()
        return resetAfterDeath(state, lives)
      }
      // Advance death animation
      const { pacman: updatedPac } = updatePacman(state.pacman, state.maze, dt, state.speedMultiplier)
      return { ...state, dyingTimer, pacman: updatedPac }
    }

    case 'levelClear': {
      soundEngine.stopAllContinuous()
      const levelClearTimer = state.levelClearTimer - dt
      if (levelClearTimer <= 0) {
        playReady()
        return makeLevelState(
          state.level + 1,
          state.score,
          state.highScore,
          state.lives,
          state.speedMultiplier,
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
    maze, dotsLeft, score, highScore, lives, pacman, ghosts,
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
      // Reverse all roaming ghosts on mode change
      ghosts = ghosts.map(g =>
        g.mode !== 'frightened' && g.mode !== 'eaten' && g.mode !== 'house' && g.mode !== 'leaving'
          ? { ...g, dir: (g.dir + 2) % 4 }
          : g
      )
    }
  }

  // ── Update Pac-Man ────────────────────────────────────────────────────────
  const lvlIdx = Math.min(level - 1, PACMAN_SPEEDS.length - 1)
  const pacSpeed = anyFrightened ? PACMAN_FRIGHT_SPEEDS[lvlIdx] : PACMAN_SPEEDS[lvlIdx]
  const { pacman: newPac, atTile } = updatePacman(
    { ...pacman, speed: pacSpeed },
    maze,
    dt,
    speedMultiplier,
  )
  pacman = newPac

  // ── Dot eating ────────────────────────────────────────────────────────────
  if (atTile) {
    const { col, row } = atTile
    const tile = getTile(maze, col, row)

    if (isDot(tile)) {
      maze = maze.map(r => [...r])
      setTile(maze, col, row, T_EMPTY)
      dotsLeft--
      score += SCORE_DOT
      playEatDot()

      // Release ghosts by dots eaten count
      const eaten = TOTAL_DOTS - dotsLeft
      ghosts = ghosts.map(g =>
        g.mode === 'house' && eaten >= DOT_RELEASE[g.id] ? releaseGhost(g) : g
      )
    } else if (isPellet(tile)) {
      maze = maze.map(r => [...r])
      setTile(maze, col, row, T_EMPTY)
      dotsLeft--
      score += SCORE_PELLET
      frightenedGhostCount = 0
      playEatPellet()

      const duration = FRIGHT_DURATION[Math.min(level - 1, FRIGHT_DURATION.length - 1)]
      ghosts = ghosts.map(g => frightenGhost(g, duration))
    }
  }

  if (score > highScore) highScore = score

  // ── Update ghosts ─────────────────────────────────────────────────────────
  const blinky = ghosts[BLINKY]
  const blinkyCol = Math.floor(blinky.x / 16)
  const blinkyRow = Math.floor(blinky.y / 16)
  const pacCol = Math.floor(pacman.x / 16)
  const pacRow = Math.floor(pacman.y / 16)

  ghosts = ghosts.map(g =>
    updateGhost(
      g, maze, dt, level, dotsLeft,
      pacCol, pacRow, pacman.dir,
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
    if (checkGhostCollision(g, pacman.x, pacman.y)) {
      if (g.mode === 'frightened') {
        // Eat ghost
        const pts = SCORE_GHOST[Math.min(frightenedGhostCount, SCORE_GHOST.length - 1)]
        playEatGhost(pts)
        frightenedGhostCount++
        score += pts
        if (score > highScore) highScore = score

        ghosts = [...ghosts]
        ghosts[i] = eatGhost(g)
        popups = [...popups, { x: g.x, y: g.y, value: pts, ttl: 1.5 }]
      } else if (g.mode === 'scatter' || g.mode === 'chase') {
        // Pac-Man dies
        soundEngine.stopAllContinuous()
        playDeath()
        pacman = pacmanDying(pacman)
        newPhase = 'dying'
        dyingTimer = 2.5 // Death animation + brief pause
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
  const prevScore = s.score
  if (Math.floor(score / EXTRA_LIFE_AT) > Math.floor(prevScore / EXTRA_LIFE_AT)) {
    lives = Math.min(lives + 1, 5)
    playExtraLife()
  }

  return {
    ...s,
    maze, dotsLeft, score, highScore, lives,
    pacman, ghosts, globalMode, modeCycleIndex, modeCycleTimer,
    frightenedGhostCount, popups,
    phase: newPhase,
    dyingTimer: newPhase === 'dying' ? dyingTimer : s.dyingTimer,
    levelClearTimer: newPhase === 'levelClear' ? 2.5 : s.levelClearTimer,
  }
}
