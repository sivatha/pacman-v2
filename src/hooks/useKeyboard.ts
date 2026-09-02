import { useEffect, useCallback } from 'react'
import { DIR_RIGHT, DIR_DOWN, DIR_LEFT, DIR_UP, type GameMode } from '../game/constants'
import { initAudio } from '../game/sounds'

type KeyHandler = (dir: number) => void
type ActionHandler = () => void

const P1_ARROWS: Record<string, number> = {
  ArrowRight: DIR_RIGHT,
  ArrowDown:  DIR_DOWN,
  ArrowLeft:  DIR_LEFT,
  ArrowUp:    DIR_UP,
}

const P2_WASD: Record<string, number> = {
  KeyD: DIR_RIGHT,
  KeyS: DIR_DOWN,
  KeyA: DIR_LEFT,
  KeyW: DIR_UP,
  d: DIR_RIGHT,
  s: DIR_DOWN,
  a: DIR_LEFT,
  w: DIR_UP,
}

export function useKeyboard(
  onDirection: KeyHandler,
  onDirectionP2: KeyHandler | undefined,
  onPauseToggle: ActionHandler,
  onStart: ActionHandler,
  phase: string,
  gameMode: GameMode = 'solo',
): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Resume audio context on any user keypress
      initAudio()

      // When on start screen, any primary key starts the game
      if (phase === 'start') {
        if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) || e.key === ' ') {
          e.preventDefault()
          onStart()
          return
        }
      }

      // Pause toggle
      if (e.code === 'KeyP' || e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        onPauseToggle()
        return
      }

      // Resume on space if paused
      if (phase === 'paused' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault()
        onPauseToggle()
        return
      }

      // Direction keys during ready or playing
      if (phase === 'playing' || phase === 'ready') {
        if (gameMode === 'local') {
          // Dedicated controls: Arrows for P1, WASD for P2
          const p1Dir = P1_ARROWS[e.code] ?? P1_ARROWS[e.key]
          if (p1Dir !== undefined) {
            e.preventDefault()
            onDirection(p1Dir)
            return
          }

          const p2Dir = P2_WASD[e.code] ?? P2_WASD[e.key]
          if (p2Dir !== undefined && onDirectionP2) {
            e.preventDefault()
            onDirectionP2(p2Dir)
            return
          }
        } else {
          // Solo or Online: Arrows and WASD both control the local player
          const dir = (P1_ARROWS[e.code] ?? P1_ARROWS[e.key]) ?? (P2_WASD[e.code] ?? P2_WASD[e.key])
          if (dir !== undefined) {
            e.preventDefault()
            onDirection(dir)
          }
        }
      }
    },
    [onDirection, onDirectionP2, onPauseToggle, onStart, phase, gameMode],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
