'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { HeaderHUD, NavTab } from './HeaderHUD'
import { Sidebar } from './Sidebar'
import { BentoGrid } from './BentoGrid'
import { HoloDetailPanel } from './HoloDetailPanel'
import { TeamBuilder } from './TeamBuilder'
import { BattleCompare } from './BattleCompare'
import { WhosThatPokemon } from './WhosThatPokemon'
import { FavoritesView } from './FavoritesView'
import { CommandPalette } from './CommandPalette'
import { useFavorites } from '@/hooks/useFavorites'
import { GENERATIONS, getPokemonRarity } from '@/lib/pokeapi'

interface DashboardClientProps {
  initialPokemon: { name: string; url: string }[]
}

const ITEMS_PER_PAGE = 24

function getIdFromUrl(url: string) {
  const m = url.match(/\/pokemon\/(\d+)\//)
  return m ? parseInt(m[1], 10) : 0
}

export function DashboardClient({ initialPokemon }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<NavTab>('explorer')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'id' | 'name-asc' | 'name-desc'>('id')
  const [showFavorites, setShowFavorites] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [generationFilter, setGenerationFilter] = useState<number | null>(null)
  const [rarityFilter, setRarityFilter] = useState<'all' | 'legendary' | 'mythical' | 'standard'>('all')
  const [typeFilteredList, setTypeFilteredList] = useState<string[]>([])
  const [isTypeLoading, setIsTypeLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false)

  const { isFavorite, isLoaded } = useFavorites()

  const handleTypeFilter = async (type: string) => {
    setTypeFilter(type)
    setPage(1)
    if (type === 'All') {
      setTypeFilteredList([])
      return
    }
    setIsTypeLoading(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`)
      const data = await res.json()
      setTypeFilteredList(data.pokemon.map((p: any) => p.pokemon.name as string))
    } catch {
    } finally {
      setIsTypeLoading(false)
    }
  }

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    let list = initialPokemon

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(p => {
        const id = getIdFromUrl(p.url).toString()
        return p.name.includes(q) || id === q || `#${id}` === q
      })
    }

    // Favorites filter
    if (showFavorites && isLoaded) {
      list = list.filter(p => isFavorite(getIdFromUrl(p.url)))
    }

    // Type filter
    if (typeFilter !== 'All' && typeFilteredList.length > 0) {
      list = list.filter(p => typeFilteredList.includes(p.name))
    }

    // Generation filter
    if (generationFilter !== null) {
      const genConfig = GENERATIONS.find(g => g.id === generationFilter)
      if (genConfig) {
        list = list.filter(p => {
          const id = getIdFromUrl(p.url)
          return id >= genConfig.startId && id <= genConfig.endId
        })
      }
    }

    // Rarity filter
    if (rarityFilter !== 'all') {
      list = list.filter(p => {
        const id = getIdFromUrl(p.url)
        return getPokemonRarity(id) === rarityFilter
      })
    }

    // Sorting
    if (sort === 'name-asc') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'name-desc') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    } else {
      list = [...list].sort((a, b) => getIdFromUrl(a.url) - getIdFromUrl(b.url))
    }

    return list
  }, [
    initialPokemon,
    search,
    showFavorites,
    isLoaded,
    typeFilter,
    typeFilteredList,
    generationFilter,
    rarityFilter,
    sort,
  ])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openDetail = useCallback((id: number) => setSelectedId(id), [])
  const closeDetail = useCallback(() => setSelectedId(null), [])

  // Prev / Next Navigation in Modal
  const currentFilteredIds = filtered.map(p => getIdFromUrl(p.url))
  const currentIndex = selectedId !== null ? currentFilteredIds.indexOf(selectedId) : -1
  const onPrev = currentIndex > 0 ? () => setSelectedId(currentFilteredIds[currentIndex - 1]) : undefined
  const onNext =
    currentIndex < currentFilteredIds.length - 1
      ? () => setSelectedId(currentFilteredIds[currentIndex + 1])
      : undefined

  return (
    <div
      className={`relative min-h-screen flex flex-col bg-[#08090C] text-white ${
        scanlinesEnabled ? 'scanlines' : ''
      }`}
    >
      {/* Top Gaming HUD Header */}
      <HeaderHUD
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        scanlinesEnabled={scanlinesEnabled}
        setScanlinesEnabled={setScanlinesEnabled}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* EXPLORER TAB */}
        {activeTab === 'explorer' && (
          <>
            <Sidebar
              search={search}
              setSearch={v => {
                setSearch(v)
                setPage(1)
              }}
              typeFilter={typeFilter}
              setTypeFilter={handleTypeFilter}
              generationFilter={generationFilter}
              setGenerationFilter={g => {
                setGenerationFilter(g)
                setPage(1)
              }}
              rarityFilter={rarityFilter}
              setRarityFilter={r => {
                setRarityFilter(r)
                setPage(1)
              }}
              showFavorites={showFavorites}
              setShowFavorites={v => {
                setShowFavorites(v)
                setPage(1)
              }}
              totalCount={initialPokemon.length}
              filteredCount={filtered.length}
              sort={sort}
              setSort={v => {
                setSort(v as any)
                setPage(1)
              }}
            />

            <main className="flex-1 lg:ml-64 min-w-0 p-4 sm:p-6 lg:p-8">
              {/* Explorer Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                    National Pokédex
                  </h1>
                  <p className="text-xs text-white/40 tracking-wider font-mono uppercase mt-1">
                    {isTypeLoading
                      ? 'Querying elemental mainframe...'
                      : `${filtered.length.toLocaleString()} OPERATIVES LOGGED`}
                  </p>
                </div>
              </div>

              {/* Grid or Status */}
              {isTypeLoading ? (
                <div className="flex items-center justify-center py-32 text-white/40 text-xs font-mono tracking-widest uppercase">
                  <div className="w-7 h-7 border-2 border-white/10 border-t-red-500 rounded-full animate-spin mr-3" />
                  Querying Type Matrix...
                </div>
              ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                  <div className="text-5xl">📡</div>
                  <p className="text-white/60 text-sm font-black uppercase tracking-wider">
                    No Operatives Detected
                  </p>
                  <p className="text-xs text-white/30">Try clearing active filters or search terms.</p>
                </div>
              ) : (
                <BentoGrid pokemonList={paginated} onSelect={openDetail} page={page} />
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-white/60 hover:text-white hover:border-red-500/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ← PREV
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pg = i + 1
                      if (totalPages > 5) {
                        if (page <= 3) pg = i + 1
                        else if (page >= totalPages - 2) pg = totalPages - 4 + i
                        else pg = page - 2 + i
                      }
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-9 h-9 rounded-xl text-xs font-mono font-black transition-all ${
                            pg === page
                              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                              : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {pg}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-white/60 hover:text-white hover:border-red-500/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    NEXT →
                  </button>
                </div>
              )}
            </main>
          </>
        )}

        {/* TEAM BUILDER TAB */}
        {activeTab === 'team' && (
          <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <TeamBuilder allPokemon={initialPokemon} onInspect={openDetail} />
          </main>
        )}

        {/* BATTLE COMPARE TAB */}
        {activeTab === 'battle' && (
          <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <BattleCompare allPokemon={initialPokemon} onInspect={openDetail} />
          </main>
        )}

        {/* GUESS WHO MINI-GAME TAB */}
        {activeTab === 'minigame' && (
          <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <WhosThatPokemon allPokemon={initialPokemon} />
          </main>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <FavoritesView
              allPokemon={initialPokemon}
              onSelectPokemon={openDetail}
              onExplore={() => setActiveTab('explorer')}
            />
          </main>
        )}
      </div>

      {/* Global Inspection Modal */}
      <AnimatePresence>
        {selectedId !== null && (
          <HoloDetailPanel
            id={selectedId}
            onClose={closeDetail}
            onPrev={onPrev}
            onNext={onNext}
            onSelectPokemon={openDetail}
          />
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        allPokemon={initialPokemon}
        onSelectPokemon={openDetail}
      />
    </div>
  )
}
