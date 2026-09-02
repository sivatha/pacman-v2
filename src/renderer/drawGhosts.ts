import { TILE_SIZE, GHOST_COLORS } from '../game/constants'
import { type GhostState } from '../game/ghost'

const FRIGHT_COLOR = '#0000CC'
const FRIGHT_FLASH = '#FFFFFF'
const EATEN_EYE_COLOR = '#FFFFFF'
const EATEN_PUPIL = '#0000CC'

function drawGhostBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string,
): void {
  const r = TILE_SIZE * 0.46
  const bottom = y + r

  ctx.fillStyle = color
  ctx.beginPath()
  // Dome top
  ctx.arc(x, y - r * 0.1, r, Math.PI, 0, false)
  // Right side down
  ctx.lineTo(x + r, bottom)
  // Wavy bottom skirt (3 bumps)
  const bumpW = (r * 2) / 3
  for (let i = 2; i >= 0; i--) {
    const bx = x - r + i * bumpW + bumpW / 2
    ctx.quadraticCurveTo(bx + bumpW / 4, bottom + r * 0.35, bx, bottom)
    ctx.quadraticCurveTo(bx - bumpW / 4, bottom + r * 0.35, bx - bumpW / 2, bottom)
  }
  ctx.lineTo(x - r, bottom)
  ctx.closePath()
  ctx.fill()
}

function drawGhostEyes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dir: number,
): void {
  const eyeR = TILE_SIZE * 0.12
  const pupilR = eyeR * 0.65
  const eyeOffX = TILE_SIZE * 0.13
  const eyeY = y - TILE_SIZE * 0.1

  // Pupil offset by direction
  const pOffsets: Record<number, [number, number]> = {
    0: [pupilR * 0.7, 0],   // right
    1: [0, pupilR * 0.7],   // down
    2: [-pupilR * 0.7, 0],  // left
    3: [0, -pupilR * 0.7],  // up
  }
  const [pox, poy] = pOffsets[dir] ?? [0, 0]

  for (const ex of [x - eyeOffX, x + eyeOffX]) {
    ctx.fillStyle = EATEN_EYE_COLOR
    ctx.beginPath()
    ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = EATEN_PUPIL
    ctx.beginPath()
    ctx.arc(ex + pox, eyeY + poy, pupilR, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEatenGhost(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number): void {
  // Just the eyes
  drawGhostEyes(ctx, x, y, dir)
}

function drawFrightenedFace(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Two white dots for eyes
  ctx.fillStyle = FRIGHT_FLASH
  ctx.beginPath()
  ctx.arc(x - TILE_SIZE * 0.12, y - TILE_SIZE * 0.05, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + TILE_SIZE * 0.12, y - TILE_SIZE * 0.05, 2, 0, Math.PI * 2)
  ctx.fill()
  // Wavy mouth
  ctx.strokeStyle = FRIGHT_FLASH
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const my = y + TILE_SIZE * 0.1
  ctx.moveTo(x - TILE_SIZE * 0.18, my)
  ctx.quadraticCurveTo(x - TILE_SIZE * 0.09, my + 3, x, my)
  ctx.quadraticCurveTo(x + TILE_SIZE * 0.09, my - 3, x + TILE_SIZE * 0.18, my)
  ctx.stroke()
}

export function drawGhosts(ctx: CanvasRenderingContext2D, ghosts: GhostState[]): void {
  for (const ghost of ghosts) {
    const { x, y, id, mode, dir, frightenedFlash } = ghost

    if (mode === 'eaten') {
      drawEatenGhost(ctx, x, y, dir)
      continue
    }

    let color: string
    if (mode === 'frightened') {
      color = frightenedFlash ? FRIGHT_FLASH : FRIGHT_COLOR
    } else {
      color = GHOST_COLORS[id]
    }

    drawGhostBody(ctx, x, y, color)

    if (mode === 'frightened') {
      if (!frightenedFlash) drawFrightenedFace(ctx, x, y)
    } else {
      drawGhostEyes(ctx, x, y, dir)
    }
  }
}
