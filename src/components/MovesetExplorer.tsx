'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TypeBadge } from './TypeBadge'
import { useSoundFX } from './SoundProvider'
import { PokemonMove } from '@/lib/pokeapi'

interface MovesetExplorerProps {
  moves: PokemonMove[]
}

type MoveCategory = 'level-up' | 'machine' | 'egg' | 'other'

const CATEGORIES: { key: MoveCategory; label: string }[] = [
  { key: 'level-up', label: 'Level Up' },
  { key: 'machine', label: 'TM / HM' },
  { key: 'egg', label: 'Egg Moves' },
  { key: 'other', label: 'Other' },
]

export function MovesetExplorer({ moves }: MovesetExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<MoveCategory>('level-up')
  const [expandedMove, setExpandedMove] = useState<string | null>(null)
  const [moveDetails, setMoveDetails] = useState<Record<string, { power: number | null; accuracy: number | null; type: string }>>({})
  const { play } = useSoundFX()

  const categorizedMoves = (cat: MoveCategory) => {
    return moves.filter(m =>
      m.version_group_details.some(d => d.move_learn_method.name === cat)
    ).slice(0, 12)
  }

  const currentMoves = categorizedMoves(activeCategory)

  const fetchMoveDetail = async (moveName: string) => {
    if (moveDetails[moveName]) return
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`)
      const data = await res.json()
      setMoveDetails(prev => ({
        ...prev,
        [moveName]: { power: data.power, accuracy: data.accuracy, type: data.type.name },
      }))
    } catch {}
  }

  const handleToggle = (moveName: string) => {
    if (expandedMove === moveName) {
      setExpandedMove(null)
    } else {
      setExpandedMove(moveName)
      fetchMoveDetail(moveName)
      play('scan')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => {
          const count = moves.filter(m =>
            m.version_group_details.some(d => d.move_learn_method.name === cat.key)
          ).length
          if (count === 0) return null
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); play('click') }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat.key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/30 hover:text-white/60 border border-transparent'
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
        {currentMoves.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-6">No moves in this category.</div>
        ) : (
          currentMoves.map((m, i) => {
            const detail = m.version_group_details.find(d => d.move_learn_method.name === activeCategory)
            const level = detail?.level_learned_at || 0
            const info = moveDetails[m.move.name]
            const isExpanded = expandedMove === m.move.name

            return (
              <motion.div
                key={m.move.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  onClick={() => handleToggle(m.move.name)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
                >
                  {activeCategory === 'level-up' && (
                    <span className="w-8 text-xs font-bold text-white/40 tabular-nums">{level > 0 ? `Lv${level}` : '—'}</span>
                  )}
                  <span className="flex-1 text-sm font-medium capitalize text-white/70">{m.move.name.replace('-', ' ')}</span>
                  {info && <TypeBadge type={info.type} className="!px-2 !py-0.5 !text-[10px]" />}
                  <span className="text-white/20 text-xs">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-3 pb-2"
                  >
                    <div className="flex gap-4 text-xs text-white/40 pl-8">
                      {info ? (
                        <>
                          <span>Power: <span className="text-white/70 font-bold">{info.power ?? '—'}</span></span>
                          <span>Accuracy: <span className="text-white/70 font-bold">{info.accuracy ? `${info.accuracy}%` : '—'}</span></span>
                          <span>Type: <span className="text-white/70 font-bold capitalize">{info.type}</span></span>
                        </>
                      ) : (
                        <span className="animate-pulse">Loading…</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
