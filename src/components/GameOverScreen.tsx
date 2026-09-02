import { Icon } from './Icon'

interface Props {
  score: number
  highScore: number
  level: number
  onRestart: () => void
}

export function GameOverScreen({ score, highScore, level, onRestart }: Props) {
  const isNewHigh = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 select-none p-4 backdrop-blur-xs font-mono">
      <Icon name="sentiment_very_dissatisfied" size={48} className="text-red-500 mb-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />

      <h2
        className="text-4xl font-black mb-2 text-red-500 tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
        style={{ fontFamily: 'monospace' }}
      >
        GAME OVER
      </h2>

      {isNewHigh && (
        <div className="flex items-center gap-1.5 text-yellow-300 text-xs mb-3 animate-pulse">
          <Icon name="star" size={16} fill className="text-yellow-400" />
          <span className="font-bold tracking-wider">NEW HIGH SCORE!</span>
          <Icon name="star" size={16} fill className="text-yellow-400" />
        </div>
      )}

      <div className="mb-6 bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 w-56 text-center space-y-1.5 shadow-inner">
        <div className="text-neutral-400 text-xs">
          SCORE: <span className="text-yellow-300 font-bold text-sm">{score.toLocaleString()}</span>
        </div>
        <div className="text-neutral-400 text-xs">
          BEST: <span className="text-white font-bold text-sm">{highScore.toLocaleString()}</span>
        </div>
        <div className="text-cyan-400 text-[11px] pt-1 border-t border-neutral-800 flex items-center justify-center gap-1">
          <Icon name="layers" size={14} />
          <span>REACHED LEVEL {level}</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="py-3 px-6 rounded bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
      >
        <Icon name="replay" size={18} />
        <span>PLAY AGAIN</span>
      </button>
    </div>
  )
}
