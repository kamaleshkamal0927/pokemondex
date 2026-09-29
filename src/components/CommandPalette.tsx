'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft } from 'lucide-react'
import { useSoundFX } from './SoundProvider'

interface CommandPaletteProps {
  pokemon: { name: string; url: string }[]
  onSelect: (id: number) => void
}

export function CommandPalette({ pokemon, onSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { play } = useSoundFX()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlighted(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const getIdFromUrl = (url: string) => {
    const m = url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) : 0
  }

  const results = query
    ? pokemon
        .filter(p => p.name.includes(query.toLowerCase()) || String(getIdFromUrl(p.url)).includes(query))
        .slice(0, 8)
    : pokemon.slice(0, 8)

  const handleSelect = useCallback((id: number) => {
    onSelect(id)
    setOpen(false)
    play('select')
  }, [onSelect, play])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted(h => Math.min(h + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
      }
      if (e.key === 'Enter' && results[highlighted]) {
        e.preventDefault()
        handleSelect(getIdFromUrl(results[highlighted].url))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, highlighted, handleSelect])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0c0e14] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-5 w-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by name or ID…"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setHighlighted(0) }}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
                />
                <kbd className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {results.length === 0 ? (
                  <div className="py-10 text-center text-white/30 text-sm">No results for "{query}"</div>
                ) : (
                  results.map((p, i) => {
                    const id = getIdFromUrl(p.url)
                    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                    return (
                      <button
                        key={p.name}
                        onMouseEnter={() => setHighlighted(i)}
                        onClick={() => handleSelect(id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          i === highlighted ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-8 h-8 object-contain" loading="lazy" />
                        <span className="flex-1 text-sm font-medium capitalize text-white/80">{p.name.replace('-', ' ')}</span>
                        <span className="text-xs text-white/30 tabular-nums">#{id.toString().padStart(3, '0')}</span>
                        {i === highlighted && <CornerDownLeft className="h-4 w-4 text-white/20" />}
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
