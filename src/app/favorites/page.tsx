'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { PokemonCard } from '@/components/PokemonCard'
import { PokemonDetailModal } from '@/components/PokemonDetailModal'
import { useApp } from '@/components/AppProvider'
import { useSoundFX } from '@/components/SoundProvider'
import { useCallback } from 'react'

export default function FavoritesPage() {
  const app = useApp()
  const { favorites, isLoaded } = app.favorites
  const { selectedPokemonId, setSelectedPokemonId } = app
  const { play } = useSoundFX()

  const openModal = useCallback((id: number) => { setSelectedPokemonId(id); play('open') }, [setSelectedPokemonId, play])
  const closeModal = useCallback(() => { setSelectedPokemonId(null); play('close') }, [setSelectedPokemonId, play])

  const favoritePokemon = favorites.map(id => ({
    name: `pokemon-${id}`,
    url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
  }))

  return (
    <main className="flex-1 px-4 md:px-8 lg:px-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-400 to-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Favorites</h1>
        </div>
        <p className="text-sm text-white/40 ml-4">Your saved Pokémon collection.</p>
      </div>

      {!isLoaded ? (
        <div className="py-20 text-center text-white/40 tracking-widest uppercase text-sm">Loading…</div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-red-500/30" />
          </div>
          <h2 className="text-xl font-bold text-white/60 mb-2">No Favorites Yet</h2>
          <p className="text-sm text-white/30">Tap the heart icon on any Pokémon to add it to your collection.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <AnimatePresence mode="popLayout">
            {favoritePokemon.map((pokemon, i) => {
              const m = pokemon.url.match(/\/pokemon\/(\d+)\//)
              const id = m ? parseInt(m[1], 10) : 0
              return (
                <motion.div
                  key={pokemon.name}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <PokemonCard
                    name={pokemon.name}
                    url={pokemon.url}
                    onClick={() => openModal(id)}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedPokemonId !== null && (
          <PokemonDetailModal id={selectedPokemonId} onClose={closeModal} />
        )}
      </AnimatePresence>
    </main>
  )
}
