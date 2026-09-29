'use client'

import { useMemo } from 'react'
import { Heart, Sparkles, Compass } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { BentoGrid } from './BentoGrid'
import { sound } from '@/utils/soundFx'

interface FavoritesViewProps {
  allPokemon: { name: string; url: string }[]
  onSelectPokemon: (id: number) => void
  onExplore: () => void
}

function getIdFromUrl(url: string) {
  const m = url.match(/\/pokemon\/(\d+)\//)
  return m ? parseInt(m[1], 10) : 0
}

export function FavoritesView({ allPokemon, onSelectPokemon, onExplore }: FavoritesViewProps) {
  const { favorites, isLoaded } = useFavorites()

  const favoritePokemonList = useMemo(() => {
    if (!isLoaded || favorites.length === 0) return []
    return allPokemon.filter(p => favorites.includes(getIdFromUrl(p.url)))
  }, [allPokemon, favorites, isLoaded])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Favorites & Collection Vault
            </h2>
            <p className="text-xs text-white/40 tracking-wider font-mono">
              {favoritePokemonList.length} OPERATIVES SECURED IN LOCAL ARCHIVES
            </p>
          </div>
        </div>
      </div>

      {favoritePokemonList.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center">
          <Heart className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-base font-black uppercase tracking-wider text-white/80 mb-2">
            No Favorites Bookmarked Yet
          </h3>
          <p className="text-xs text-white/40 max-w-sm mb-6">
            Click the heart icon on any Pokémon card or inspection view to save your favorite Pokémon here.
          </p>
          <button
            onClick={() => {
              sound.playClick()
              onExplore()
            }}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 transition-all"
          >
            <Compass className="h-4 w-4" /> Explore National Pokédex
          </button>
        </div>
      ) : (
        <BentoGrid pokemonList={favoritePokemonList} onSelect={onSelectPokemon} page={1} />
      )}
    </div>
  )
}
