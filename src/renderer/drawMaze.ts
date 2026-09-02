import { TILE_SIZE, COLS, ROWS, T_WALL, T_DOT, T_PELLET, T_DOOR, T_HOUSE } from '../game/constants'
import { type Maze } from '../game/maze'

const BG_COLOR = '#000000'
const WALL_OUTLINE = '#2121ff'      // Authentic arcade neon blue
const WALL_OUTLINE_GLOW = '#4242ff' // Subtle outer neon glow
const WALL_FILL = '#000014'         // Deep navy/black wall interior
const DOT_COLOR = '#ffb8ae'         // Classic warm arcade dot
const PELLET_COLOR = '#ffb8ae'      // Classic power pellet
const DOOR_COLOR = '#ffb8ff'        // Ghost house pink door
const HOUSE_BG = '#000010'          // Ghost house interior tint

function isWallTile(maze: Maze, col: number, row: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true
  return maze[row][col] === T_WALL
}

function drawWallCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  maze: Maze,
): void {
  const x = col * TILE_SIZE
  const y = row * TILE_SIZE
  const s = TILE_SIZE

  // Deep dark wall interior
  ctx.fillStyle = WALL_FILL
  ctx.fillRect(x, y, s, s)

  // Check neighbor tiles to find open corridors
  const top    = !isWallTile(maze, col, row - 1)
  const bottom = !isWallTile(maze, col, row + 1)
  const left   = !isWallTile(maze, col - 1, row)
  const right  = !isWallTile(maze, col + 1, row)

  // Draw vibrant neon blue boundary lines facing corridors
  ctx.strokeStyle = WALL_OUTLINE
  ctx.lineWidth = 2.5
  ctx.lineCap = 'square'

  // Outer edge strokes
  if (top) {
    ctx.beginPath()
    ctx.moveTo(x, y + 1.25)
    ctx.lineTo(x + s, y + 1.25)
    ctx.stroke()
  }
  if (bottom) {
    ctx.beginPath()
    ctx.moveTo(x, y + s - 1.25)
    ctx.lineTo(x + s, y + s - 1.25)
    ctx.stroke()
  }
  if (left) {
    ctx.beginPath()
    ctx.moveTo(x + 1.25, y)
    ctx.lineTo(x + 1.25, y + s)
    ctx.stroke()
  }
  if (right) {
    ctx.beginPath()
    ctx.moveTo(x + s - 1.25, y)
    ctx.lineTo(x + s - 1.25, y + s)
    ctx.stroke()
  }

  // Inner corner fillets (when two adjacent edges are open, connect them cleanly)
  const tl = !isWallTile(maze, col - 1, row - 1)
  const tr = !isWallTile(maze, col + 1, row - 1)
  const bl = !isWallTile(maze, col - 1, row + 1)
  const br = !isWallTile(maze, col + 1, row + 1)

  // Diagonal corner points
  if (!top && !left && tl) {
    ctx.fillStyle = WALL_OUTLINE_GLOW
    ctx.fillRect(x, y, 2.5, 2.5)
  }
  if (!top && !right && tr) {
    ctx.fillStyle = WALL_OUTLINE_GLOW
    ctx.fillRect(x + s - 2.5, y, 2.5, 2.5)
  }
  if (!bottom && !left && bl) {
    ctx.fillStyle = WALL_OUTLINE_GLOW
    ctx.fillRect(x, y + s - 2.5, 2.5, 2.5)
  }
  if (!bottom && !right && br) {
    ctx.fillStyle = WALL_OUTLINE_GLOW
    ctx.fillRect(x + s - 2.5, y + s - 2.5, 2.5, 2.5)
  }
}

export function drawMaze(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  pelletFlash: boolean,
): void {
  // 1. Clear with pitch black arcade background
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = maze[row][col]
      const x = col * TILE_SIZE
      const y = row * TILE_SIZE
      const cx = x + TILE_SIZE / 2
      const cy = y + TILE_SIZE / 2

      if (tile === T_WALL) {
        drawWallCell(ctx, col, row, maze)
      } else if (tile === T_HOUSE) {
        // Ghost house interior
        ctx.fillStyle = HOUSE_BG
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
      } else if (tile === T_DOOR) {
        // Ghost house pink entrance door
        ctx.fillStyle = DOOR_COLOR
        ctx.fillRect(x, y + TILE_SIZE / 2 - 2, TILE_SIZE, 4)
      } else if (tile === T_DOT) {
        // Classic pac-dot
        ctx.fillStyle = DOT_COLOR
        ctx.beginPath()
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
        ctx.fill()
      } else if (tile === T_PELLET) {
        // Flashing power pellet
        if (!pelletFlash) {
          ctx.fillStyle = PELLET_COLOR
          ctx.beginPath()
          ctx.arc(cx, cy, 6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}
