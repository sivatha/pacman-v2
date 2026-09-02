import { useState, useEffect } from 'react'
import { Icon } from './Icon'
import { initAudio } from '../game/sounds'
import type { useMultiplayer } from '../hooks/useMultiplayer'

interface Props {
  isOpen: boolean
  onClose: () => void
  multiplayer: ReturnType<typeof useMultiplayer>
  onStartOnlineGame: () => void
}

export function LobbyModal({
  isOpen,
  onClose,
  multiplayer,
  onStartOnlineGame,
}: Props) {
  const [tab, setTab] = useState<'select' | 'host' | 'join'>('select')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    peerId,
    status,
    error,
    hostGame,
    joinGame,
    disconnect,
  } = multiplayer

  // Automatically switch tab when hosting or joining
  useEffect(() => {
    if (!isOpen) {
      setTab('select')
      setRoomCodeInput('')
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleStartHost = () => {
    initAudio()
    setTab('host')
    hostGame()
  }

  const handleStartJoinView = () => {
    initAudio()
    setTab('join')
  }

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    initAudio()
    if (roomCodeInput.trim()) {
      joinGame(roomCodeInput.trim().toUpperCase())
    }
  }

  const handleCopyCode = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBack = () => {
    if (status !== 'idle') {
      disconnect()
    }
    if (tab === 'select') {
      onClose()
    } else {
      setTab('select')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="bg-neutral-950 border-2 border-blue-600 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(37,99,235,0.4)] font-mono text-white relative">
        {/* Close Button */}
        <button
          onClick={handleBack}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close"
        >
          <Icon name="close" size={20} />
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <Icon name="wifi" size={26} className="text-cyan-400 animate-pulse" />
            <h2 className="text-2xl font-black text-yellow-300 tracking-wider">
              ONLINE 2-PLAYER
            </h2>
          </div>
          <p className="text-xs text-blue-400 tracking-widest">PEERJS WEBRTC MULTIPLAYER</p>
        </div>

        {/* Main View Selection */}
        {tab === 'select' && (
          <div className="flex flex-col gap-3 py-2">
            <button
              onClick={handleStartHost}
              className="py-4 px-5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-base tracking-wider flex items-center justify-between cursor-pointer transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <Icon name="add_circle" size={22} />
                <span>HOST GAME</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-black/20 font-bold">PLAYER 1</span>
            </button>

            <button
              onClick={handleStartJoinView}
              className="py-4 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border-2 border-blue-600/60 hover:border-blue-500 text-cyan-300 font-black text-base tracking-wider flex items-center justify-between cursor-pointer transition-all shadow active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <Icon name="login" size={22} />
                <span>JOIN GAME</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 font-bold text-pink-300">PLAYER 2</span>
            </button>

            <div className="mt-2 text-center text-neutral-400 text-xs leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
              <span className="text-yellow-300 font-bold">How it works:</span> Host creates a room and shares a 5-letter code. Guest enters code to connect directly over WebRTC!
            </div>
          </div>
        )}

        {/* Host View */}
        {tab === 'host' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="text-center space-y-1">
              <span className="text-xs text-neutral-400">ROOM CODE:</span>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-black text-yellow-300 tracking-widest bg-neutral-900 px-5 py-2 rounded-xl border border-yellow-400/40 shadow-inner">
                  {peerId || '...'}
                </div>
                {peerId && (
                  <button
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-cyan-400 cursor-pointer transition-colors"
                    title="Copy Code"
                  >
                    <Icon name={copied ? 'check' : 'content_copy'} size={20} />
                  </button>
                )}
              </div>
              {copied && <span className="text-[11px] text-emerald-400 font-bold">Code copied to clipboard!</span>}
            </div>

            {/* Status Indicator */}
            <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 text-center space-y-1">
              {status === 'connecting' && (
                <div className="text-xs text-yellow-400 flex items-center justify-center gap-2">
                  <Icon name="sync" size={16} className="animate-spin" />
                  <span>Creating PeerJS room...</span>
                </div>
              )}
              {status === 'hosting' && (
                <div className="text-xs text-cyan-300 flex items-center justify-center gap-2 animate-pulse">
                  <Icon name="hourglass_top" size={16} />
                  <span>Waiting for Player 2 to join...</span>
                </div>
              )}
              {status === 'connected' && (
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <Icon name="check_circle" size={18} />
                  <span>Player 2 Connected! Ready to play!</span>
                </div>
              )}
              {status === 'error' && (
                <div className="text-xs text-red-400 font-bold">
                  {error || 'Connection error. Please try again.'}
                </div>
              )}
            </div>

            {/* Start Game Button (for Host once connected) */}
            {status === 'connected' && (
              <button
                onClick={() => {
                  initAudio()
                  onStartOnlineGame()
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-base tracking-wider cursor-pointer transition-all shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-bounce flex items-center justify-center gap-2"
              >
                <Icon name="play_arrow" size={24} fill />
                <span>START ONLINE GAME</span>
              </button>
            )}

            <button
              onClick={handleBack}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              ← Cancel & Disconnect
            </button>
          </div>
        )}

        {/* Join View */}
        {tab === 'join' && (
          <form onSubmit={handleConnect} className="flex flex-col items-center gap-4 py-2">
            <div className="w-full space-y-2">
              <label className="text-xs text-neutral-400 block text-center">
                ENTER 5-LETTER ROOM CODE:
              </label>
              <input
                type="text"
                maxLength={5}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. ABC12"
                className="w-full text-center text-2xl font-black tracking-widest uppercase bg-neutral-900 border-2 border-blue-600 rounded-xl py-2.5 px-4 text-yellow-300 focus:outline-none focus:border-yellow-400 shadow-inner"
                disabled={status === 'connecting' || status === 'connected'}
                autoFocus
              />
            </div>

            {/* Status indicator */}
            <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-center">
              {status === 'idle' && (
                <span className="text-xs text-neutral-400">Enter host code and click Connect</span>
              )}
              {status === 'connecting' && (
                <div className="text-xs text-yellow-400 flex items-center justify-center gap-2">
                  <Icon name="sync" size={16} className="animate-spin" />
                  <span>Connecting to room {roomCodeInput}...</span>
                </div>
              )}
              {status === 'connected' && (
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <Icon name="check_circle" size={18} />
                  <span>Connected to Host! Waiting for host to launch...</span>
                </div>
              )}
              {status === 'error' && (
                <div className="text-xs text-red-400 font-bold">
                  {error || 'Could not find room. Check code and try again.'}
                </div>
              )}
            </div>

            {status !== 'connected' ? (
              <button
                type="submit"
                disabled={roomCodeInput.trim().length < 3 || status === 'connecting'}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-black font-black text-base tracking-wider cursor-pointer transition-all shadow"
              >
                CONNECT TO ROOM
              </button>
            ) : (
              <div className="text-xs text-cyan-300 font-mono text-center animate-pulse">
                Game will start automatically when Host clicks Start!
              </div>
            )}

            <button
              type="button"
              onClick={handleBack}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              ← Cancel & Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
