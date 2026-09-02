import { TILE_SIZE, DEATH_FRAMES } from '../game/constants'
import { mouthAngle, dirAngle, type PacmanState } from '../game/pacman'

const DEFAULT_PAC_COLOR = '#FFE000'
const PAC_RADIUS = TILE_SIZE * 0.48

export function drawPacman(ctx: CanvasRenderingContext2D, pacman: PacmanState): void {
  const { x, y, deathFrame, dir } = pacman
  const playerColor = pacman.color || (pacman.playerId === 2 ? '#FF69B4' : DEFAULT_PAC_COLOR)

  ctx.save()
  ctx.translate(x, y)

  if (deathFrame >= 0) {
    // Death animation: pie closes from full circle to nothing
    const progress = deathFrame / DEATH_FRAMES
    const startAngle = progress * Math.PI         // start angle grows
    const endAngle   = 2 * Math.PI - progress * Math.PI  // end angle shrinks
    if (startAngle < endAngle) {
      ctx.fillStyle = playerColor
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, PAC_RADIUS, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
    return
  }

  // Normal — rotating mouth
  const angle = dirAngle(dir)
  ctx.rotate(angle)

  const mouth = mouthAngle(pacman)
  ctx.fillStyle = playerColor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, PAC_RADIUS, mouth, 2 * Math.PI - mouth)
  ctx.closePath()
  ctx.fill()

  // Draw Ms. Pac-Man cute red bow for Player 2
  if (pacman.playerId === 2) {
    ctx.fillStyle = '#FF0033'
    // Bow center knot
    ctx.beginPath()
    ctx.arc(0, -PAC_RADIUS * 0.85, 2, 0, Math.PI * 2)
    ctx.fill()
    // Left ribbon loop
    ctx.beginPath()
    ctx.moveTo(0, -PAC_RADIUS * 0.85)
    ctx.lineTo(-4, -PAC_RADIUS * 1.25)
    ctx.lineTo(-4, -PAC_RADIUS * 0.5)
    ctx.closePath()
    ctx.fill()
    // Right ribbon loop
    ctx.beginPath()
    ctx.moveTo(0, -PAC_RADIUS * 0.85)
    ctx.lineTo(4, -PAC_RADIUS * 1.25)
    ctx.lineTo(4, -PAC_RADIUS * 0.5)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

/** Mini Pac-Man icon for lives display */
export function drawPacmanIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 7,
  color = DEFAULT_PAC_COLOR,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, radius, 0.25 * Math.PI, 1.75 * Math.PI)
  ctx.closePath()
  ctx.fill()
}
