'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSound } from '@/hooks/useSound'

const SoundContext = createContext<ReturnType<typeof useSound> | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound()
  return <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>
}

export function useSoundFX() {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    return { play: () => {}, enabled: false, toggleSound: () => {} } as ReturnType<typeof useSound>
  }
  return ctx
}
