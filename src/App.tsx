import { useReducer, useCallback, useState, useRef, useEffect } from 'react'
import { DISPLAY_W, DISPLAY_H, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, type GameMode } from './game/constants'
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
import { LobbyModal } from './components/LobbyModal'
import { useMultiplayer, type NetworkMessage } from './hooks/useMultiplayer'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [soundMuted, setSoundMuted] = useState(!isSoundEnabled())
  const [showDeveloperPage, setShowDeveloperPage] = useState(false)
  const [showLobbyModal, setShowLobbyModal] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // ── PeerJS Multiplayer Networking ───────────────────────────────────────
  const handleNetworkMessage = useCallback((msg: NetworkMessage) => {
    if (msg.type === 'input' && msg.dir !== undefined) {
      // Host received Player 2 input from Guest
      dispatch({ type: 'INPUT_P2', dir: msg.dir })
    } else if (msg.type === 'state' && msg.state) {
      // Guest received authoritative state snapshot from Host
      dispatch({ type: 'SYNC_ONLINE_STATE', state: msg.state })
    } else if (msg.type === 'start') {
      // Guest received start signal from Host
      dispatch({ type: 'START', level: msg.state?.level, mode: 'online' })
      setShowLobbyModal(false)
    }
  }, [])

  const multiplayer = useMultiplayer(handleNetworkMessage)

  // Host broadcasts authoritative state to Guest across WebRTC DataChannel (20fps)
  useEffect(() => {
    if (state.gameMode === 'online' && multiplayer.isHost && multiplayer.status === 'connected') {
      const interval = setInterval(() => {
        multiplayer.sendMessage({
          type: 'state',
          state: {
            phase: state.phase,
            level: state.level,
            score: state.score,
            score2: state.score2,
            highScore: state.highScore,
            lives: state.lives,
            lives2: state.lives2,
            maze: state.maze,
            dotsLeft: state.dotsLeft,
            pacman: state.pacman,
            pacman2: state.pacman2,
            ghosts: state.ghosts,
            globalMode: state.globalMode,
            frightenedGhostCount: state.frightenedGhostCount,
            popups: state.popups,
          },
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [state, multiplayer.isHost, multiplayer.status, multiplayer.sendMessage])

  // Automatically close lobby modal on guest when host launches game
  useEffect(() => {
    if (state.gameMode === 'online' && !multiplayer.isHost && (state.phase === 'ready' || state.phase === 'playing')) {
      setShowLobbyModal(false)
    }
  }, [state.gameMode, multiplayer.isHost, state.phase])

  // ── Keyboard & Input Routing ────────────────────────────────────────────
  const handleDirection = useCallback((dir: number) => {
    if (state.gameMode === 'online') {
      if (multiplayer.isHost) {
        dispatch({ type: 'INPUT', dir })
      } else {
        // Guest sends direction to host and sets locally
        multiplayer.sendMessage({ type: 'input', dir })
        dispatch({ type: 'INPUT_P2', dir })
      }
    } else {
      dispatch({ type: 'INPUT', dir })
    }
  }, [state.gameMode, multiplayer.isHost, multiplayer.sendMessage])

  const handleDirectionP2 = useCallback((dir: number) => {
    dispatch({ type: 'INPUT_P2', dir })
  }, [])

  const handlePauseToggle = useCallback(() => {
    initAudio()
    if (state.phase === 'playing') dispatch({ type: 'PAUSE' })
    else if (state.phase === 'paused') dispatch({ type: 'RESUME' })
  }, [state.phase])

  const handleStart = useCallback(() => {
    initAudio()
    dispatch({ type: 'START', level: state.level, mode: state.gameMode })
  }, [state.level, state.gameMode])

  const handleStartOnlineGame = useCallback(() => {
    initAudio()
    setShowLobbyModal(false)
    multiplayer.sendMessage({ type: 'start', state: { level: state.level } })
    dispatch({ type: 'START', level: state.level, mode: 'online' })
  }, [state.level, multiplayer])

  const handleRestart = useCallback(() => {
    initAudio()
    dispatch({ type: 'RESTART', level: 1, mode: state.gameMode })
  }, [state.gameMode])

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

  useKeyboard(
    handleDirection,
    handleDirectionP2,
    handlePauseToggle,
    handleStart,
    state.phase,
    state.gameMode,
  )

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
        {/* Arcade Shell Container (50% increased size) */}
        <div
          className="flex flex-col items-center rounded-xl overflow-hidden border-4 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] bg-black relative max-w-full"
          style={{ width: DISPLAY_W + 8 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
        {/* HUD Top Bar */}
        <HUD
          score={state.score}
          score2={state.score2}
          highScore={state.highScore}
          lives={state.lives}
          lives2={state.lives2}
          is2Player={state.gameMode !== 'solo'}
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
              gameMode={state.gameMode}
              onSelectMode={(mode: GameMode) => dispatch({ type: 'SET_GAME_MODE', mode })}
              onOpenLobby={() => setShowLobbyModal(true)}
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

        {/* Ready Overlay */}
        {state.phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-yellow-300 font-bold text-2xl tracking-widest animate-pulse drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              READY!
            </span>
          </div>
        )}
      </div>

      {/* Touch D-Pad for Mobile / Small Screens */}
      <div className="mt-3 flex flex-col items-center gap-1.5 md:hidden">
        <button
          onClick={() => {
            initAudio()
            handleDirection(DIR_UP)
          }}
          aria-label="Move Up"
          className="w-12 h-12 bg-neutral-900 active:bg-blue-600 rounded-lg flex items-center justify-center border border-neutral-700 active:border-blue-400 text-white font-bold cursor-pointer transition-colors shadow"
        >
          <Icon name="arrow_upward" size={24} />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => {
              initAudio()
              handleDirection(DIR_LEFT)
            }}
            aria-label="Move Left"
            className="w-12 h-12 bg-neutral-900 active:bg-blue-600 rounded-lg flex items-center justify-center border border-neutral-700 active:border-blue-400 text-white font-bold cursor-pointer transition-colors shadow"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <button
            onClick={() => {
              initAudio()
              handleDirection(DIR_DOWN)
            }}
            aria-label="Move Down"
            className="w-12 h-12 bg-neutral-900 active:bg-blue-600 rounded-lg flex items-center justify-center border border-neutral-700 active:border-blue-400 text-white font-bold cursor-pointer transition-colors shadow"
          >
            <Icon name="arrow_downward" size={24} />
          </button>
          <button
            onClick={() => {
              initAudio()
              handleDirection(DIR_RIGHT)
            }}
            aria-label="Move Right"
            className="w-12 h-12 bg-neutral-900 active:bg-blue-600 rounded-lg flex items-center justify-center border border-neutral-700 active:border-blue-400 text-white font-bold cursor-pointer transition-colors shadow"
          >
            <Icon name="arrow_forward" size={24} />
          </button>
        </div>
      </div>
      </main>

      {/* Online 2-Player PeerJS Lobby Modal */}
      <LobbyModal
        isOpen={showLobbyModal}
        onClose={() => setShowLobbyModal(false)}
        multiplayer={multiplayer}
        onStartOnlineGame={handleStartOnlineGame}
      />

      {/* Full-Page About Developer Overlay */}
      {showDeveloperPage && (
        <AboutDeveloperPage onBack={() => setShowDeveloperPage(false)} />
      )}
    </div>
  )
}
