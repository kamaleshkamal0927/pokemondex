'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HoloCard, HoloCardSkeleton } from './HoloCard'

interface BentoItem {
  name: string
  url: string
  id: number
  types: string[]
}

interface BentoGridProps {
  pokemonList: { name: string; url: string }[]
  onSelect: (id: number) => void
  page: number
}

function getIdFromUrl(url: string) {
  const m = url.match(/\/pokemon\/(\d+)\//)
  return m ? parseInt(m[1], 10) : 0
}

export function BentoGrid({ pokemonList, onSelect, page }: BentoGridProps) {
  const [items, setItems] = useState<BentoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setItems([])

    const ids = pokemonList.map(p => ({ name: p.name, url: p.url, id: getIdFromUrl(p.url) }))

    Promise.all(
      ids.map(async ({ name, url, id }) => {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          if (!res.ok) return { name, url, id, types: ['normal'] }
          const data = await res.json()
          return { name, url, id, types: data.types.map((t: any) => t.type.name) as string[] }
        } catch {
          return { name, url, id, types: ['normal'] }
        }
      })
    ).then(results => {
      setItems(results)
      setLoading(false)
    })
  }, [page, pokemonList.map(p => p.name).join(',')])

  if (loading) {
    return (
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {pokemonList.map((_, i) => {
          const size = i === 0 ? 'lg' : i < 3 ? 'md' : 'sm'
          return <HoloCardSkeleton key={i} size={size} />
        })}
      </div>
    )
  }

  // Build bento pattern: first item = large, next 2 = medium, rest = small (repeating)
  const renderItems = items.map((item, i) => {
    const posInGroup = i % 6
    let size: 'sm' | 'md' | 'lg' = 'sm'
    if (posInGroup === 0) size = 'lg'
    else if (posInGroup === 1 || posInGroup === 2) size = 'md'
    return { ...item, size }
  })

  return (
    <motion.div
      layout
      className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {renderItems.map((item, i) => (
          <motion.div
            key={`${item.id}-${page}`}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: 'easeOut' }}
            className="mb-4 break-inside-avoid"
          >
            <HoloCard
              name={item.name}
              id={item.id}
              types={item.types}
              onClick={() => onSelect(item.id)}
              size={item.size}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
