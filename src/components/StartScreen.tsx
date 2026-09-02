import { initAudio } from '../game/sounds'
import { Icon } from './Icon'

interface Props {
  onStart: () => void
  currentLevel: number
  onSelectLevel: (lvl: number) => void
  speedMultiplier: number
  onSelectSpeed: (spd: number) => void
  onOpenDeveloper: () => void
}

export function StartScreen({
  onStart,
  currentLevel,
  onSelectLevel,
  speedMultiplier,
  onSelectSpeed,
  onOpenDeveloper,
}: Props) {
  const handleClick = () => {
    initAudio()
    onStart()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 select-none p-4 backdrop-blur-xs">
      {/* Title */}
      <div className="mb-4 text-center">
        <h1
          className="text-5xl font-black tracking-widest mb-1 text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.8)]"
          style={{ fontFamily: 'monospace' }}
        >
          PAC-MAN
        </h1>
        <p className="text-blue-400 text-xs tracking-widest font-mono uppercase">
          React 19.2 • Vite 8.2 • Tailwind 4.3
        </p>
      </div>

      {/* Character Ghost Roster */}
      <div className="mb-4 bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 w-72 space-y-1.5 font-mono text-xs shadow-inner">
        {[
          { color: '#FF0000', name: 'BLINKY', nick: '"SHADOW"' },
          { color: '#FFB8FF', name: 'PINKY',  nick: '"SPEEDY"' },
          { color: '#00FFFF', name: 'INKY',   nick: '"BASHFUL"' },
          { color: '#FFB852', name: 'CLYDE',  nick: '"POKEY"' },
        ].map(g => (
          <div key={g.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-t-full rounded-b-xs"
                style={{ backgroundColor: g.color, boxShadow: `0 0 8px ${g.color}` }}
              />
              <span className="font-bold" style={{ color: g.color }}>
                {g.name}
              </span>
            </div>
            <span className="text-pink-300 text-[11px]">{g.nick}</span>
          </div>
        ))}
      </div>

      {/* Starting Level & Speed Selectors */}
      <div className="mb-4 flex flex-col gap-2 w-72 font-mono text-xs">
        {/* Level Select */}
        <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded px-2.5 py-1.5">
          <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
            <Icon name="layers" size={14} className="text-cyan-400" />
            <span>START LEVEL:</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 5, 10, 15].map(lvl => (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  currentLevel === lvl
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Select */}
        <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded px-2.5 py-1.5">
          <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
            <Icon name="speed" size={14} className="text-emerald-400" />
            <span>GAME SPEED:</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: '1.0x', val: 1.0 },
              { label: '1.25x', val: 1.25 },
              { label: '1.5x', val: 1.5 },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => onSelectSpeed(s.val)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  speedMultiplier === s.val
                    ? 'bg-emerald-400 text-black shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Big Press Start Button */}
      <button
        onClick={handleClick}
        className="px-10 py-3 rounded bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-lg tracking-wider font-mono shadow-[0_0_20px_rgba(250,204,21,0.6)] cursor-pointer transition-all animate-bounce flex items-center justify-center gap-2"
      >
        <Icon name="play_arrow" size={24} fill />
        <span>PRESS START</span>
      </button>

      {/* Instructions */}
      <div className="mt-3 text-center text-neutral-400 text-xs font-mono">
        <p>Arrow Keys or WASD to move</p>
        <p className="text-[11px] text-neutral-500 mt-0.5">Press Space or Enter to start • P to pause</p>
      </div>

      {/* About Developer Link */}
      <button
        onClick={() => {
          initAudio()
          onOpenDeveloper()
        }}
        className="mt-2.5 text-[11px] font-mono text-purple-300 hover:text-yellow-300 flex items-center gap-1 cursor-pointer transition-colors"
      >
        <Icon name="person" size={14} />
        <span>ABOUT DEVELOPER</span>
      </button>
    </div>
  )
}
