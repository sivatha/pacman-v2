import { useState, useEffect, useMemo } from 'react'
import { Icon } from './Icon'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function HowToPlayModal({ isOpen, onClose }: Props) {
  const [mouthOpen, setMouthOpen] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setMouthOpen(o => !o), 300)
    return () => clearInterval(interval)
  }, [])

  // Floating background arcade particles matching AboutDeveloperPage
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 3,
        color: ['#0066ff', '#FFD700', '#aa00ff', '#00ccff', '#ff0055'][i % 5],
      })),
    []
  )

  if (!isOpen) return null

  const ghosts = [
    {
      name: 'BLINKY',
      nick: '"SHADOW"',
      color: '#FF0000',
      tagColor: 'text-red-500',
      role: 'Direct Chaser',
      desc: 'Relentlessly targets Pac-Man directly. Accelerates as dots decrease (Cruise Elroy).',
    },
    {
      name: 'PINKY',
      nick: '"SPEEDY"',
      color: '#FFB8FF',
      tagColor: 'text-pink-300',
      role: 'Ambush Hunter',
      desc: 'Predicts Pac-Man trajectory and targets 4 tiles ahead to cut off your escape path.',
    },
    {
      name: 'INKY',
      nick: '"BASHFUL"',
      color: '#00FFFF',
      tagColor: 'text-cyan-400',
      role: 'Pincer Flanker',
      desc: 'Uses both Blinky and Pac-Man positions to create dangerous trap maneuvers.',
    },
    {
      name: 'CLYDE',
      nick: '"POKEY"',
      color: '#FFB852',
      tagColor: 'text-orange-400',
      role: 'Erratic Roamer',
      desc: 'Chases when far from Pac-Man, but retreats to bottom-left corner when within 8 tiles.',
    },
  ]

  const scores = [
    { label: 'Normal Dot', pts: '10 PTS', icon: 'fiber_manual_record', color: 'text-orange-200' },
    { label: 'Power Pellet', pts: '50 PTS', icon: 'radio_button_checked', color: 'text-yellow-300' },
    { label: '1st Ghost', pts: '200 PTS', icon: 'pest_control', color: 'text-cyan-400' },
    { label: '2nd Ghost', pts: '400 PTS', icon: 'pest_control', color: 'text-cyan-400' },
    { label: '3rd Ghost', pts: '800 PTS', icon: 'pest_control', color: 'text-cyan-400' },
    { label: '4th Ghost', pts: '1600 PTS', icon: 'pest_control', color: 'text-cyan-400' },
    { label: 'Extra Life', pts: '10,000 PTS', icon: 'favorite', color: 'text-emerald-400' },
  ]

  const tips = [
    { icon: 'turn_sharp_right', title: 'Cut the Corners', desc: 'Pac-Man corners slightly faster than ghosts. Take sharp turns to gain distance.' },
    { icon: 'alt_route', title: 'Use Warp Tunnels', desc: 'Ghosts slow down substantially inside the side warp tunnels, giving you a chance to escape.' },
    { icon: 'bolt', title: 'Power Pellet Timing', desc: 'Save Power Pellets until ghosts are close to chain all 4 ghosts for maximum 1600 bonus.' },
    { icon: 'hourglass_bottom', title: 'Level Speedup', desc: 'Ghosts speed up and frightened time gets shorter each level. Plan escape routes in advance.' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex flex-col items-center select-none text-white animate-in fade-in duration-200"
      style={{
        background: 'radial-gradient(circle at 50% 30%, #0c1236 0%, #05081a 60%, #000000 100%)',
        fontFamily: 'monospace',
      }}
    >
      {/* Background Starfield / Particle field */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              opacity: 0.35,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              animation: `pulse ${p.duration}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar (Cloned from AboutDeveloperPage.tsx) */}
      <header className="sticky top-0 z-20 w-full bg-neutral-950/80 backdrop-blur-md border-b border-blue-900/60 px-4 py-3 flex items-center justify-between max-w-5xl shadow-lg">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-400 hover:text-cyan-300 text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow"
        >
          <Icon name="arrow_back" size={18} />
          <span>BACK TO GAME</span>
        </button>

        <div className="flex items-center gap-2">
          <Icon name="menu_book" size={20} className="text-yellow-400" />
          <span className="text-sm font-black text-yellow-300 tracking-wider">
            RULES & USER MANUAL
          </span>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono hidden sm:block">
          PAC-MAN • 2026
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center gap-6 w-full max-w-3xl px-4 py-8 pb-16">
        {/* Animated Pac-Man Mascot & Banner */}
        <div className="w-full text-center rounded-2xl p-6 relative overflow-hidden bg-gradient-to-b from-blue-950/50 to-neutral-950/90 border border-blue-600/40 shadow-[0_0_35px_rgba(37,99,235,0.25)]">
          {/* Neon corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

          {/* Pac-Man SVG Mascot */}
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 60 60" width="56" height="56" className="drop-shadow-[0_0_16px_rgba(250,204,21,0.8)]">
              <circle cx="30" cy="30" r="28" fill="#FACC15" />
              {mouthOpen && <path d="M30 30 L58 18 L58 42 Z" fill="#000000" />}
              <circle cx="32" cy="16" r="4" fill="#000000" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]">
            HOW TO PLAY PAC-MAN
          </h1>
          <p className="text-cyan-400 text-xs tracking-widest mt-1 uppercase font-bold">
            Official Arcade Rules • Ghost AI • Scoring • Strategies
          </p>
        </div>

        {/* Objective Card */}
        <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950/40 via-neutral-950 to-neutral-950 border border-blue-600/50 shadow-[0_0_30px_rgba(37,99,235,0.2)] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 uppercase tracking-widest">
            <Icon name="flag" size={18} className="text-yellow-400" />
            <span>PRIMARY MISSION</span>
          </div>
          <p className="text-neutral-300 text-xs leading-relaxed">
            Navigate Pac-Man through the maze to consume all <span className="text-white font-bold">244 dots</span> (240 small dots and 4 flashing Power Pellets). Avoid contact with ghosts unless they are blue and frightened! Clear all dots to advance to the next level.
          </p>
        </div>

        {/* Ghost Personalities Section */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-300 tracking-wider">
            <Icon name="groups" size={18} />
            <span>THE 4 GHOSTS & THEIR BEHAVIORS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ghosts.map(g => (
              <div
                key={g.name}
                className="bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3.5 space-y-1.5 transition-all shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-t-full rounded-b-xs"
                      style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}` }}
                    />
                    <span className="font-bold text-xs" style={{ color: g.color }}>
                      {g.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">{g.nick}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 ${g.tagColor}`}>
                    {g.role}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Table */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 tracking-wider">
            <Icon name="star" size={18} />
            <span>SCORING BREAKDOWN</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {scores.map(s => (
              <div
                key={s.label}
                className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-center space-y-1"
              >
                <div className={`text-base font-black ${s.color}`}>
                  {s.pts}
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                  <Icon name={s.icon} size={14} />
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider">
            <Icon name="sports_esports" size={18} />
            <span>CONTROLS & SHORTCUTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Icon name="keyboard" size={16} className="text-cyan-400" />
                <span>Keyboard Controls</span>
              </div>
              <div className="space-y-1 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Steer Pac-Man:</span>
                  <span className="text-white font-bold">Arrow Keys / WASD</span>
                </div>
                <div className="flex justify-between">
                  <span>Pause / Resume:</span>
                  <span className="text-white font-bold">P or Escape</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Game:</span>
                  <span className="text-white font-bold">Space or Enter</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Icon name="touch_app" size={16} className="text-emerald-400" />
                <span>Mobile & Touch Controls</span>
              </div>
              <div className="space-y-1 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Swipe Screen:</span>
                  <span className="text-white font-bold">Up / Down / Left / Right</span>
                </div>
                <div className="flex justify-between">
                  <span>Virtual D-Pad:</span>
                  <span className="text-white font-bold">On-Screen Buttons</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Navbar:</span>
                  <span className="text-white font-bold">Instant Mute & Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 tracking-wider">
            <Icon name="lightbulb" size={18} />
            <span>PRO TIPS & STRATEGIES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map(t => (
              <div
                key={t.title}
                className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3.5 space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-200">
                  <Icon name={t.icon} size={16} className="text-yellow-400" />
                  <span>{t.title}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed pl-6">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Return Button */}
        <button
          onClick={onClose}
          className="mt-4 px-10 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-sm tracking-wider cursor-pointer transition-all shadow-[0_0_25px_rgba(250,204,21,0.6)] flex items-center gap-2"
        >
          <Icon name="sports_esports" size={20} />
          <span>RETURN TO PAC-MAN</span>
        </button>

        {/* Footer */}
        <footer className="text-center text-neutral-500 text-[11px] pt-4 space-y-1">
          <p>© 2026 SUON Sivatha — All Rights Reserved</p>
          <p className="text-[10px] text-neutral-600">
            Original PAC-MAN is a trademark of Bandai Namco Entertainment Inc.
          </p>
        </footer>
      </main>
    </div>
  )
}
