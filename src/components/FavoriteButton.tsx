'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  pokemonId: number
  pokemonName?: string // kept for backward compatibility if needed, though unused now
}

export function FavoriteButton({ pokemonId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()

  if (!isLoaded) return null // Avoid hydration mismatch

  const favorite = isFavorite(pokemonId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if wrapped in a Link
    toggleFavorite(pokemonId)
  }

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full p-2 backdrop-blur-md transition-all hover:scale-110 ${
        favorite
          ? 'bg-red-500/10 text-red-500'
          : 'bg-black/10 text-slate-400 hover:bg-black/20 hover:text-white'
      }`}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`}
      />
    </button>
  )
}
