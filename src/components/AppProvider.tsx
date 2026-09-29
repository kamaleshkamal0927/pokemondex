'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useFavorites as useFavoritesHook } from '@/hooks/useFavorites'

interface AppState {
  selectedPokemonId: number | null
  setSelectedPokemonId: (id: number | null) => void
  favorites: ReturnType<typeof useFavoritesHook>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null)
  const favorites = useFavoritesHook()

  return (
    <AppContext.Provider value={{ selectedPokemonId, setSelectedPokemonId, favorites }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
