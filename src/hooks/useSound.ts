'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

type SoundType = 'click' | 'hover' | 'open' | 'close' | 'select' | 'success' | 'error' | 'scan'

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pokedex_sound_enabled')
    if (stored === 'true') setEnabled(true)
  }, [])

  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem('pokedex_sound_enabled', String(next))
      return next
    })
  }, [])

  const play = useCallback((type: SoundType) => {
    if (!enabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime

      const presets: Record<SoundType, { freq: number; dur: number; vol: number; type: OscillatorType; sweep?: number }> = {
        click:   { freq: 800,  dur: 0.05, vol: 0.06, type: 'square' },
        hover:   { freq: 1200, dur: 0.03, vol: 0.03, type: 'sine' },
        open:    { freq: 400,  dur: 0.15, vol: 0.08, type: 'sawtooth', sweep: 800 },
        close:   { freq: 800,  dur: 0.12, vol: 0.06, type: 'sawtooth', sweep: 300 },
        select:  { freq: 600,  dur: 0.08, vol: 0.07, type: 'square',   sweep: 900 },
        success: { freq: 523,  dur: 0.18, vol: 0.08, type: 'sine',     sweep: 1046 },
        error:   { freq: 200,  dur: 0.2,  vol: 0.08, type: 'sawtooth', sweep: 100 },
        scan:    { freq: 2000, dur: 0.1,  vol: 0.04, type: 'sine',     sweep: 400 },
      }

      const p = presets[type]
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = p.type
      osc.frequency.setValueAtTime(p.freq, now)
      if (p.sweep) osc.frequency.exponentialRampToValueAtTime(p.sweep, now + p.dur)
      gain.gain.setValueAtTime(p.vol, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + p.dur)
    } catch (e) {
      // Audio context might not be available
    }
  }, [enabled])

  return { play, enabled, toggleSound }
}
