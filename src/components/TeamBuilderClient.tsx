'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus, Download, Upload, Shield } from 'lucide-react'
import { TypeBadge } from './TypeBadge'
import { useSoundFX } from './SoundProvider'
import { TYPE_COLORS } from '@/constants/typeColors'
import { getTypeEffectiveness, PokemonType } from '@/utils/typeEffectiveness'

interface TeamBuilderClientProps {
  allPokemon: { name: string; url: string }[]
}

interface TeamMember {
  id: number
  name: string
  types: string[]
  sprite: string
}

const ALL_TYPES = Object.keys(TYPE_COLORS).filter(t => t !== 'default') as PokemonType[]

export function TeamBuilderClient({ allPokemon }: TeamBuilderClientProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [addingSlot, setAddingSlot] = useState<number | null>(null)
  const [typeCache, setTypeCache] = useState<Record<string, { types: string[] }>>({})
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

    let types = typeCache[pokemon.name]?.types
    if (!types) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const data = await res.json()
        types = data.types.map((t: any) => t.type.name)
        setTypeCache(prev => ({ ...prev, [pokemon.name]: { types } }))
      } catch {
        types = ['normal']
      }
    }

    const member: TeamMember = {
      id,
      name: pokemon.name,
      types,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    }

    setTeam(prev => {
      if (addingSlot !== null && addingSlot < prev.length) {
        const newTeam = [...prev]
        newTeam[addingSlot] = member
        return newTeam
      }
      if (prev.length >= 6) return prev
      return [...prev, member]
    })
    setShowSearch(false)
    setAddingSlot(null)
    setSearch('')
  }, [typeCache, addingSlot, play])

  const removePokemon = (index: number) => {
    play('close')
    setTeam(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate team type coverage
  const teamCoverage = useMemo(() => {
    if (team.length === 0) return null
    const allWeaknesses: Record<string, number> = {}
    const allResistances: Record<string, number> = {}

    team.forEach(member => {
      const { weaknesses, resistances, immunities } = getTypeEffectiveness(member.types as PokemonType[])
      weaknesses.forEach(w => {
        allWeaknesses[w.type] = (allWeaknesses[w.type] || 0) + 1
      })
      resistances.forEach(r => {
        allResistances[r.type] = (allResistances[r.type] || 0) + 1
      })
      immunities.forEach(i => {
        allResistances[i.type] = (allResistances[i.type] || 0) + 1
      })
    })

    // Net coverage = resistances - weaknesses
    const netCoverage: Record<string, number> = {}
    ALL_TYPES.forEach(t => {
      netCoverage[t] = (allResistances[t] || 0) - (allWeaknesses[t] || 0)
    })

    return { allWeaknesses, allResistances, netCoverage }
  }, [team])

  const exportTeam = () => {
    const data = JSON.stringify(team.map(m => ({ id: m.id, name: m.name })), null, 2)
    navigator.clipboard.writeText(data)
    play('success')
  }

  const importTeam = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const newTeam: TeamMember[] = await Promise.all(data.map(async (m: { id: number; name: string }) => {
          let types = typeCache[m.name]?.types
          if (!types) {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${m.id}`)
            const d = await res.json()
            types = d.types.map((t: any) => t.type.name)
          }
          return {
            id: m.id,
            name: m.name,
            types,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`,
          }
        }))
        setTeam(newTeam.slice(0, 6))
        play('success')
      } catch {
        play('error')
      }
    }
    input.click()
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-green-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Team Builder</h1>
        </div>
        <p className="text-sm text-white/40 ml-4">Draft a team of up to 6 Pokémon and analyze type coverage.</p>
      </div>

      {/* Action bar */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={exportTeam}
          disabled={team.length === 0}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30"
        >
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          onClick={importTeam}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <Upload className="h-4 w-4" /> Import
        </button>
      </div>

      {/* Team Slots */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => {
          const member = team[i]
          if (member) {
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex flex-col items-center group hover:border-white/20 transition-all"
              >
                <button
                  onClick={() => removePokemon(i)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
                <img src={member.sprite} alt={member.name} className="w-20 h-20 object-contain drop-shadow-lg" />
                <span className="text-sm font-bold capitalize text-white mt-2">{member.name.replace('-', ' ')}</span>
                <div className="flex gap-1 mt-2">
                  {member.types.map(t => <TypeBadge key={t} type={t} className="!px-2 !py-0.5 !text-[9px]" />)}
                </div>
              </motion.div>
            )
          }
          return (
            <button
              key={i}
              onClick={() => { setShowSearch(true); setAddingSlot(i); play('click') }}
              className="rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 p-4 flex flex-col items-center justify-center min-h-[160px] transition-all group"
            >
              <Plus className="h-8 w-8 text-white/20 group-hover:text-white/40 transition-colors" />
              <span className="text-xs text-white/20 mt-2 uppercase tracking-wider">Slot {i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* Type Coverage Heatmap */}
      {teamCoverage && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest">Type Coverage</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {ALL_TYPES.map(type => {
              const net = teamCoverage.netCoverage[type]
              const weaknessCount = teamCoverage.allWeaknesses[type] || 0
              const resistanceCount = teamCoverage.allResistances[type] || 0
              const color = TYPE_COLORS[type] || TYPE_COLORS.default
              const netColor = net > 0 ? 'bg-emerald-500/80' : net < 0 ? 'bg-red-500/80' : 'bg-white/10'
              const netText = net > 0 ? `+${net}` : net === 0 ? '0' : String(net)

              return (
                <div
                  key={type}
                  className={`rounded-xl border border-white/10 p-3 flex flex-col items-center gap-2 ${net > 0 ? 'bg-emerald-500/[0.05]' : net < 0 ? 'bg-red-500/[0.05]' : ''}`}
                >
                  <TypeBadge type={type} className="!text-[10px] !px-2 !py-0.5" />
                  <div className={`w-8 h-8 rounded-full ${netColor} flex items-center justify-center text-xs font-black text-white`}>
                    {netText}
                  </div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">
                    W:{weaknessCount} R:{resistanceCount}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/80" /> Strong</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/80" /> Weak</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-white/10" /> Neutral</span>
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
                  placeholder="Add Pokémon to team…"
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
