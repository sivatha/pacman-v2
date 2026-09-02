import {
  TILE_SIZE, COLS,
  DIR_NONE, DIR_RIGHT, DIR_DOWN, DIR_LEFT, DIR_UP, DIR_VECTORS,
  BLINKY, PINKY, INKY, CLYDE,
  SCATTER_TARGETS, GHOST_HOME_COLS, GHOST_HOME_ROWS,
  GHOST_SPEEDS, GHOST_TUNNEL_SPEEDS, GHOST_FRIGHT_SPEEDS, GHOST_EATEN_SPEED,
  ELROY1_DOTS, ELROY2_DOTS, ELROY1_SPEED, ELROY2_SPEED,
  T_WALL, T_DOOR, T_HOUSE,
} from './constants'
import { isTunnel, tileCenter, getTile, type Maze } from './maze'

// ─── Ghost modes ─────────────────────────────────────────────────────────────
export type GhostMode = 'scatter' | 'chase' | 'frightened' | 'eaten' | 'house' | 'leaving'

export interface GhostState {
  id: number          // BLINKY | PINKY | INKY | CLYDE
  x: number           // pixel center x
  y: number           // pixel center y
  dir: number         // current direction
  mode: GhostMode
  frightenedTimer: number   // seconds remaining
  frightenedFlash: boolean  // true when about to end (last 2 sec)
  dotCounter: number        // personal dot counter
  houseTimer: number        // used during 'house' oscillation
  leaveStep: number         // step index for leaving sequence
  lastTile: { col: number; row: number }
}

export function createGhost(id: number): GhostState {
  const { x, y } = tileCenter(GHOST_HOME_COLS[id], GHOST_HOME_ROWS[id])
  return {
    id, x, y,
    dir: id === BLINKY ? DIR_LEFT : DIR_UP,
    mode: id === BLINKY ? 'scatter' : 'house',
    frightenedTimer: 0,
    frightenedFlash: false,
    dotCounter: 0,
    houseTimer: 0,
    leaveStep: 0,
    lastTile: { col: -1, row: -1 },
  }
}

export function createInitialGhosts(): GhostState[] {
  return [
    createGhost(BLINKY),
    createGhost(PINKY),
    createGhost(INKY),
    createGhost(CLYDE),
  ]
}

// ─── Euclidean distance² between tiles ───────────────────────────────────────
function dist2(c1: number, r1: number, c2: number, r2: number): number {
  return (c1 - c2) ** 2 + (r1 - r2) ** 2
}

// ─── Passability check for ghosts ───────────────────────────────────────────
function isGhostPassable(maze: Maze, col: number, row: number, ghostMode: GhostMode): boolean {
  const t = getTile(maze, col, row)
  if (t === T_WALL) return false
  // Only eaten eyes or leaving ghosts may pass through door
  if (t === T_DOOR) return ghostMode === 'eaten' || ghostMode === 'leaving' || ghostMode === 'house'
  if (t === T_HOUSE) return ghostMode === 'eaten' || ghostMode === 'leaving' || ghostMode === 'house'
  return true
}

// ─── Target tile calculation per ghost ───────────────────────────────────────
function getChaseTarget(
  id: number,
  pacCol: number, pacRow: number, pacDir: number,
  blinkyCol: number, blinkyRow: number,
  selfCol: number, selfRow: number,
): { col: number; row: number } {
  const { dx, dy } = pacDir !== DIR_NONE ? (DIR_VECTORS[pacDir] ?? { dx: 0, dy: 0 }) : { dx: 0, dy: 0 }

  switch (id) {
    case BLINKY:
      return { col: pacCol, row: pacRow }

    case PINKY: {
      // 4 tiles ahead of Pacman
      const ahead = 4
      if (pacDir === DIR_UP) return { col: pacCol - ahead, row: pacRow - ahead }
      return { col: pacCol + dx * ahead, row: pacRow + dy * ahead }
    }

    case INKY: {
      // 2 tiles ahead of Pac-Man, then double vector from Blinky
      const midCol = pacCol + dx * 2
      const midRow = pacRow + dy * 2
      return { col: midCol + (midCol - blinkyCol), row: midRow + (midRow - blinkyRow) }
    }

    case CLYDE: {
      // If > 8 tiles away: target Pac-Man; else: retreat to bottom-left corner
      const d2 = dist2(selfCol, selfRow, pacCol, pacRow)
      if (d2 > 64) return { col: pacCol, row: pacRow }
      return SCATTER_TARGETS[CLYDE]
    }

    default:
      return { col: pacCol, row: pacRow }
  }
}

function ghostSpeedPx(
  ghost: GhostState,
  level: number,
  inTunnel: boolean,
  dotsLeft: number,
  dt: number,
  speedMultiplier = 1.0,
): number {
  const lvl = Math.min(level - 1, GHOST_SPEEDS.length - 1)
  let spd: number

  if (ghost.mode === 'eaten') {
    spd = GHOST_EATEN_SPEED
  } else if (ghost.mode === 'frightened') {
    spd = GHOST_FRIGHT_SPEEDS[lvl]
  } else if (inTunnel) {
    spd = GHOST_TUNNEL_SPEEDS[lvl]
  } else if (ghost.id === BLINKY) {
    if (dotsLeft <= ELROY2_DOTS[lvl]) spd = ELROY2_SPEED
    else if (dotsLeft <= ELROY1_DOTS[lvl]) spd = ELROY1_SPEED
    else spd = GHOST_SPEEDS[lvl]
  } else {
    spd = GHOST_SPEEDS[lvl]
  }

  const frameScale = dt > 0 ? Math.min(dt * 60, 2.0) : 1.0
  return spd * (TILE_SIZE / 8) * frameScale * speedMultiplier
}

// ─── Choose direction at intersection ────────────────────────────────────────
const ALL_DIRS = [DIR_UP, DIR_LEFT, DIR_DOWN, DIR_RIGHT] // Original arcade priority: Up, Left, Down, Right

function chooseDirection(
  ghost: GhostState,
  maze: Maze,
  col: number,
  row: number,
  targetCol: number,
  targetRow: number,
): number {
  const opposite = (ghost.dir + 2) % 4
  let bestDir = DIR_NONE
  let bestDist = Infinity

  for (const d of ALL_DIRS) {
    if (d === opposite) continue // No 180-degree reversing unless mode forced it
    const { dx, dy } = DIR_VECTORS[d]
    const nc = col + dx
    const nr = row + dy

    if (!isGhostPassable(maze, nc, nr, ghost.mode)) continue

    const d2 = dist2(nc, nr, targetCol, targetRow)
    if (d2 < bestDist) {
      bestDist = d2
      bestDir = d
    }
  }

  return bestDir === DIR_NONE ? (ghost.dir !== DIR_NONE ? ghost.dir : DIR_LEFT) : bestDir
}

function randomDirection(ghost: GhostState, maze: Maze, col: number, row: number): number {
  const opposite = (ghost.dir + 2) % 4
  const valid = ALL_DIRS.filter(d => {
    if (d === opposite) return false
    const { dx, dy } = DIR_VECTORS[d]
    return isGhostPassable(maze, col + dx, row + dy, ghost.mode)
  })

  if (valid.length === 0) return opposite
  return valid[Math.floor(Math.random() * valid.length)]
}

// ─── House oscillation ────────────────────────────────────────────────────────
function updateHouseGhost(ghost: GhostState, dt: number): GhostState {
  const homeY = tileCenter(GHOST_HOME_COLS[ghost.id], GHOST_HOME_ROWS[ghost.id]).y
  const amplitude = TILE_SIZE * 0.4
  const timer = ghost.houseTimer + dt
  const y = homeY + Math.sin(timer * 4) * amplitude
  return { ...ghost, y, houseTimer: timer }
}

// ─── Leaving house sequence ──────────────────────────────────────────────────
// Step 0: move horizontally to center column (14)
// Step 1: move vertically up through door to open corridor at row 11
const HOUSE_EXIT_TARGETS = [
  { col: 14, row: 14 },
  { col: 14, row: 11 },
]

function updateLeavingGhost(ghost: GhostState, px: number): GhostState {
  const target = HOUSE_EXIT_TARGETS[ghost.leaveStep] ?? HOUSE_EXIT_TARGETS[1]
  const targetX = tileCenter(target.col, 0).x
  const targetY = tileCenter(0, target.row).y

  let { x, y, leaveStep } = ghost

  if (leaveStep === 0) {
    // Center horizontally first
    if (Math.abs(x - targetX) > px) {
      x += x < targetX ? px : -px
    } else {
      x = targetX
      leaveStep = 1
    }
  } else if (leaveStep === 1) {
    // Move up through the door to row 11
    if (y > targetY + px) {
      y -= px
    } else {
      y = targetY
      // Free into maze! Start moving left
      return {
        ...ghost,
        x, y,
        leaveStep: 0,
        mode: 'scatter',
        dir: DIR_LEFT,
        lastTile: { col: 14, row: 11 },
      }
    }
  }

  return { ...ghost, x, y, leaveStep }
}

// ─── Main ghost update ────────────────────────────────────────────────────────
export function updateGhost(
  ghost: GhostState,
  maze: Maze,
  dt: number,
  level: number,
  dotsLeft: number,
  pacCol: number, pacRow: number, pacDir: number,
  blinkyCol: number, blinkyRow: number,
  globalMode: 'scatter' | 'chase',
  speedMultiplier = 1.0,
): GhostState {
  if (ghost.mode === 'house') {
    return updateHouseGhost(ghost, dt)
  }

  const col = Math.floor(ghost.x / TILE_SIZE)
  const row = Math.floor(ghost.y / TILE_SIZE)
  const inTunnel = isTunnel(row)
  const px = ghostSpeedPx(ghost, level, inTunnel, dotsLeft, dt, speedMultiplier)

  if (ghost.mode === 'leaving') {
    return updateLeavingGhost(ghost, px)
  }

  // Handle frightened timer
  let { frightenedTimer, frightenedFlash, mode } = ghost
  if (mode === 'frightened') {
    frightenedTimer -= dt
    frightenedFlash = frightenedTimer < 2.0 && Math.floor(frightenedTimer * 5) % 2 === 0
    if (frightenedTimer <= 0) {
      mode = globalMode
      frightenedTimer = 0
      frightenedFlash = false
    }
  }

  // Handle eaten mode: target the ghost house door at (14, 11)
  if (mode === 'eaten') {
    const doorX = tileCenter(14, 11).x
    const doorY = tileCenter(14, 11).y
    const distToDoor = Math.abs(ghost.x - doorX) + Math.abs(ghost.y - doorY)

    if (distToDoor < px * 2 || (col === 14 && (row === 11 || row === 12))) {
      // Reached door, immediately re-enter and exit
      return {
        ...ghost,
        x: doorX,
        y: doorY,
        mode: 'leaving',
        leaveStep: 1, // Ready to leave again
        frightenedTimer: 0,
        frightenedFlash: false,
        dir: DIR_UP,
      }
    }
  }

  // Target tile based on mode
  let targetCol: number
  let targetRow: number

  if (mode === 'eaten') {
    targetCol = 14
    targetRow = 11
  } else if (mode === 'frightened') {
    targetCol = -1
    targetRow = -1
  } else if (mode === 'scatter') {
    targetCol = SCATTER_TARGETS[ghost.id].col
    targetRow = SCATTER_TARGETS[ghost.id].row
  } else {
    // Chase mode
    const target = getChaseTarget(ghost.id, pacCol, pacRow, pacDir, blinkyCol, blinkyRow, col, row)
    targetCol = target.col
    targetRow = target.row
  }

  // Intersection decision at tile center
  const cx = col * TILE_SIZE + TILE_SIZE / 2
  const cy = row * TILE_SIZE + TILE_SIZE / 2
  const distFromCenter = Math.abs(ghost.x - cx) + Math.abs(ghost.y - cy)
  const isNewTile = ghost.lastTile.col !== col || ghost.lastTile.row !== row
  let { dir, lastTile } = ghost

  if (distFromCenter <= px * 1.2 && isNewTile) {
    // Snap to center for clean turning
    ghost.x = cx
    ghost.y = cy
    lastTile = { col, row }

    if (mode === 'frightened') {
      dir = randomDirection(ghost, maze, col, row)
    } else {
      dir = chooseDirection(ghost, maze, col, row, targetCol, targetRow)
    }
  }

  // Move
  const { dx, dy } = DIR_VECTORS[dir] ?? { dx: 0, dy: 0 }
  let { x, y } = ghost
  x += dx * px
  y += dy * px

  // Tunnel wrap
  if (isTunnel(row)) {
    if (x < -TILE_SIZE / 2) x = COLS * TILE_SIZE + TILE_SIZE / 2
    else if (x > COLS * TILE_SIZE + TILE_SIZE / 2) x = -TILE_SIZE / 2
  }

  return { ...ghost, x, y, dir, mode, frightenedTimer, frightenedFlash, lastTile }
}

// ─── Trigger frightened mode ──────────────────────────────────────────────────
export function frightenGhost(ghost: GhostState, duration: number): GhostState {
  if (ghost.mode === 'eaten' || ghost.mode === 'house' || ghost.mode === 'leaving') return ghost
  return {
    ...ghost,
    mode: 'frightened',
    frightenedTimer: duration,
    frightenedFlash: false,
    dir: (ghost.dir + 2) % 4, // Reverse direction on power pellet
  }
}

// ─── Ghost eaten ──────────────────────────────────────────────────────────────
export function eatGhost(ghost: GhostState): GhostState {
  return { ...ghost, mode: 'eaten', frightenedTimer: 0, frightenedFlash: false }
}

// ─── Release ghost from house ─────────────────────────────────────────────────
export function releaseGhost(ghost: GhostState): GhostState {
  if (ghost.mode !== 'house') return ghost
  return { ...ghost, mode: 'leaving', leaveStep: 0 }
}

// ─── Collision detection with Pac-Man ────────────────────────────────────────
export function checkGhostCollision(ghost: GhostState, px: number, py: number): boolean {
  if (ghost.mode === 'house' || ghost.mode === 'leaving' || ghost.mode === 'eaten') return false
  const dx = ghost.x - px
  const dy = ghost.y - py
  return dx * dx + dy * dy < (TILE_SIZE * 0.75) ** 2
}
