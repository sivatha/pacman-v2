import { useState, useEffect, useCallback, useRef } from 'react'
import Peer, { type DataConnection } from 'peerjs'

export interface NetworkMessage {
  type: 'input' | 'state' | 'start' | 'restart'
  dir?: number
  state?: any
}

export type MultiplayerStatus = 'idle' | 'connecting' | 'hosting' | 'connected' | 'error'

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function useMultiplayer(onMessage?: (data: NetworkMessage) => void) {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [peerId, setPeerId] = useState<string | null>(null)
  const [connection, setConnection] = useState<DataConnection | null>(null)
  const [status, setStatus] = useState<MultiplayerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  // Host a new game with a short 5-character code
  const hostGame = useCallback(() => {
    setStatus('connecting')
    setError(null)

    const attemptHosting = () => {
      const code = generateRoomCode()
      const newPeer = new Peer(code, {
        debug: 1,
      })

      newPeer.on('open', (id) => {
        setPeerId(id)
        setIsHost(true)
        setStatus('hosting')
      })

      newPeer.on('connection', (conn) => {
        setConnection((prev) => {
          if (prev) {
            conn.close()
            return prev
          }
          return conn
        })
      })

      newPeer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          newPeer.destroy()
          attemptHosting() // Retry with another code
        } else {
          setError(err.message || 'PeerJS network error')
          setStatus('error')
        }
      })

      setPeer(newPeer)
    }

    attemptHosting()
  }, [])

  // When connection arrives, listen for data
  useEffect(() => {
    if (connection) {
      setStatus('connected')

      const handleData = (data: unknown) => {
        if (onMessageRef.current) {
          onMessageRef.current(data as NetworkMessage)
        }
      }

      const handleClose = () => {
        setStatus(isHost ? 'hosting' : 'idle')
        setConnection(null)
      }

      const handleError = (err: any) => {
        setError(err?.message || 'Connection error')
      }

      connection.on('data', handleData)
      connection.on('close', handleClose)
      connection.on('error', handleError)

      return () => {
        connection.off('data', handleData)
        connection.off('close', handleClose)
        connection.off('error', handleError)
      }
    }
  }, [connection, isHost])

  // Join an existing host's room code
  const joinGame = useCallback((hostCode: string) => {
    if (!hostCode.trim()) return
    setStatus('connecting')
    setError(null)

    const newPeer = new Peer()

    newPeer.on('open', (id) => {
      setPeerId(id)
      setIsHost(false)
      const conn = newPeer.connect(hostCode.trim().toUpperCase(), { reliable: true })

      conn.on('open', () => {
        setConnection(conn)
      })

      conn.on('error', (err) => {
        setError(err?.message || 'Failed to connect to room')
        setStatus('error')
      })
    })

    newPeer.on('error', (err: any) => {
      setError(err?.message || 'Failed to connect')
      setStatus('error')
    })

    setPeer(newPeer)
  }, [])

  // Send a network message
  const sendMessage = useCallback((msg: NetworkMessage) => {
    if (connection && connection.open) {
      connection.send(msg)
    }
  }, [connection])

  // Disconnect & cleanup
  const disconnect = useCallback(() => {
    if (connection) connection.close()
    if (peer) peer.destroy()
    setPeer(null)
    setConnection(null)
    setPeerId(null)
    setIsHost(false)
    setStatus('idle')
    setError(null)
  }, [peer, connection])

  return {
    peerId,
    status,
    error,
    isHost,
    hostGame,
    joinGame,
    sendMessage,
    disconnect,
  }
}
