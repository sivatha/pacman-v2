import { useState, useEffect, useMemo } from 'react'
import { Icon } from './Icon'

interface Props {
  onBack: () => void
}

export function AboutDeveloperPage({ onBack }: Props) {
  const [mouthOpen, setMouthOpen] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setMouthOpen(o => !o), 300)
    return () => clearInterval(interval)
  }, [])

  // Floating background arcade particles
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

  const techStack = [
    { icon: 'hub', name: 'React 19.2', desc: 'Modern reactive UI & hooks', color: '#61DAFB' },
    { icon: 'bolt', name: 'Vite 8.2', desc: 'Ultra-fast HMR & bundler', color: '#FFD700' },
    { icon: 'palette', name: 'Tailwind 4.3', desc: 'Modern responsive styling', color: '#38BDF8' },
    { icon: 'volume_up', name: 'Web Audio API', desc: 'Procedural retro synthesizer', color: '#A855F7' },
    { icon: 'brush', name: 'HTML5 Canvas', desc: 'Pixel-perfect 60fps rendering', color: '#F97316' },
    { icon: 'data_object', name: 'TypeScript', desc: 'Strict type safety & architecture', color: '#3178C6' },
  ]

  const highlights = [
    { icon: 'smart_toy', title: 'Authentic Ghost AI', desc: 'Blinky, Pinky, Inky, and Clyde with faithful arcade targeting mechanics.' },
    { icon: 'speed', title: 'Delta-Time Normalization', desc: 'Smooth framerate-independent speed scaling for 60Hz and 120Hz+ screens.' },
    { icon: 'graphic_eq', title: 'Procedural Retro Audio', desc: 'Dynamic sirens, arpeggios, waka alternations, and level fanfares.' },
    { icon: 'touch_app', title: 'Multi-Device Support', desc: 'Seamless keyboard, mobile touch swipe, and virtual D-pad controls.' },
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

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 w-full bg-neutral-950/80 backdrop-blur-md border-b border-blue-900/60 px-4 py-3 flex items-center justify-between max-w-5xl shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-400 hover:text-cyan-300 text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow"
        >
          <Icon name="arrow_back" size={18} />
          <span>BACK TO GAME</span>
        </button>

        <div className="flex items-center gap-2">
          <Icon name="badge" size={20} className="text-yellow-400" />
          <span className="text-sm font-black text-yellow-300 tracking-wider">
            DEVELOPER PROFILE
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
            PAC-MAN ARCADE
          </h1>
          <p className="text-cyan-400 text-xs tracking-widest mt-1 uppercase font-bold">
            React 19.2 • Vite 8.2 • Tailwind 4.3 • Web Audio API
          </p>
        </div>

        {/* Developer Profile Card */}
        <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-950/40 via-neutral-950 to-neutral-950 border border-purple-600/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          {/* Header stripe */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-purple-900/60 to-transparent flex items-center gap-2 border-b border-purple-800/40">
            <Icon name="person" size={18} className="text-purple-300" />
            <span className="text-xs font-bold text-purple-300 tracking-widest uppercase">
              Lead Software Engineer & Developer
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar with glowing ring & online badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-500 p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-black text-2xl text-yellow-300 tracking-wider">
                  SS
                </div>
              </div>
              <div
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black shadow-[0_0_8px_#34d399]"
                title="Active & Available"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-wider drop-shadow">
                  SUON Sivatha
                </h2>
                <div className="text-purple-300 text-xs font-bold mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                  <Icon name="terminal" size={16} />
                  <span>Full-Stack Developer</span>
                </div>
              </div>

              <div className="text-neutral-400 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <Icon name="school" size={16} className="text-cyan-400" />
                <span>Norton University</span>
              </div>

              <p className="text-neutral-300 text-xs leading-relaxed pt-1">
                Passionate software engineer specializing in modern web applications, interactive frontends, game mechanics, and performant user experiences. Recreated this classic Pac-Man arcade with authentic AI behaviors, zero-latency Web Audio sound synthesis, and framerate-independent rendering.
              </p>

              {/* Contact Links */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <a
                  href="mailto:sivatha.net@gmail.com"
                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="mail" size={16} />
                  <span>sivatha.net@gmail.com</span>
                </a>

                <div className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-1.5">
                  <Icon name="location_on" size={16} className="text-red-400" />
                  <span>Phnom Penh, Cambodia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Stack */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 tracking-wider">
            <Icon name="code" size={18} />
            <span>PROJECT TECH STACK</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {techStack.map(tech => (
              <div
                key={tech.name}
                className="bg-neutral-950/80 border border-neutral-800 hover:border-blue-700/60 rounded-xl p-3.5 flex items-center gap-3 transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-neutral-900 border border-neutral-800"
                  style={{ color: tech.color }}
                >
                  <Icon name={tech.icon} size={20} />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-white truncate">{tech.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Highlights */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider">
            <Icon name="stars" size={18} />
            <span>ENGINEERING HIGHLIGHTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map(h => (
              <div
                key={h.title}
                className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-3.5 space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-200">
                  <Icon name={h.icon} size={16} className="text-yellow-400" />
                  <span>{h.title}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed pl-6">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Game Button */}
        <button
          onClick={onBack}
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
