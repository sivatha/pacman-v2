import {
  TILE_SIZE, COLS, ROWS,
  DIR_NONE, DIR_RIGHT, DIR_DOWN, DIR_LEFT, DIR_UP, DIR_VECTORS,
  PACMAN_START, MOUTH_FRAMES, DEATH_FRAMES,
} from './constants'
import { isPassable, isTunnel, tileCenter, pixelToTile, type Maze } from './maze'

export interface PacmanState {
  // Pixel position of center
  x: number
  y: number
  // Current direction of travel
  dir: number
  // Buffered next direction (player input)
  nextDir: number
  // Animation
  mouthFrame: number    // 0..MOUTH_FRAMES, 0=fully open, MOUTH_FRAMES=closed
  mouthClosing: boolean
  deathFrame: number    // -1 = not dying, 0..DEATH_FRAMES-1 = playing death
  // Speed as fraction of baseline tile per frame
  speed: number
  isMoving: boolean
}

export function createPacman(speed: number): PacmanState {
  const { x, y } = tileCenter(PACMAN_START.col, PACMAN_START.row)
  return {
    x, y,
    dir: DIR_LEFT,
    nextDir: DIR_LEFT,
    mouthFrame: 0,
    mouthClosing: false,
    deathFrame: -1,
    speed,
    isMoving: false,
  }
}

/** Pixel distance from Pac-Man center to its current tile center */
function offsetFromCenter(x: number, y: number) {
  const col = Math.floor(x / TILE_SIZE)
  const row = Math.floor(y / TILE_SIZE)
  const cx = col * TILE_SIZE + TILE_SIZE / 2
  const cy = row * TILE_SIZE + TILE_SIZE / 2
  return { col, row, cx, cy, dx: x - cx, dy: y - cy }
}

/** Pixels moved, normalized to 60fps baseline */
function speedPx(speed: number, dt: number, speedMultiplier = 1.0): number {
  const frameScale = dt > 0 ? Math.min(dt * 60, 2.0) : 1.0
  return speed * (TILE_SIZE / 8) * frameScale * speedMultiplier
}

export function updatePacman(
  pacman: PacmanState,
  maze: Maze,
  dt = 1 / 60,
  speedMultiplier = 1.0,
): { pacman: PacmanState; atTile: { col: number; row: number } | null } {
  if (pacman.deathFrame >= 0) {
    const deathFrame = pacman.deathFrame < DEATH_FRAMES ? pacman.deathFrame + 1 : pacman.deathFrame
    return { pacman: { ...pacman, deathFrame, isMoving: false }, atTile: null }
  }

  let { x, y, dir, nextDir, mouthFrame, mouthClosing, speed } = pacman
  const px = speedPx(speed, dt, speedMultiplier)

  const { col, row, cx, cy } = offsetFromCenter(x, y)

  // 1. Instant reverse: if nextDir is directly opposite of current dir, turn immediately!
  const isOpposite = dir !== DIR_NONE && nextDir !== DIR_NONE && (nextDir + 2) % 4 === dir
  if (isOpposite) {
    dir = nextDir
  }

  // 2. Perpendicular turn when near tile center
  if (nextDir !== dir && nextDir !== DIR_NONE && !isOpposite) {
    const { dx, dy } = DIR_VECTORS[nextDir]
    const nextCol = col + dx
    const nextRow = row + dy

    // Check if the target tile in the desired direction is passable
    if (isPassable(maze, nextCol, nextRow, false)) {
      // Check proximity to tile center
      const distToCenter = Math.abs(x - cx) + Math.abs(y - cy)
      if (distToCenter <= px * 1.5 || distToCenter <= 4) {
        dir = nextDir
        // Snap to tile center along the perpendicular axis to align smoothly with corridor
        if (dx !== 0) y = cy
        if (dy !== 0) x = cx
      }
    }
  }

  // 3. Move along current direction
  let isMoving = false
  if (dir !== DIR_NONE) {
    const { dx: mdx, dy: mdy } = DIR_VECTORS[dir]

    // When moving past center toward a wall, stop at center
    const checkCol = mdx > 0 && x >= cx ? col + 1 : mdx < 0 && x <= cx ? col - 1 : col
    const checkRow = mdy > 0 && y >= cy ? row + 1 : mdy < 0 && y <= cy ? row - 1 : row

    const canMoveAhead = isPassable(maze, checkCol, checkRow, false)

    if (canMoveAhead) {
      x += mdx * px
      y += mdy * px
      isMoving = true
    } else {
      // Move only as far as the tile center, then stop
      if (mdx > 0) {
        if (x < cx) { x = Math.min(cx, x + px); isMoving = true }
        else x = cx
      } else if (mdx < 0) {
        if (x > cx) { x = Math.max(cx, x - px); isMoving = true }
        else x = cx
      }
      if (mdy > 0) {
        if (y < cy) { y = Math.min(cy, y + px); isMoving = true }
        else y = cy
      } else if (mdy < 0) {
        if (y > cy) { y = Math.max(cy, y - px); isMoving = true }
        else y = cy
      }
    }
  }

  // 4. Tunnel wrapping (row 14)
  if (isTunnel(row)) {
    if (x < -TILE_SIZE / 2) x = COLS * TILE_SIZE + TILE_SIZE / 2
    else if (x > COLS * TILE_SIZE + TILE_SIZE / 2) x = -TILE_SIZE / 2
  } else {
    // Clamp to canvas borders on non-tunnel rows
    x = Math.max(TILE_SIZE / 2, Math.min((COLS - 0.5) * TILE_SIZE, x))
    y = Math.max(TILE_SIZE / 2, Math.min((ROWS - 0.5) * TILE_SIZE, y))
  }

  // 5. Mouth animation
  if (isMoving) {
    if (mouthClosing) {
      mouthFrame++
      if (mouthFrame >= MOUTH_FRAMES) {
        mouthFrame = MOUTH_FRAMES
        mouthClosing = false
      }
    } else {
      mouthFrame--
      if (mouthFrame <= 0) {
        mouthFrame = 0
        mouthClosing = true
      }
    }
  }

  // Current tile for dot eating
  const currentTile = pixelToTile(x, y)

  return {
    pacman: { ...pacman, x, y, dir, nextDir, mouthFrame, mouthClosing, speed, isMoving },
    atTile: currentTile,
  }
}

export function pacmanDying(pacman: PacmanState): PacmanState {
  return { ...pacman, deathFrame: 0, dir: DIR_NONE, nextDir: DIR_NONE, isMoving: false }
}

export function isDead(pacman: PacmanState): boolean {
  return pacman.deathFrame >= DEATH_FRAMES
}

/** Mouth open angle in radians (0 = closed circle, ~0.25π = open) */
export function mouthAngle(pacman: PacmanState): number {
  if (pacman.deathFrame >= 0) return 0
  const t = pacman.mouthFrame / MOUTH_FRAMES
  return t * 0.25 * Math.PI
}

/** Direction angle in radians for canvas rotation */
export function dirAngle(dir: number): number {
  switch (dir) {
    case DIR_RIGHT: return 0
    case DIR_DOWN:  return Math.PI / 2
    case DIR_LEFT:  return Math.PI
    case DIR_UP:    return -Math.PI / 2
    default:        return 0
  }
}
