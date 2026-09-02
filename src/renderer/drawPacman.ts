import { TILE_SIZE, DEATH_FRAMES } from '../game/constants'
import { mouthAngle, dirAngle, type PacmanState } from '../game/pacman'

const PAC_COLOR = '#FFE000'
const PAC_RADIUS = TILE_SIZE * 0.48

export function drawPacman(ctx: CanvasRenderingContext2D, pacman: PacmanState): void {
  const { x, y, deathFrame, dir } = pacman

  ctx.save()
  ctx.translate(x, y)

  if (deathFrame >= 0) {
    // Death animation: pie closes from full circle to nothing
    const progress = deathFrame / DEATH_FRAMES
    const startAngle = progress * Math.PI         // start angle grows
    const endAngle   = 2 * Math.PI - progress * Math.PI  // end angle shrinks
    if (startAngle < endAngle) {
      ctx.fillStyle = PAC_COLOR
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
  ctx.fillStyle = PAC_COLOR
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, PAC_RADIUS, mouth, 2 * Math.PI - mouth)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/** Mini Pac-Man icon for the lives display (drawn at given center) */
export function drawPacmanIcon(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 7): void {
  ctx.fillStyle = PAC_COLOR
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, radius, 0.25 * Math.PI, 1.75 * Math.PI)
  ctx.closePath()
  ctx.fill()
}
