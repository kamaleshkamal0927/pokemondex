'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FavoriteButtonProps {
  pokemonId: number
  pokemonName: string
}

export function FavoriteButton({ pokemonId, pokemonName }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkFavorite() {
      // If Supabase isn't configured yet, don't try to fetch
      if (!supabase.from) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('pokemon_id', pokemonId)
          .single()

        if (data) {
          setIsFavorite(true)
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFavorite()
  }, [pokemonId])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if wrapped in a Link
    
    // Alert the user if Supabase is not configured
    if (!supabase.from) {
      alert("Please configure your Supabase URL and Anon Key in the .env.local file to use the Favorites feature!")
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('pokemon_id', pokemonId)
        
        setIsFavorite(false)
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert([
            { pokemon_id: pokemonId, pokemon_name: pokemonName }
          ])
        
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`rounded-full p-2 backdrop-blur-md transition-all hover:scale-110 ${
        isFavorite
          ? 'bg-red-500/10 text-red-500'
          : 'bg-black/10 text-slate-400 hover:bg-black/20 hover:text-white'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
      />
    </button>
  )
}
