/**
 * Authentic Pac-Man Procedural Sound Engine
 * Synthesizes all classic arcade Pac-Man audio effects using the Web Audio API.
 * No external audio files needed.
 */

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private enabled = true
  private initialized = false

  // Continuous ambient sound nodes
  private sirenNode: OscillatorNode | null = null
  private sirenGain: GainNode | null = null
  private sirenLfo: OscillatorNode | null = null

  private frightenedNode: OscillatorNode | null = null
  private frightenedGain: GainNode | null = null
  private frightenedLfo: OscillatorNode | null = null

  private retreatNode: OscillatorNode | null = null
  private retreatGain: GainNode | null = null

  // Waka alternation state (220Hz / 180Hz)
  private wakaPhase = 0
  private lastWakaTime = 0

  constructor() {
    try {
      const saved = localStorage.getItem('pacman-sound-enabled')
      this.enabled = saved === null ? true : saved === 'true'
    } catch {
      this.enabled = true
    }
  }

  /** Initialize AudioContext from a user gesture (click/keypress) */
  public init(): void {
    if (this.initialized && this.ctx && this.ctx.state === 'running') return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!this.ctx) {
        this.ctx = new AudioCtx()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this.enabled ? 0.35 : 0
        this.masterGain.connect(this.ctx.destination)
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      this.initialized = true
    } catch (e) {
      console.warn('Web Audio API not supported', e)
    }
  }

  public setEnabled(val: boolean): void {
    this.enabled = val
    try {
      localStorage.setItem('pacman-sound-enabled', String(val))
    } catch {}
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val ? 0.35 : 0, this.ctx.currentTime, 0.05)
    }
    if (!val) {
      this.stopAllContinuous()
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  // ─── Low-Level Audio Helpers ──────────────────────────────────────────────

  private osc(
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number,
    gainPeak = 0.25,
    destNode?: GainNode | null,
  ): OscillatorNode | null {
    if (!this.ctx || !this.masterGain) return null
    const targetNode = destNode || this.masterGain
    try {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = type
      o.frequency.value = freq
      g.gain.setValueAtTime(0, startTime)
      g.gain.linearRampToValueAtTime(gainPeak, startTime + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      o.connect(g)
      g.connect(targetNode)
      o.start(startTime)
      o.stop(startTime + duration + 0.02)
      return o
    } catch {
      return null
    }
  }

  // ─── One-Shot Sound Effects ───────────────────────────────────────────────

  /** Classic waka-waka alternating two-tone when Pac-Man eats a dot */
  public playWaka(): void {
    this.init()
    if (!this.ctx || !this.enabled) return
    const now = performance.now()
    // Throttle to avoid audio clipping if dots are eaten rapidly
    if (now - this.lastWakaTime < 60) return
    this.lastWakaTime = now

    const t = this.ctx.currentTime
    const freq = this.wakaPhase === 0 ? 220 : 180
    this.wakaPhase = 1 - this.wakaPhase

    this.osc('square', freq, t, 0.07, 0.18)
    this.osc('square', freq * 1.5, t, 0.035, 0.08)
  }

  /** Power pellet pickup — ascending 5-tone retro arpeggio */
  public playPowerPellet(): void {
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const notes = [200, 300, 450, 600, 800]
    notes.forEach((freq, i) => {
      this.osc('square', freq, t + i * 0.055, 0.1, 0.22)
    })
  }

  /** Eat ghost — authentic descending electronic blip + 880Hz score chime */
  public playEatGhost(combo = 1): void {
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const baseFreq = 400 + combo * 120

    this.osc('square', baseFreq, t, 0.08, 0.28)
    this.osc('square', baseFreq * 0.75, t + 0.07, 0.08, 0.28)
    this.osc('square', baseFreq * 0.5, t + 0.14, 0.12, 0.22)
    this.osc('sine', 880, t, 0.06, 0.2)
  }

  /** Pac-Man death — classic 13-tone descending chromatic sequence */
  public playDeath(): void {
    this.stopAllContinuous()
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const freqs = [480, 440, 400, 360, 330, 300, 270, 240, 210, 180, 150, 120, 90]
    freqs.forEach((freq, i) => {
      const start = t + i * 0.085
      this.osc('square', freq, start, 0.11, 0.3)
      this.osc('sawtooth', freq * 0.5, start, 0.11, 0.12)
    })
  }

  /** Game start intro melody ("Ready" jingle) */
  public playGameStart(): void {
    this.stopAllContinuous()
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const melody = [
      { f: 494, d: 0.11 }, { f: 370, d: 0.11 }, { f: 494, d: 0.11 },
      { f: 370, d: 0.11 }, { f: 494, d: 0.11 }, { f: 587, d: 0.11 },
      { f: 494, d: 0.11 }, { f: 440, d: 0.11 }, { f: 494, d: 0.22 },
    ]
    let offset = 0
    melody.forEach(({ f, d }) => {
      this.osc('square', f, t + offset, d, 0.26)
      this.osc('square', f * 2, t + offset, d * 0.5, 0.08)
      offset += d + 0.02
    })
  }

  /** Level complete — ascending victory fanfare */
  public playLevelComplete(): void {
    this.stopAllContinuous()
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const notes = [
      { f: 523, d: 0.11 }, { f: 659, d: 0.11 }, { f: 784, d: 0.11 },
      { f: 1047, d: 0.25 }, { f: 784, d: 0.08 }, { f: 1047, d: 0.35 },
    ]
    let offset = 0
    notes.forEach(({ f, d }) => {
      this.osc('square', f, t + offset, d, 0.3)
      this.osc('triangle', f * 2, t + offset, d, 0.1)
      offset += d + 0.04
    })
  }

  /** Extra life awarded */
  public playExtraLife(): void {
    this.init()
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime
    const notes = [523, 659, 784, 1047, 784, 1047]
    notes.forEach((f, i) => {
      this.osc('square', f, t + i * 0.08, 0.1, 0.25)
    })
  }

  // ─── Continuous Ambient Sounds (Siren, Frightened, Retreat) ────────────────

  /** Normal ghost siren — frequency oscillates with LFO, speed increases with level */
  public startSiren(level = 1): void {
    this.init()
    if (!this.ctx || !this.enabled || !this.masterGain) return
    if (this.sirenNode) return // Already active

    this.stopFrightened()
    this.stopRetreat()

    try {
      const speed = Math.min(1.2 + (level - 1) * 0.15, 3.2) // Faster wobble per level
      this.sirenGain = this.ctx.createGain()
      this.sirenGain.gain.value = 0.055
      this.sirenGain.connect(this.masterGain)

      this.sirenNode = this.ctx.createOscillator()
      this.sirenNode.type = 'sawtooth'
      this.sirenNode.frequency.value = 130 + Math.min(level * 4, 40)

      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = speed
      lfoGain.gain.value = 35 + Math.min(level * 3, 30)

      lfo.connect(lfoGain)
      lfoGain.connect(this.sirenNode.frequency)

      this.sirenNode.connect(this.sirenGain)
      this.sirenNode.start()
      lfo.start()
      this.sirenLfo = lfo
    } catch {}
  }

  public stopSiren(): void {
    try {
      this.sirenNode?.stop()
      this.sirenLfo?.stop()
      this.sirenNode?.disconnect()
      this.sirenLfo?.disconnect()
    } catch {}
    this.sirenNode = null
    this.sirenLfo = null
    this.sirenGain = null
  }

  /** Frightened sound — rapid warble when ghosts are blue */
  public startFrightened(): void {
    this.init()
    if (!this.ctx || !this.enabled || !this.masterGain) return
    if (this.frightenedNode) return

    this.stopSiren()
    this.stopRetreat()

    try {
      this.frightenedGain = this.ctx.createGain()
      this.frightenedGain.gain.value = 0.065
      this.frightenedGain.connect(this.masterGain)

      this.frightenedNode = this.ctx.createOscillator()
      this.frightenedNode.type = 'square'
      this.frightenedNode.frequency.value = 280

      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = 8.0 // Rapid 8Hz wobble
      lfoGain.gain.value = 80

      lfo.connect(lfoGain)
      lfoGain.connect(this.frightenedNode.frequency)

      this.frightenedNode.connect(this.frightenedGain)
      this.frightenedNode.start()
      lfo.start()
      this.frightenedLfo = lfo
    } catch {}
  }

  public stopFrightened(): void {
    try {
      this.frightenedNode?.stop()
      this.frightenedLfo?.stop()
      this.frightenedNode?.disconnect()
      this.frightenedLfo?.disconnect()
    } catch {}
    this.frightenedNode = null
    this.frightenedLfo = null
    this.frightenedGain = null
  }

  /** Retreat sound — rapid high-pitched ping when ghost eyes are returning home */
  public startRetreat(): void {
    this.init()
    if (!this.ctx || !this.enabled || !this.masterGain) return
    if (this.retreatNode) return

    this.stopSiren()
    this.stopFrightened()

    try {
      this.retreatGain = this.ctx.createGain()
      this.retreatGain.gain.value = 0.075
      this.retreatGain.connect(this.masterGain)

      this.retreatNode = this.ctx.createOscillator()
      this.retreatNode.type = 'triangle'
      this.retreatNode.frequency.value = 650

      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = 12.0
      lfoGain.gain.value = 150

      lfo.connect(lfoGain)
      lfoGain.connect(this.retreatNode.frequency)

      this.retreatNode.connect(this.retreatGain)
      this.retreatNode.start()
      lfo.start()
    } catch {}
  }

  public stopRetreat(): void {
    try {
      this.retreatNode?.stop()
      this.retreatNode?.disconnect()
    } catch {}
    this.retreatNode = null
    this.retreatGain = null
  }

  /** Stop all continuous ambient loops */
  public stopAllContinuous(): void {
    this.stopSiren()
    this.stopFrightened()
    this.stopRetreat()
  }
}

// Export singleton instance
export const soundEngine = new SoundEngine()

// Backward-compatible named helper functions
export function initAudio(): void {
  soundEngine.init()
}

export function setSoundEnabled(enabled: boolean): void {
  soundEngine.setEnabled(enabled)
}

export function isSoundEnabled(): boolean {
  return soundEngine.isEnabled()
}

export function playEatDot(): void {
  soundEngine.playWaka()
}

export function playEatPellet(): void {
  soundEngine.playPowerPellet()
}

export function playEatGhost(pts: number): void {
  const combo = pts === 200 ? 1 : pts === 400 ? 2 : pts === 800 ? 3 : 4
  soundEngine.playEatGhost(combo)
}

export function playDeath(): void {
  soundEngine.playDeath()
}

export function playReady(): void {
  soundEngine.playGameStart()
}

export function playLevelClear(): void {
  soundEngine.playLevelComplete()
}

export function playExtraLife(): void {
  soundEngine.playExtraLife()
}
