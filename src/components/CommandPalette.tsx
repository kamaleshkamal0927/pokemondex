'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { sound } from '@/utils/soundFx'

interface CommandPaletteProps {
  isOpen?: boolean
  onClose?: () => void
  allPokemon?: { name: string; url: string }[]
  pokemon?: { name: string; url: string }[]
  onSelectPokemon?: (id: number) => void
  onSelect?: (id: number) => void
}

export function CommandPalette({
  isOpen = false,
  onClose,
  allPokemon,
  pokemon,
  onSelectPokemon,
  onSelect,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const pokemonList = allPokemon || pokemon || []
  const handleSelect = onSelectPokemon || onSelect || (() => {})

  const effectiveOpen = isOpen || internalOpen

  const handleClose = () => {
    if (onClose) onClose()
    setInternalOpen(false)
  }

  // Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (effectiveOpen) {
          handleClose()
        } else {
          setInternalOpen(true)
          sound.playOpen()
        }
      }
      if (e.key === 'Escape' && effectiveOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [effectiveOpen])

  useEffect(() => {
    if (effectiveOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [effectiveOpen])

  const filtered = useMemo(() => {
    if (!query.trim()) return pokemonList.slice(0, 15)
    const q = query.toLowerCase().trim()
    return pokemonList
      .filter(p => {
        const m = p.url.match(/\/pokemon\/(\d+)\//)
        const id = m ? m[1] : ''
        return p.name.includes(q) || id === q || `#${id}` === q
      })
      .slice(0, 15)
  }, [pokemonList, query])

  // Arrow navigation & Enter selection
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!effectiveOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(filtered.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(filtered.length, 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          const m = filtered[selectedIndex].url.match(/\/pokemon\/(\d+)\//)
          const id = m ? parseInt(m[1], 10) : 0
          if (id) {
            handleSelect(id)
            handleClose()
          }
        }
      }
    }
    window.addEventListener('keydown', handleNav)
    return () => window.removeEventListener('keydown', handleNav)
  }, [effectiveOpen, filtered, selectedIndex])

  if (!effectiveOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Palette HUD Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0B0C11] shadow-[0_0_80px_rgba(239,68,68,0.2)] overflow-hidden z-10 flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <Search className="h-5 w-5 text-red-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type Pokémon name or National ID #... (↑ ↓ to navigate, ↵ to inspect)"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 rounded text-white/40 hover:text-white text-xs font-mono border border-white/10 px-2 ml-2 hover:border-red-500/40"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-xs uppercase tracking-wider font-mono">
              No operative found matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((p, idx) => {
              const m = p.url.match(/\/pokemon\/(\d+)\//)
              const id = m ? parseInt(m[1], 10) : 0
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={p.name}
                  onClick={() => {
                    handleSelect(id)
                    handleClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-600/15 border border-red-500/40 text-white shadow-lg'
                      : 'border border-transparent text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold capitalize text-white">{p.name.replace('-', ' ')}</div>
                      <div className="text-[10px] font-mono text-white/40">#{id.toString().padStart(3, '0')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                      Inspect <ArrowRight className="h-3 w-3 text-red-400" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts strip */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-white/40 font-mono">
          <div className="flex items-center gap-4">
            <span>↑ ↓ navigate</span>
            <span>↵ inspect</span>
            <span>ESC dismiss</span>
          </div>
          <span className="text-red-400/80 font-bold">POKÉDEX PRO CMD</span>
        </div>
      </motion.div>
    </div>
  )
}
