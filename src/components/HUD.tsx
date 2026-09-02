import { drawPacmanIcon } from '../renderer/drawPacman'
import { Icon } from './Icon'
import { useEffect, useRef } from 'react'

interface Props {
  score: number
  score2?: number
  highScore: number
  lives: number
  lives2?: number
  is2Player?: boolean
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
  score2 = 0,
  highScore,
  lives,
  lives2 = 0,
  is2Player = false,
  level,
  soundMuted,
  speedMultiplier,
  onToggleSound,
  onTogglePause,
  onCycleSpeed,
  isPaused,
}: Props) {
  const livesCanvasRef = useRef<HTMLCanvasElement>(null)
  const lives2CanvasRef = useRef<HTMLCanvasElement>(null)

  // Draw Player 1 Lives
  useEffect(() => {
    const canvas = livesCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < Math.max(0, lives - 1); i++) {
      drawPacmanIcon(ctx, 8 + i * 16, 10, 6, '#FFE000')
    }
  }, [lives])

  // Draw Player 2 Lives (Pink)
  useEffect(() => {
    const canvas = lives2CanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < Math.max(0, lives2 - 1); i++) {
      drawPacmanIcon(ctx, 8 + i * 16, 10, 6, '#FF69B4')
    }
  }, [lives2])

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 bg-black text-yellow-300 select-none w-full border-b border-blue-950 text-xs"
      style={{ fontFamily: 'monospace' }}
    >
      {/* 1UP Score & Lives */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 font-bold text-[10px] tracking-wider">1UP</span>
          <canvas ref={livesCanvasRef} width={40} height={16} className="inline-block" />
        </div>
        <span className="text-yellow-300 font-bold text-xs tracking-widest">{String(score).padStart(6, '0')}</span>
      </div>

      {/* 2UP Score & Lives (in 2-Player mode) */}
      {is2Player && (
        <div className="flex flex-col items-start border-l border-neutral-800 pl-2">
          <div className="flex items-center gap-1.5">
            <span className="text-pink-400 font-bold text-[10px] tracking-wider">2UP</span>
            <canvas ref={lives2CanvasRef} width={40} height={16} className="inline-block" />
          </div>
          <span className="text-pink-300 font-bold text-xs tracking-widest">{String(score2).padStart(6, '0')}</span>
        </div>
      )}

      {/* HIGH SCORE */}
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-[10px] tracking-wider">HIGH</span>
        <span className="text-white font-bold text-xs tracking-widest">{String(highScore).padStart(6, '0')}</span>
      </div>

      {/* Level */}
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-[10px] tracking-wider">LVL</span>
        <span className="text-cyan-400 font-bold text-xs">{level}</span>
      </div>

      {/* Single player lives (when not 2P) */}
      {!is2Player && (
        <div className="flex flex-col items-center">
          <span className="text-neutral-400 text-[10px] tracking-wider">LIVES</span>
          <canvas ref={livesCanvasRef} width={48} height={16} className="block" />
        </div>
      )}

      {/* Controls: Speed, Mute & Pause */}
      <div className="flex items-center gap-1">
        {/* Speed Toggle */}
        <button
          onClick={onCycleSpeed}
          title="Click to cycle game speed (1.0x / 1.25x / 1.5x)"
          className="px-1 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-emerald-400 cursor-pointer transition-colors flex items-center gap-0.5"
        >
          <Icon name="speed" size={12} />
          <span>{speedMultiplier}x</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundMuted ? 'Unmute sound' : 'Mute sound'}
          className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white cursor-pointer transition-colors flex items-center justify-center"
        >
          <Icon name={soundMuted ? 'volume_off' : 'volume_up'} size={14} />
        </button>

        {/* Pause Toggle */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Resume game' : 'Pause game'}
          className="px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-yellow-300 cursor-pointer transition-colors flex items-center justify-center"
        >
          <Icon name={isPaused ? 'play_arrow' : 'pause'} size={14} fill />
        </button>
      </div>
    </div>
  )
}
