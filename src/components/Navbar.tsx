import { useState, useEffect } from 'react'
import { GAME_SPEED_OPTIONS } from '../game/constants'
import { HowToPlayModal } from './HowToPlayModal'
import { Icon } from './Icon'
import { initAudio } from '../game/sounds'

interface Props {
  currentLevel: number
  score: number
  highScore: number
  speedMultiplier: number
  soundMuted?: boolean
  isPaused?: boolean
  onSelectLevel: (lvl: number) => void
  onSelectSpeed: (spd: number) => void
  onToggleSound?: () => void
  onTogglePause?: () => void
  onNewGame?: () => void
  onGoHome: () => void
  onOpenDeveloper: () => void
}

function AnimatedPacmanLogo() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    // Authentic 3-frame arcade chomp cycle: closed -> half-open -> wide-open -> half-open
    const frames = [0, 1, 2, 1]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % frames.length
      setFrame(frames[idx])
    }, 130)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        className="drop-shadow-[0_0_10px_rgba(255,224,0,0.85)] shrink-0 select-none"
      >
        {frame === 0 ? (
          <circle cx="16" cy="16" r="14" fill="#FFE000" />
        ) : frame === 1 ? (
          <path
            d="M 16 16 L 28.69 10.08 A 14 14 0 1 0 28.69 21.92 Z"
            fill="#FFE000"
          />
        ) : (
          <path
            d="M 16 16 L 25.9 6.1 A 14 14 0 1 0 25.9 25.9 Z"
            fill="#FFE000"
          />
        )}
      </svg>
      {/* Animated dots ahead of Pac-Man */}
      <div className="flex items-center gap-1 -ml-0.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-orange-300 shadow-[0_0_5px_#fed7aa] transition-opacity duration-150"
          style={{ opacity: frame === 0 ? 0.25 : 1 }}
        />
        <span className="w-1 h-1 rounded-full bg-orange-200 opacity-60" />
      </div>
    </div>
  )
}

export function Navbar({
  currentLevel,
  score,
  highScore,
  speedMultiplier,
  onSelectLevel,
  onSelectSpeed,
  onGoHome,
  onOpenDeveloper,
}: Props) {
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = () => {
    initAudio()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleOpenHowToPlay = () => {
    initAudio()
    setShowHowToPlay(true)
  }

  return (
    <>
      <header className="w-full bg-neutral-950/90 border-b border-blue-900/60 backdrop-blur-md sticky top-0 z-40 px-3 py-2 select-none shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand / Logo (Click to return to Home) */}
          <button
            onClick={() => {
              initAudio()
              onGoHome()
            }}
            className="flex items-center gap-2 cursor-pointer group bg-transparent border-none p-1 rounded-lg hover:bg-neutral-900/70 active:scale-95 transition-all text-left"
            title="Return to Home Screen"
            aria-label="Return to Home Screen"
          >
            {/* Authentic Animated Pac-Man SVG Mascot */}
            <AnimatedPacmanLogo />

            <div className="flex flex-col ml-1">
              <div className="flex items-center">
                <span
                  className="text-base sm:text-lg font-black tracking-widest text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.7)] group-hover:text-yellow-200 transition-colors"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  PAC-MAN
                </span>
              </div>
            </div>
          </button>

          {/* Center: Live Stats (Score & Level in Navbar) */}
          <div className="hidden md:flex items-center gap-4 bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-1 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[10px]">SCORE</span>
              <span className="text-yellow-300 font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="w-px h-3 bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[10px]">HI-SCORE</span>
              <span className="text-white font-bold">{highScore.toLocaleString()}</span>
            </div>
            <div className="w-px h-3 bg-neutral-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[10px]">LEVEL</span>
              <span className="text-cyan-400 font-bold">{currentLevel}</span>
            </div>
          </div>

          {/* Right: Actions & Settings Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Selector Dropdown/Pill */}
            <div className="relative group">
              <button
                className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors shadow"
                title="Change Game Speed"
              >
                <Icon name="speed" size={16} />
                <span>{speedMultiplier}x</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-neutral-900 border border-neutral-700 rounded shadow-2xl py-1 min-w-28 z-50 font-mono text-xs">
                {GAME_SPEED_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      initAudio()
                      onSelectSpeed(opt.value)
                    }}
                    className={`px-3 py-1.5 text-left cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-between ${
                      speedMultiplier === opt.value
                        ? 'text-emerald-400 font-bold bg-neutral-800/60'
                        : 'text-neutral-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {speedMultiplier === opt.value && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Quick Jump */}
            <div className="relative group hidden sm:block">
              <button
                className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors shadow"
                title="Jump to Level"
              >
                <Icon name="layers" size={16} />
                <span>LVL {currentLevel}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-neutral-900 border border-neutral-700 rounded shadow-2xl py-1 min-w-24 z-50 font-mono text-xs">
                {[1, 2, 3, 5, 10, 15, 20].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      initAudio()
                      onSelectLevel(lvl)
                    }}
                    className={`px-3 py-1.5 text-left cursor-pointer transition-colors hover:bg-neutral-800 flex items-center justify-between ${
                      currentLevel === lvl
                        ? 'text-cyan-400 font-bold bg-neutral-800/60'
                        : 'text-neutral-300'
                    }`}
                  >
                    <span>Level {lvl}</span>
                    {currentLevel === lvl && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* How to Play / Rules Modal Trigger (grouped next to Dev) */}
            <button
              onClick={handleOpenHowToPlay}
              className="px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors shadow"
              title="How to Play / Game Rules"
            >
              <Icon name="help" size={16} />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* About Developer Page Trigger */}
            <button
              onClick={() => {
                initAudio()
                onOpenDeveloper()
              }}
              className="px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-purple-800/60 text-xs font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer transition-colors shadow"
              title="About Developer"
            >
              <Icon name="person" size={16} />
              <span className="hidden sm:inline">Dev</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white cursor-pointer transition-colors shadow items-center justify-center"
              title={isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'}
              aria-label="Toggle fullscreen"
            >
              <Icon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </>
  )
}
