'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pokedex_favorites')
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id]
      
      localStorage.setItem('pokedex_favorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const isFavorite = (id: number) => favorites.includes(id)

  return { favorites, toggleFavorite, isFavorite, isLoaded }
}
