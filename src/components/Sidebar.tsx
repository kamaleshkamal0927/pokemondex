'use client'

import { useState } from 'react'
import { Search, Heart, X, LayoutGrid, Filter, Globe, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TYPE_COLORS } from '@/constants/typeColors'
import { useFavorites } from '@/hooks/useFavorites'
import { GENERATIONS } from '@/lib/pokeapi'
import { sound } from '@/utils/soundFx'

interface SidebarProps {
  search: string
  setSearch: (v: string) => void
  typeFilter: string
  setTypeFilter: (v: string) => void
  generationFilter: number | null
  setGenerationFilter: (gen: number | null) => void
  rarityFilter: 'all' | 'legendary' | 'mythical' | 'standard'
  setRarityFilter: (rarity: 'all' | 'legendary' | 'mythical' | 'standard') => void
  showFavorites: boolean
  setShowFavorites: (v: boolean) => void
  totalCount: number
  filteredCount: number
  sort: string
  setSort: (v: string) => void
}

const TYPES = Object.keys(TYPE_COLORS).filter(t => t !== 'default')

export function Sidebar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  generationFilter,
  setGenerationFilter,
  rarityFilter,
  setRarityFilter,
  showFavorites,
  setShowFavorites,
  totalCount,
  filteredCount,
  sort,
  setSort,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { favorites } = useFavorites()

  const sidebarContent = (
    <div className="flex h-full flex-col gap-5 p-5 overflow-y-auto">
      {/* Stats Counter */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.02] border border-white/10 p-3">
        <div className="text-center">
          <div className="text-xl font-black text-white font-mono">
            {filteredCount}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">Showing</div>
        </div>
        <div className="text-center border-l border-white/10">
          <div className="text-xl font-black text-white font-mono">
            {totalCount}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">Total</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Filter by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-8 text-xs text-white placeholder:text-white/30 outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Generation Matrix Filter */}
      <div>
        <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-red-400" /> Generation Region
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => {
              sound.playClick()
              setGenerationFilter(null)
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
              generationFilter === null
                ? 'bg-red-600/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            All Regions
          </button>
          {GENERATIONS.map(gen => {
            const isSel = generationFilter === gen.id
            return (
              <button
                key={gen.id}
                onClick={() => {
                  sound.playClick()
                  setGenerationFilter(isSel ? null : gen.id)
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-left truncate transition-all ${
                  isSel
                    ? 'bg-red-600/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {gen.name} ({gen.region})
              </button>
            )
          })}
        </div>
      </div>

      {/* Rarity Status Filter */}
      <div>
        <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-red-400" /> Rarity Classification
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(
            [
              { id: 'all', label: 'All Rarities' },
              { id: 'legendary', label: 'Legendary' },
              { id: 'mythical', label: 'Mythical' },
              { id: 'standard', label: 'Standard' },
            ] as const
          ).map(r => (
            <button
              key={r.id}
              onClick={() => {
                sound.playClick()
                setRarityFilter(r.id)
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-left transition-all ${
                rarityFilter === r.id
                  ? 'bg-red-600/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Criteria */}
      <div>
        <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <LayoutGrid className="h-3 w-3 text-red-400" /> Sorting Criteria
        </div>
        <div className="flex flex-col gap-1">
          {(['id', 'name-asc', 'name-desc'] as const).map(s => (
            <button
              key={s}
              onClick={() => {
                sound.playClick()
                setSort(s)
              }}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                sort === s
                  ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {s === 'id' ? 'National Number (#)' : s === 'name-asc' ? 'Name (A → Z)' : 'Name (Z → A)'}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Toggle Button */}
      <button
        onClick={() => {
          sound.playClick()
          setShowFavorites(!showFavorites)
        }}
        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
          showFavorites
            ? 'border-red-500/50 bg-red-600/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/20'
        }`}
      >
        <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current text-red-400' : ''}`} />
        <span>Favorites Only</span>
        {favorites.length > 0 && (
          <span className="ml-auto rounded-full bg-red-500/30 text-red-300 border border-red-500/40 px-2 py-0.2 text-[9px] font-mono font-bold">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Elemental Type Filter Chips */}
      <div>
        <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-red-400" /> Elemental Type
        </div>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => {
              sound.playClick()
              setTypeFilter('All')
            }}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              typeFilter === 'All'
                ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-white/40 inline-block" />
            All Types
          </button>
          {TYPES.map(type => {
            const c = TYPE_COLORS[type]
            const isSelected = typeFilter === type
            return (
              <button
                key={type}
                onClick={() => {
                  sound.playClick()
                  setTypeFilter(type)
                }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all capitalize ${
                  isSelected
                    ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                  style={{ backgroundColor: c.neon, boxShadow: `0 0 6px ${c.neon}` }}
                />
                {type}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-[65px] h-[calc(100vh-65px)] w-64 flex-col border-r border-white/[0.08] bg-[#08090C]/90 backdrop-blur-xl z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Floating Filter Button */}
      <button
        onClick={() => {
          sound.playClick()
          setIsOpen(true)
        }}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-400/40"
        title="Open Filter Matrix"
      >
        <Filter className="h-5 w-5" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 border-r border-white/10 bg-[#08090C] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Filter Matrix
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
