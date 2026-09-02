import { initAudio } from '../game/sounds'
import { Icon } from './Icon'
import type { GameMode } from '../game/constants'

interface Props {
  onStart: () => void
  currentLevel: number
  onSelectLevel: (lvl: number) => void
  speedMultiplier: number
  onSelectSpeed: (spd: number) => void
  gameMode: GameMode
  onSelectMode: (mode: GameMode) => void
  onOpenLobby: () => void
  onOpenDeveloper: () => void
}

export function StartScreen({
  onStart,
  currentLevel,
  onSelectLevel,
  speedMultiplier,
  onSelectSpeed,
  gameMode,
  onSelectMode,
  onOpenLobby,
  onOpenDeveloper,
}: Props) {
  const handleClick = () => {
    initAudio()
    if (gameMode === 'online') {
      onOpenLobby()
    } else {
      onStart()
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 select-none p-4 backdrop-blur-xs">
      {/* Title */}
      <div className="mb-3 text-center">
        <h1
          className="text-4xl sm:text-5xl font-black tracking-widest mb-1 text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.8)]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          PAC-MAN
        </h1>
        <p className="text-blue-400 text-[10px] tracking-widest font-mono uppercase mt-1">
          React 19.2 • Vite 8.2 • Tailwind 4.3
        </p>
      </div>

      {/* Game Mode Selector */}
      <div className="mb-3 w-80 font-mono">
        <div className="text-[10px] text-neutral-400 text-center mb-1 font-bold tracking-wider">SELECT GAME MODE</div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
          <button
            onClick={() => {
              initAudio()
              onSelectMode('solo')
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold tracking-wider cursor-pointer transition-all flex flex-col items-center gap-1 ${
              gameMode === 'solo'
                ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Icon name="person" size={16} />
            <span>1P SOLO</span>
          </button>

          <button
            onClick={() => {
              initAudio()
              onSelectMode('local')
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold tracking-wider cursor-pointer transition-all flex flex-col items-center gap-1 ${
              gameMode === 'local'
                ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Icon name="group" size={16} />
            <span>2P LOCAL</span>
          </button>

          <button
            onClick={() => {
              initAudio()
              onSelectMode('online')
              onOpenLobby()
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold tracking-wider cursor-pointer transition-all flex flex-col items-center gap-1 ${
              gameMode === 'online'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Icon name="wifi" size={16} />
            <span>2P ONLINE</span>
          </button>
        </div>
      </div>

      {/* Starting Level & Speed Selectors */}
      <div className="mb-3 flex flex-col gap-1.5 w-80 font-mono text-xs">
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

      {/* Big Action Button */}
      <button
        onClick={handleClick}
        className={`px-8 py-3 rounded-xl font-black text-base tracking-wider font-mono shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 ${
          gameMode === 'online'
            ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse'
            : gameMode === 'local'
            ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-bounce'
            : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce'
        }`}
      >
        <Icon name={gameMode === 'online' ? 'wifi' : 'play_arrow'} size={22} fill />
        <span>{gameMode === 'online' ? 'OPEN MULTIPLAYER LOBBY' : 'PRESS START'}</span>
      </button>

      {/* Instructions */}
      <div className="mt-2.5 text-center text-neutral-400 text-xs font-mono">
        {gameMode === 'local' ? (
          <p className="text-yellow-300">
            <span className="text-yellow-400 font-bold">P1 (Yellow):</span> Arrow Keys • <span className="text-pink-400 font-bold">P2 (Pink):</span> W/A/S/D
          </p>
        ) : (
          <p>Arrow Keys or WASD to navigate</p>
        )}
        <p className="text-[11px] text-neutral-500 mt-0.5">Space / Enter to launch • P to pause</p>
      </div>

      {/* About Developer Link */}
      <button
        onClick={() => {
          initAudio()
          onOpenDeveloper()
        }}
        className="mt-2 text-[11px] font-mono text-purple-300 hover:text-yellow-300 flex items-center gap-1 cursor-pointer transition-colors"
      >
        <Icon name="person" size={14} />
        <span>ABOUT DEVELOPER</span>
      </button>
    </div>
  )
}
