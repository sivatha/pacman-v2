import { useEffect, useCallback } from 'react'
import { DIR_RIGHT, DIR_DOWN, DIR_LEFT, DIR_UP } from '../game/constants'
import { initAudio } from '../game/sounds'

type KeyHandler = (dir: number) => void
type ActionHandler = () => void

const KEY_MAP: Record<string, number> = {
  ArrowRight: DIR_RIGHT,
  ArrowDown:  DIR_DOWN,
  ArrowLeft:  DIR_LEFT,
  ArrowUp:    DIR_UP,
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
  onPauseToggle: ActionHandler,
  onStart: ActionHandler,
  phase: string,
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
        const dir = KEY_MAP[e.code] ?? KEY_MAP[e.key]
        if (dir !== undefined) {
          e.preventDefault()
          onDirection(dir)
        }
      }
    },
    [onDirection, onPauseToggle, onStart, phase],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
