import { useEffect, useRef } from 'react'

type LoopCallback = (dt: number) => void

export function useGameLoop(callback: LoopCallback, active: boolean): void {
  const callbackRef = useRef<LoopCallback>(callback)
  const lastTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // Keep callback ref fresh without restarting loop
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
      return
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      // Cap dt at 100ms to prevent spiral-of-death when tab is hidden
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = timestamp
      callbackRef.current(dt)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }, [active])
}
