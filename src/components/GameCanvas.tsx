import { useRef, useCallback, useEffect } from 'react'
import { CANVAS_W, CANVAS_H, DISPLAY_W, DISPLAY_H } from '../game/constants'
import { type GameState, type Action } from '../game/gameState'
import { drawMaze } from '../renderer/drawMaze'
import { drawPacman } from '../renderer/drawPacman'
import { drawGhosts } from '../renderer/drawGhosts'
import { useGameLoop } from '../hooks/useGameLoop'

interface Props {
  state: GameState
  dispatch: React.Dispatch<Action>
}

export function GameCanvas({ state, dispatch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pelletFlashRef = useRef(false)
  const pelletTimerRef = useRef(0)

  // Game loop is active during ready, playing, dying animation, and level clear flash
  const isActive =
    state.phase === 'ready' ||
    state.phase === 'playing' ||
    state.phase === 'dying' ||
    state.phase === 'levelClear'

  const tick = useCallback(
    (dt: number) => {
      pelletTimerRef.current += dt
      if (pelletTimerRef.current >= 0.2) {
        pelletTimerRef.current = 0
        pelletFlashRef.current = !pelletFlashRef.current
      }
      dispatch({ type: 'TICK', dt })
    },
    [dispatch],
  )

  useGameLoop(tick, isActive)

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // 1. Draw maze walls and dots
    drawMaze(ctx, state.maze, pelletFlashRef.current)

    // 2. READY! banner below ghost house during ready phase
    if (state.phase === 'ready') {
      ctx.fillStyle = '#FFE000'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('READY!', CANVAS_W / 2, 17 * 16 + 12)
    }

    // 3. Level clear flash effect
    if (state.phase === 'levelClear') {
      const flash = Math.floor(state.levelClearTimer * 6) % 2 === 0
      if (flash) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      }
    }

    // 4. Draw ghosts (during ready and playing, and eaten eyes during dying)
    if (state.phase !== 'dying' && state.phase !== 'levelClear') {
      drawGhosts(ctx, state.ghosts)
    }

    // 5. Draw Pac-Man (Player 1)
    if (state.lives > 0 || state.pacman.deathFrame >= 0) {
      drawPacman(ctx, state.pacman)
    }

    // Draw Pac-Man (Player 2 - Ms. Pac-Man)
    if (state.pacman2 && (state.lives2 > 0 || state.pacman2.deathFrame >= 0)) {
      drawPacman(ctx, state.pacman2)
    }

    // 6. Floating score popups (+200, +400, etc.)
    for (const popup of state.popups) {
      const alpha = Math.max(0, Math.min(1, popup.ttl))
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`
      ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(String(popup.value), popup.x, popup.y - (1.5 - popup.ttl) * 16)
    }
  })

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="block bg-black"
      style={{
        width: DISPLAY_W,
        height: DISPLAY_H,
        imageRendering: 'pixelated',
      }}
    />
  )
}
