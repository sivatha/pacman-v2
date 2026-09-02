import { Icon } from './Icon'

interface Props {
  onResume: () => void
  onRestart: () => void
}

export function PauseScreen({ onResume, onRestart }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 select-none backdrop-blur-xs">
      <Icon name="pause_circle" size={48} className="text-yellow-400 mb-2 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />

      <h2
        className="text-3xl font-black mb-6 text-yellow-300 tracking-widest"
        style={{ fontFamily: 'monospace', textShadow: '0 0 10px #FFE000' }}
      >
        PAUSED
      </h2>

      <div className="flex flex-col gap-3 w-56 font-mono">
        <button
          onClick={onResume}
          className="py-2.5 px-4 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
        >
          <Icon name="play_arrow" size={20} fill />
          <span>RESUME</span>
        </button>
        <button
          onClick={onRestart}
          className="py-2.5 px-4 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm tracking-wider flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer transition-all"
        >
          <Icon name="restart_alt" size={20} />
          <span>RESTART</span>
        </button>
      </div>

      <p className="mt-6 text-neutral-400 text-xs font-mono">
        Press P or ESC to resume
      </p>
    </div>
  )
}
