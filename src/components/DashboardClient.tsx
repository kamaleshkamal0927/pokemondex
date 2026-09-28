'use client'

import { useState, useMemo } from 'react'
import { Search, Heart } from 'lucide-react'
import { PokemonCard } from './PokemonCard'
import { useFavorites } from '@/hooks/useFavorites'
import { TYPE_COLORS } from '@/constants/typeColors'

interface DashboardClientProps {
  initialPokemon: { name: string; url: string }[]
}

const POKEMON_TYPES = Object.keys(TYPE_COLORS).filter(t => t !== 'default')

export function DashboardClient({ initialPokemon }: DashboardClientProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'id' | 'name-asc' | 'name-desc'>('id')
  const [showFavorites, setShowFavorites] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  
  const { isFavorite, favorites, isLoaded } = useFavorites()
  
  // Note: Since we only have basic list data (name/url) upfront, filtering by type locally 
  // requires us to rely on the backend, or we just accept type filter isn't perfect without all types fetched.
  // Wait, if we want a type filter on the dashboard for ALL pokemon, we must fetch by type!
  const [typeFilteredList, setTypeFilteredList] = useState<string[]>([])
  const [isTypeLoading, setIsTypeLoading] = useState(false)

  const handleTypeSelect = async (type: string) => {
    setTypeFilter(type)
    if (type === 'All') {
      setTypeFilteredList([])
      return
    }
    
    setIsTypeLoading(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`)
      const data = await res.json()
      setTypeFilteredList(data.pokemon.map((p: any) => p.pokemon.name))
    } catch (e) {
      console.error(e)
    } finally {
      setIsTypeLoading(false)
    }
  }

  const filteredPokemon = useMemo(() => {
    let result = initialPokemon

    if (search) {
      result = result.filter(p => p.name.includes(search.toLowerCase()))
    }

    if (showFavorites && isLoaded) {
      result = result.filter(p => {
        const idMatch = p.url.match(/\/pokemon\/(\d+)\//)
        const id = idMatch ? parseInt(idMatch[1], 10) : 0
        return isFavorite(id)
      })
    }

    if (typeFilter !== 'All' && typeFilteredList.length > 0) {
      result = result.filter(p => typeFilteredList.includes(p.name))
    }

    switch (sort) {
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'id':
      default:
        // Already sorted by ID by default from initial list
        break
    }

    return result
  }, [initialPokemon, search, showFavorites, isLoaded, favorites, typeFilter, typeFilteredList, sort])

  // Pagination
  const [page, setPage] = useState(1)
  const itemsPerPage = 20
  const paginatedPokemon = filteredPokemon.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage)

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 md:flex-row md:items-center md:justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search Pokémon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as any)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="id">Sort by ID</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              handleTypeSelect(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm capitalize outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="All">All Types</option>
            {POKEMON_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setShowFavorites(!showFavorites)
              setPage(1)
            }}
            className={`flex items-center gap-2 rounded-xl border py-2.5 px-4 text-sm font-medium transition-colors ${
              showFavorites 
                ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10' 
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favorites
            {isLoaded && favorites.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {isTypeLoading ? (
        <div className="py-20 text-center text-slate-500">Loading type data...</div>
      ) : paginatedPokemon.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No Pokémon found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedPokemon.map((pokemon) => (
              <PokemonCard 
                key={pokemon.name} 
                name={pokemon.name} 
                url={pokemon.url} 
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
