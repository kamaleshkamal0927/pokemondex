'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PokemonCard } from './PokemonCard'
import { PokemonDetailModal } from './PokemonDetailModal'
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
  const [typeFilteredList, setTypeFilteredList] = useState<string[]>([])
  const [isTypeLoading, setIsTypeLoading] = useState(false)
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  const { isFavorite, favorites, isLoaded } = useFavorites()

  const handleTypeSelect = async (type: string) => {
    setTypeFilter(type)
    setPage(1)
    if (type === 'All') { setTypeFilteredList([]); return }
    setIsTypeLoading(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`)
      const data = await res.json()
      setTypeFilteredList(data.pokemon.map((p: any) => p.pokemon.name))
    } catch (e) { console.error(e) }
    finally { setIsTypeLoading(false) }
  }

  const filteredPokemon = useMemo(() => {
    let result = initialPokemon
    if (search) result = result.filter(p => p.name.includes(search.toLowerCase()))
    if (showFavorites && isLoaded) {
      result = result.filter(p => {
        const m = p.url.match(/\/pokemon\/(\d+)\//)
        return m ? isFavorite(parseInt(m[1], 10)) : false
      })
    }
    if (typeFilter !== 'All' && typeFilteredList.length > 0) {
      result = result.filter(p => typeFilteredList.includes(p.name))
    }
    if (sort === 'name-asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'name-desc') result = [...result].sort((a, b) => b.name.localeCompare(a.name))
    return result
  }, [initialPokemon, search, showFavorites, isLoaded, favorites, typeFilter, typeFilteredList, sort])

  const paginatedPokemon = filteredPokemon.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage)

  const openModal = useCallback((id: number) => setSelectedPokemonId(id), [])
  const closeModal = useCallback(() => setSelectedPokemonId(null), [])

  const getIdFromUrl = (url: string) => {
    const m = url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) : 0
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search Pokémon…  ⌘K"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-10 text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white transition-colors">✕</button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sort}
            onChange={e => { setSort(e.target.value as any); setPage(1) }}
            className="rounded-xl border border-white/10 bg-black/30 text-white py-2.5 px-3 text-sm outline-none appearance-none cursor-pointer"
          >
            <option value="id">Sort by ID</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => handleTypeSelect(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 text-white py-2.5 px-3 text-sm capitalize outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Types</option>
            {POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button
            onClick={() => { setShowFavorites(!showFavorites); setPage(1) }}
            className={`flex items-center gap-2 rounded-xl border py-2.5 px-4 text-sm font-medium transition-all ${showFavorites ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 bg-black/30 text-white/60 hover:border-white/20 hover:text-white'}`}
          >
            <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favorites
            {isLoaded && favorites.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{favorites.length}</span>
            )}
          </button>
        </div>
      </div>

      {isTypeLoading ? (
        <div className="py-20 text-center text-white/40 tracking-widest uppercase text-sm">Loading type data…</div>
      ) : paginatedPokemon.length === 0 ? (
        <div className="py-20 text-center text-white/40 tracking-widest uppercase text-sm">No Pokémon found.</div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            <AnimatePresence mode="popLayout">
              {paginatedPokemon.map((pokemon, i) => {
                const id = getIdFromUrl(pokemon.url)
                return (
                  <motion.div
                    key={pokemon.name}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: (i % itemsPerPage) * 0.03 }}
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

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="text-white/40 text-sm tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPokemonId !== null && (
          <PokemonDetailModal id={selectedPokemonId} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  )
}
