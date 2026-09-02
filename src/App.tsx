import { useReducer, useCallback, useState, useRef } from 'react'
import { DISPLAY_W, DISPLAY_H, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from './game/constants'
import { gameReducer, createInitialState } from './game/gameState'
import { GameCanvas } from './components/GameCanvas'
import { HUD } from './components/HUD'
import { StartScreen } from './components/StartScreen'
import { PauseScreen } from './components/PauseScreen'
import { GameOverScreen } from './components/GameOverScreen'
import { useKeyboard } from './hooks/useKeyboard'
import { setSoundEnabled, isSoundEnabled, initAudio } from './game/sounds'

import { Navbar } from './components/Navbar'
import { Icon } from './components/Icon'
import { AboutDeveloperPage } from './components/AboutDeveloperPage'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [soundMuted, setSoundMuted] = useState(!isSoundEnabled())
  const [showDeveloperPage, setShowDeveloperPage] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // ── Keyboard Controls ───────────────────────────────────────────────────
  const handleDirection = useCallback((dir: number) => {
    dispatch({ type: 'INPUT', dir })
  }, [])

  const handlePauseToggle = useCallback(() => {
    initAudio()
    if (state.phase === 'playing') dispatch({ type: 'PAUSE' })
    else if (state.phase === 'paused') dispatch({ type: 'RESUME' })
  }, [state.phase])

  const handleStart = useCallback(() => {
    initAudio()
    dispatch({ type: 'START', level: state.level })
  }, [state.level])

  const handleRestart = useCallback(() => {
    initAudio()
    dispatch({ type: 'RESTART', level: 1 })
  }, [])

  const handleResume = useCallback(() => {
    initAudio()
    dispatch({ type: 'RESUME' })
  }, [])

  const handleCycleSpeed = useCallback(() => {
    const speeds = [1.0, 1.25, 1.5]
    const currentIdx = speeds.indexOf(state.speedMultiplier)
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % speeds.length : 0
    dispatch({ type: 'SET_SPEED', speed: speeds[nextIdx] })
  }, [state.speedMultiplier])

  const handleSelectSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEED', speed })
  }, [])

  const handleSelectLevel = useCallback((level: number) => {
    dispatch({ type: 'SET_LEVEL', level })
  }, [])

  const handleGoHome = useCallback(() => {
    initAudio()
    dispatch({ type: 'HOME' })
  }, [])

  useKeyboard(handleDirection, handlePauseToggle, handleStart, state.phase)

  // ── Sound Toggle ────────────────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    initAudio()
    setSoundMuted(prev => {
      const next = !prev
      setSoundEnabled(!next)
      return next
    })
  }, [])

  // ── Touch / Swipe Gesture Controls ──────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    initAudio()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (Math.max(absX, absY) > 20) {
      if (absX > absY) {
        handleDirection(dx > 0 ? DIR_RIGHT : DIR_LEFT)
      } else {
        handleDirection(dy > 0 ? DIR_DOWN : DIR_UP)
      }
    }
    touchStartRef.current = null
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center select-none text-white"
      style={{
        background: 'radial-gradient(circle at 50% 35%, #0e1230 0%, #060818 50%, #000000 100%)',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        currentLevel={state.level}
        score={state.score}
        highScore={state.highScore}
        speedMultiplier={state.speedMultiplier}
        soundMuted={soundMuted}
        isPaused={state.phase === 'paused'}
        onSelectLevel={handleSelectLevel}
        onSelectSpeed={handleSelectSpeed}
        onToggleSound={toggleSound}
        onTogglePause={handlePauseToggle}
        onNewGame={handleRestart}
        onGoHome={handleGoHome}
        onOpenDeveloper={() => setShowDeveloperPage(true)}
      />

      {/* Main Game Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-3">
        {/* Arcade Shell Container (10% increased size) */}
        <div
          className="flex flex-col items-center rounded-xl overflow-hidden border-4 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] bg-black relative"
          style={{ width: DISPLAY_W + 8 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
        {/* HUD Top Bar */}
        <HUD
          score={state.score}
          highScore={state.highScore}
          lives={state.lives}
          level={state.level}
          soundMuted={soundMuted}
          speedMultiplier={state.speedMultiplier}
          onToggleSound={toggleSound}
          onTogglePause={handlePauseToggle}
          onCycleSpeed={handleCycleSpeed}
          isPaused={state.phase === 'paused'}
        />

        {/* Game Canvas & Overlays */}
        <div className="relative" style={{ width: DISPLAY_W, height: DISPLAY_H }}>
          <GameCanvas state={state} dispatch={dispatch} />

          {state.phase === 'start' && (
            <StartScreen
              onStart={handleStart}
              currentLevel={state.level}
              onSelectLevel={handleSelectLevel}
              speedMultiplier={state.speedMultiplier}
              onSelectSpeed={handleSelectSpeed}
              onOpenDeveloper={() => setShowDeveloperPage(true)}
            />
          )}

          {state.phase === 'paused' && (
            <PauseScreen onResume={handleResume} onRestart={handleRestart} />
          )}

          {state.phase === 'gameover' && (
            <GameOverScreen
              score={state.score}
              highScore={state.highScore}
              level={state.level}
              onRestart={handleRestart}
            />
          )}
        </div>

        {/* Bottom Bar: Touch D-Pad / Controls Info */}
        <div className="w-full bg-neutral-950 border-t border-blue-950 p-2.5 flex flex-col items-center gap-2">
          {/* Virtual D-Pad for Mobile/Touch */}
          <div className="grid grid-cols-3 gap-1.5 w-44 pt-0.5">
            <div />
            <button
              onClick={() => handleDirection(DIR_UP)}
              className="h-9 bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white font-bold rounded flex items-center justify-center cursor-pointer transition-colors border border-neutral-800 shadow"
              aria-label="Up"
            >
              <Icon name="arrow_upward" size={20} />
            </button>
            <div />
            <button
              onClick={() => handleDirection(DIR_LEFT)}
              className="h-9 bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white font-bold rounded flex items-center justify-center cursor-pointer transition-colors border border-neutral-800 shadow"
              aria-label="Left"
            >
              <Icon name="arrow_back" size={20} />
            </button>
            <button
              onClick={() => handleDirection(DIR_DOWN)}
              className="h-9 bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white font-bold rounded flex items-center justify-center cursor-pointer transition-colors border border-neutral-800 shadow"
              aria-label="Down"
            >
              <Icon name="arrow_downward" size={20} />
            </button>
            <button
              onClick={() => handleDirection(DIR_RIGHT)}
              className="h-9 bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white font-bold rounded flex items-center justify-center cursor-pointer transition-colors border border-neutral-800 shadow"
              aria-label="Right"
            >
              <Icon name="arrow_forward" size={20} />
            </button>
          </div>

          <p className="text-[10px] text-neutral-400 font-mono text-center tracking-wider">
            ARROWS / WASD • SWIPE • D-PAD • P TO PAUSE
          </p>
        </div>
      </div>
    </main>

    {/* About Developer Page */}
    {showDeveloperPage && (
      <AboutDeveloperPage onBack={() => setShowDeveloperPage(false)} />
    )}
  </div>
)
}
