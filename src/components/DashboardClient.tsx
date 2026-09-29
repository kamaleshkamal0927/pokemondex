'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Heart, Zap, Star, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PokemonCard } from './PokemonCard'
import { PokemonDetailModal } from './PokemonDetailModal'
import { CommandPalette } from './CommandPalette'
import { useApp } from './AppProvider'
import { useSoundFX } from './SoundProvider'
import { TYPE_COLORS } from '@/constants/typeColors'
import { POKEMON_GENERATIONS } from '@/lib/pokeapi'
import { getGeneration } from '@/utils/pokemonUtils'

interface DashboardClientProps {
  initialPokemon: { name: string; url: string }[]
}

const POKEMON_TYPES = Object.keys(TYPE_COLORS).filter(t => t !== 'default')

type SortKey = 'id' | 'name-asc' | 'name-desc' | 'bst' | 'speed' | 'attack'

export function DashboardClient({ initialPokemon }: DashboardClientProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('id')
  const [showFavorites, setShowFavorites] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [typeFilteredList, setTypeFilteredList] = useState<string[]>([])
  const [isTypeLoading, setIsTypeLoading] = useState(false)
  const [genFilter, setGenFilter] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [statSortData, setStatSortData] = useState<Record<string, number>>({})
  const itemsPerPage = 24

  const { favorites, isFavorite, isLoaded } = useApp().favorites
  const { selectedPokemonId, setSelectedPokemonId } = useApp()
  const { play } = useSoundFX()

  const getIdFromUrl = (url: string) => {
    const m = url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) : 0
  }

  const handleTypeSelect = async (type: string) => {
    setTypeFilter(type)
    setPage(1)
    play('click')
    if (type === 'All') { setTypeFilteredList([]); return }
    setIsTypeLoading(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`)
      const data = await res.json()
      setTypeFilteredList(data.pokemon.map((p: any) => p.pokemon.name))
    } catch (e) { console.error(e) }
    finally { setIsTypeLoading(false) }
  }

  // Fetch stats for sorting when needed
  const fetchStatForSort = useCallback(async (name: string) => {
    if (statSortData[name] !== undefined) return
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      const data = await res.json()
      const bst = data.stats.reduce((acc: number, s: any) => acc + s.base_stat, 0)
      const speed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0
      const attack = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0
      setStatSortData(prev => ({
        ...prev,
        [`${name}_bst`]: bst,
        [`${name}_speed`]: speed,
        [`${name}_attack`]: attack,
      }))
    } catch {}
  }, [statSortData])

  const filteredPokemon = useMemo(() => {
    let result = initialPokemon

    if (search) result = result.filter(p => p.name.includes(search.toLowerCase()) || String(getIdFromUrl(p.url)).includes(search))
    if (showFavorites && isLoaded) {
      result = result.filter(p => isFavorite(getIdFromUrl(p.url)))
    }
    if (typeFilter !== 'All' && typeFilteredList.length > 0) {
      result = result.filter(p => typeFilteredList.includes(p.name))
    }
    if (genFilter !== null) {
      const gen = POKEMON_GENERATIONS[genFilter]
      result = result.filter(p => {
        const id = getIdFromUrl(p.url)
        return id >= gen.start && id <= gen.end
      })
    }
    // Exclude non-standard pokemon (id > 1025)
    result = result.filter(p => getIdFromUrl(p.url) <= 1025)

    if (sort === 'name-asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'name-desc') result = [...result].sort((a, b) => b.name.localeCompare(a.name))
    else if (sort === 'bst' || sort === 'speed' || sort === 'attack') {
      const key = sort
      result = [...result].sort((a, b) => {
        const va = statSortData[`${a.name}_${key}`] ?? 0
        const vb = statSortData[`${b.name}_${key}`] ?? 0
        return vb - va
      })
      // Trigger fetches for missing data
      result.slice(0, itemsPerPage).forEach(p => fetchStatForSort(p.name))
    }

    return result
  }, [initialPokemon, search, showFavorites, isLoaded, favorites, typeFilter, typeFilteredList, genFilter, sort, statSortData, fetchStatForSort])

  const paginatedPokemon = filteredPokemon.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage)

  const openModal = useCallback((id: number) => { setSelectedPokemonId(id); play('open') }, [setSelectedPokemonId, play])
  const closeModal = useCallback(() => { setSelectedPokemonId(null); play('close') }, [setSelectedPokemonId, play])

  return (
    <div className="w-full px-4 md:px-8 lg:px-12">
      <CommandPalette pokemon={initialPokemon} onSelect={openModal} />

      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Dashboard</h1>
        </div>
        <p className="text-sm text-white/40 ml-4">Search, filter, and explore the entire Pokémon universe.</p>
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-4 md:flex-row md:items-center">
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
          <div className="relative">
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as SortKey); setPage(1); play('click') }}
              className="rounded-xl border border-white/10 bg-black/30 text-white py-2.5 pl-3 pr-9 text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="id">Sort: ID</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="bst">Base Stat Total</option>
              <option value="speed">Speed</option>
              <option value="attack">Attack</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => handleTypeSelect(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 text-white py-2.5 pl-3 pr-9 text-sm capitalize outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Types</option>
              {POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={genFilter ?? ''}
              onChange={e => { setGenFilter(e.target.value ? parseInt(e.target.value) : null); setPage(1); play('click') }}
              className="rounded-xl border border-white/10 bg-black/30 text-white py-2.5 pl-3 pr-9 text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="">All Gens</option>
              {POKEMON_GENERATIONS.map((g, i) => <option key={i} value={i}>{g.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          </div>

          <button
            onClick={() => { setShowFavorites(!showFavorites); setPage(1); play('click') }}
            className={`flex items-center gap-2 rounded-xl border py-2.5 px-4 text-sm font-medium transition-all ${showFavorites ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 bg-black/30 text-white/60 hover:border-white/20 hover:text-white'}`}
          >
            <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            {isLoaded && favorites.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{favorites.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Generation quick pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setGenFilter(null); setPage(1); play('click') }}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${genFilter === null ? 'bg-white/10 text-white border border-white/20' : 'text-white/30 hover:text-white/60 border border-transparent'}`}
        >
          All
        </button>
        {POKEMON_GENERATIONS.map((g, i) => (
          <button
            key={i}
            onClick={() => { setGenFilter(i); setPage(1); play('click') }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${genFilter === i ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-white/30 hover:text-white/60 border border-transparent'}`}
          >
            {g.name}
          </button>
        ))}
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
                    transition={{ duration: 0.3, delay: (i % itemsPerPage) * 0.02 }}
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
                onClick={() => { setPage(p => Math.max(1, p - 1)); play('click') }}
                disabled={page === 1}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="text-white/40 text-sm tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); play('click') }}
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
