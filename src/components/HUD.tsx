import { drawPacmanIcon } from '../renderer/drawPacman'
import { Icon } from './Icon'
import { useEffect, useRef } from 'react'

interface Props {
  score: number
  highScore: number
  lives: number
  level: number
  soundMuted: boolean
  speedMultiplier: number
  onToggleSound: () => void
  onTogglePause: () => void
  onCycleSpeed: () => void
  isPaused: boolean
}

export function HUD({
  score,
  highScore,
  lives,
  level,
  soundMuted,
  speedMultiplier,
  onToggleSound,
  onTogglePause,
  onCycleSpeed,
  isPaused,
}: Props) {
  const livesCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = livesCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < Math.max(0, lives - 1); i++) {
      drawPacmanIcon(ctx, 10 + i * 18, 10, 7)
    }
  }, [lives])

  return (
    <div
      className="flex items-center justify-between px-3 py-2 bg-black text-yellow-300 select-none w-full border-b border-blue-950"
      style={{ fontFamily: 'monospace' }}
    >
      {/* 1UP Score */}
      <div className="flex flex-col items-start">
        <span className="text-neutral-400 text-[10px] tracking-wider">1UP</span>
        <span className="text-yellow-300 font-bold text-sm tracking-widest">{String(score).padStart(6, '0')}</span>
      </div>

      {/* HIGH SCORE */}
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-[10px] tracking-wider">HIGH SCORE</span>
        <span className="text-yellow-300 font-bold text-sm tracking-widest">{String(highScore).padStart(6, '0')}</span>
      </div>

      {/* Level */}
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-[10px] tracking-wider">LVL</span>
        <span className="text-cyan-400 font-bold text-sm">{level}</span>
      </div>

      {/* Lives Canvas */}
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-[10px] tracking-wider">LIVES</span>
        <canvas ref={livesCanvasRef} width={56} height={20} className="block" />
      </div>

      {/* Controls: Speed, Mute & Pause */}
      <div className="flex items-center gap-1.5">
        {/* Speed Toggle */}
        <button
          onClick={onCycleSpeed}
          title="Click to cycle game speed (1.0x / 1.25x / 1.5x)"
          className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-emerald-400 cursor-pointer transition-colors flex items-center gap-0.5"
        >
          <Icon name="speed" size={13} />
          <span>{speedMultiplier}x</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundMuted ? 'Unmute sound' : 'Mute sound'}
          className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white cursor-pointer transition-colors flex items-center justify-center"
        >
          <Icon name={soundMuted ? 'volume_off' : 'volume_up'} size={15} />
        </button>

        {/* Pause Toggle */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume game' : 'Pause game'}
          className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-yellow-300 cursor-pointer transition-colors flex items-center justify-center"
        >
          <Icon name={isPaused ? 'play_arrow' : 'pause'} size={15} fill />
        </button>
      </div>
    </div>
  )
}
