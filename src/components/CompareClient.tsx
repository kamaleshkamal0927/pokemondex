'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Swords } from 'lucide-react'
import { TypeBadge } from './TypeBadge'
import { StatRadar } from './StatRadar'
import { useSoundFX } from './SoundProvider'
import { TYPE_COLORS } from '@/constants/typeColors'
import { getTypeEffectiveness, PokemonType } from '@/utils/typeEffectiveness'
import { getStatTier } from '@/utils/pokemonUtils'

interface CompareClientProps {
  allPokemon: { name: string; url: string }[]
}

interface CompareMember {
  id: number
  name: string
  types: string[]
  stats: any[]
  sprite: string
  artwork: string
}

export function CompareClient({ allPokemon }: CompareClientProps) {
  const [members, setMembers] = useState<CompareMember[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [addingSlot, setAddingSlot] = useState<number | null>(null)
  const { play } = useSoundFX()

  const getIdFromUrl = (url: string) => {
    const m = url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) : 0
  }

  const searchResults = useMemo(() => {
    if (!search) return allPokemon.slice(0, 20)
    return allPokemon.filter(p => p.name.includes(search.toLowerCase())).slice(0, 20)
  }, [search, allPokemon])

  const addPokemon = useCallback(async (pokemon: { name: string; url: string }) => {
    const id = getIdFromUrl(pokemon.url)
    play('select')
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const data = await res.json()
      const member: CompareMember = {
        id,
        name: pokemon.name,
        types: data.types.map((t: any) => t.type.name),
        stats: data.stats,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      }
      setMembers(prev => {
        if (addingSlot !== null && addingSlot < prev.length) {
          const newMembers = [...prev]
          newMembers[addingSlot] = member
          return newMembers
        }
        if (prev.length >= 3) return prev
        return [...prev, member]
      })
      setShowSearch(false)
      setAddingSlot(null)
      setSearch('')
    } catch {
      play('error')
    }
  }, [addingSlot, play])

  const removePokemon = (index: number) => {
    play('close')
    setMembers(prev => prev.filter((_, i) => i !== index))
  }

  // Type advantage prediction
  const typeAdvantage = useMemo(() => {
    if (members.length < 2) return null
    const results: string[] = []
    for (let i = 0; i < members.length; i++) {
      for (let j = 0; j < members.length; j++) {
        if (i === j) continue
        const attackerTypes = members[i].types as PokemonType[]
        const defenderTypes = members[j].types as PokemonType[]
        const { weaknesses } = getTypeEffectiveness(defenderTypes)
        const advantageMultiplier = weaknesses
          .filter(w => attackerTypes.includes(w.type as PokemonType))
          .reduce((max, w) => Math.max(max, w.multiplier), 1)
        if (advantageMultiplier > 1) {
          results.push(`${members[i].name} → ${members[j].name}: ${advantageMultiplier}x super effective`)
        }
      }
    }
    return results
  }, [members])

  const maxSlots = 3

  return (
    <div className="w-full px-4 md:px-8 lg:px-12">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-400 to-orange-300 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Battle Compare</h1>
        </div>
        <p className="text-sm text-white/40 ml-4">Select up to 3 Pokémon to compare stats and type advantages side-by-side.</p>
      </div>

      {/* Compare Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: maxSlots }).map((_, i) => {
          const member = members[i]
          if (member) {
            const bst = member.stats.reduce((acc: number, s: any) => acc + s.base_stat, 0)
            const tier = getStatTier(bst)
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6"
              >
                <button
                  onClick={() => removePokemon(i)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-black/50 text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex flex-col items-center mb-4">
                  <img src={member.artwork} alt={member.name} className="w-32 h-32 object-contain drop-shadow-2xl" />
                  <h3 className="text-xl font-black capitalize text-white mt-2">{member.name.replace('-', ' ')}</h3>
                  <span className="text-xs text-white/30 tabular-nums">#{member.id.toString().padStart(3, '0')}</span>
                  <div className="flex gap-2 mt-2">
                    {member.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-widest text-white/40">BST</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-gradient-to-r {tier.color} text-black" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      Tier {tier.tier}
                    </span>
                    <span className="text-sm font-bold text-white">{bst}</span>
                  </div>
                </div>
                <StatRadar stats={member.stats} />
              </motion.div>
            )
          }
          return (
            <button
              key={i}
              onClick={() => { setShowSearch(true); setAddingSlot(i); play('click') }}
              className="rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center min-h-[400px] transition-all group"
            >
              <Plus className="h-10 w-10 text-white/20 group-hover:text-white/40 transition-colors" />
              <span className="text-sm text-white/20 mt-3 uppercase tracking-wider">Add Pokémon</span>
            </button>
          )
        })}
      </div>

      {/* Type Advantage Prediction */}
      {typeAdvantage && typeAdvantage.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest">Type Advantage Predictions</h3>
          </div>
          <div className="space-y-2">
            {typeAdvantage.map((adv, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-4 py-2 text-sm text-white/70"
              >
                <span className="text-emerald-400 font-bold capitalize">{adv.split(' → ')[0].replace('-', ' ')}</span>
                <span className="text-white/30">→</span>
                <span className="text-red-400 font-bold capitalize">{adv.split(' → ')[1].split(':')[0].replace('-', ' ')}</span>
                <span className="ml-auto text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">{adv.split(': ')[1]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowSearch(false); setAddingSlot(null) }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0c0e14] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-5 w-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Add Pokémon to compare…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
                  autoFocus
                />
                <button onClick={() => { setShowSearch(false); setAddingSlot(null) }} className="text-white/30 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {searchResults.map(p => {
                  const id = getIdFromUrl(p.url)
                  return (
                    <button
                      key={p.name}
                      onClick={() => addPokemon(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
                    >
                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} alt="" className="w-8 h-8 object-contain" loading="lazy" />
                      <span className="flex-1 text-sm font-medium capitalize text-white/80">{p.name.replace('-', ' ')}</span>
                      <span className="text-xs text-white/30 tabular-nums">#{id.toString().padStart(3, '0')}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
