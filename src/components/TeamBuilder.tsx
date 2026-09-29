'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Swords, Plus, Trash2, Download, Upload, Copy, Check, Sparkles, X, ChevronRight } from 'lucide-react'
import { useTeam, TeamMember, MAX_TEAM_SIZE } from '@/hooks/useTeam'
import { TYPE_COLORS } from '@/constants/typeColors'
import { getTypeEffectiveness, PokemonType } from '@/utils/typeEffectiveness'
import { RadarChart, getTier } from './RadarChart'
import { sound } from '@/utils/soundFx'

interface TeamBuilderProps {
  allPokemon: { name: string; url: string }[]
  onInspect: (id: number) => void
}

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

export function TeamBuilder({ allPokemon, onInspect }: TeamBuilderProps) {
  const { team, removeMember, clearTeam, exportTeamJSON, importTeamJSON, addMember } = useTeam()
  const [copied, setCopied] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [searchPickerOpen, setSearchPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate Team Defensive Type Matrix
  const typeAnalysis = useMemo(() => {
    const analysis: Record<PokemonType, { weaknesses: number; resistances: number; immunities: number }> = {} as any

    ALL_TYPES.forEach(t => {
      analysis[t] = { weaknesses: 0, resistances: 0, immunities: 0 }
    })

    team.forEach(member => {
      const { weaknesses, resistances, immunities } = getTypeEffectiveness(member.types as PokemonType[])
      weaknesses.forEach(w => {
        if (analysis[w.type]) analysis[w.type].weaknesses += 1
      })
      resistances.forEach(r => {
        if (analysis[r.type]) analysis[r.type].resistances += 1
      })
      immunities.forEach(im => {
        if (analysis[im.type]) analysis[im.type].immunities += 1
      })
    })

    return analysis
  }, [team])

  // Offensive coverage: which types the team hits with 2x STAB moves
  const offensiveCoverage = useMemo(() => {
    const coverage = new Set<PokemonType>()
    team.forEach(member => {
      member.types.forEach(t => {
        // Types that 't' hits for 2x
        const effect = getTypeEffectiveness([t as PokemonType])
        effect.weaknesses.forEach(w => coverage.add(w.type))
      })
    })
    return coverage
  }, [team])

  // Team Average Stats
  const teamAverages = useMemo(() => {
    if (team.length === 0) {
      return { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, bst: 0 }
    }
    const sum = team.reduce(
      (acc, m) => ({
        hp: acc.hp + (m.stats?.hp || 70),
        attack: acc.attack + (m.stats?.attack || 70),
        defense: acc.defense + (m.stats?.defense || 70),
        specialAttack: acc.specialAttack + (m.stats?.specialAttack || 70),
        specialDefense: acc.specialDefense + (m.stats?.specialDefense || 70),
        speed: acc.speed + (m.stats?.speed || 70),
        bst: acc.bst + (m.bst || 420),
      }),
      { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, bst: 0 }
    )
    const n = team.length
    return {
      hp: Math.round(sum.hp / n),
      attack: Math.round(sum.attack / n),
      defense: Math.round(sum.defense / n),
      specialAttack: Math.round(sum.specialAttack / n),
      specialDefense: Math.round(sum.specialDefense / n),
      speed: Math.round(sum.speed / n),
      bst: Math.round(sum.bst / n),
    }
  }, [team])

  const teamTier = getTier(teamAverages.bst)

  const handleCopyJSON = () => {
    const json = exportTeamJSON()
    navigator.clipboard.writeText(json)
    setCopied(true)
    sound.playSuccess()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImportSubmit = () => {
    if (importTeamJSON(importText)) {
      setImportModalOpen(false)
      setImportText('')
    }
  }

  const filteredPicker = useMemo(() => {
    if (!searchQuery.trim()) return allPokemon.slice(0, 30)
    return allPokemon.filter(p => p.name.includes(searchQuery.toLowerCase().trim())).slice(0, 30)
  }, [allPokemon, searchQuery])

  const draftFromPicker = async (p: { name: string; url: string }) => {
    const m = p.url.match(/\/pokemon\/(\d+)\//)
    const id = m ? parseInt(m[1], 10) : 0
    if (!id) return
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const data = await res.json()
      const statsObj = {
        hp: data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 70,
        attack: data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 70,
        defense: data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 70,
        specialAttack: data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 70,
        specialDefense: data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 70,
        speed: data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 70,
      }
      const bst = Object.values(statsObj).reduce((a, b) => a + b, 0)
      const success = addMember({
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        sprite: data.sprites.other?.showdown?.front_default || data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
        bst,
        stats: statsObj,
      })
      if (success) {
        setSearchPickerOpen(false)
      }
    } catch {
      sound.playError()
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                Battle Team Builder
              </h2>
              <p className="text-xs text-white/40 tracking-wider font-mono">
                OPERATIVES DRAFTED: {team.length} / {MAX_TEAM_SIZE}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {team.length > 0 && (
            <button
              onClick={clearTeam}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Team
            </button>
          )}
          <button
            onClick={handleCopyJSON}
            disabled={team.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5 disabled:opacity-30"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Export JSON'}
          </button>
          <button
            onClick={() => { setImportModalOpen(true); sound.playOpen() }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-300 border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 transition-all flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Import JSON
          </button>
        </div>
      </div>

      {/* 6 Tactical Operative Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: MAX_TEAM_SIZE }).map((_, index) => {
          const member = team[index]
          if (member) {
            const primary = member.types[0] || 'normal'
            const tc = TYPE_COLORS[primary] || TYPE_COLORS.default
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`relative rounded-3xl border ${tc.border} bg-gradient-to-br ${tc.cardGradient} p-4 flex flex-col items-center justify-between min-h-[260px] group shadow-lg`}
                style={{ boxShadow: `0 10px 30px rgba(${tc.rgb}, 0.15)` }}
              >
                {/* Remove button */}
                <button
                  onClick={() => removeMember(member.id)}
                  title="Remove from team"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Inspect button */}
                <button
                  onClick={() => onInspect(member.id)}
                  className="absolute top-3 left-3 text-[10px] font-mono text-white/40 hover:text-white transition-colors"
                >
                  #{member.id.toString().padStart(3, '0')}
                </button>

                {/* Sprite */}
                <div
                  onClick={() => onInspect(member.id)}
                  className="relative h-28 w-28 my-auto cursor-pointer transition-transform duration-300 group-hover:scale-110 flex items-center justify-center"
                >
                  <img
                    src={member.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.id}.png`}
                    alt={member.name}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                  />
                </div>

                {/* Info strip */}
                <div className="w-full text-center">
                  <div className="text-xs font-black uppercase tracking-wider text-white capitalize truncate">
                    {member.name.replace('-', ' ')}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {member.types.map(t => {
                      const c = TYPE_COLORS[t] || TYPE_COLORS.default
                      return (
                        <span key={t} className={`text-[8px] font-black uppercase rounded-full px-1.5 py-0.5 ${c.badge} ${c.badgeText}`}>
                          {t}
                        </span>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-white/50 bg-white/5 rounded-lg py-0.5 border border-white/5">
                    BST: {member.bst}
                  </div>
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={`empty-${index}`}
              onClick={() => { setSearchPickerOpen(true); sound.playClick() }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl border-2 border-dashed border-white/10 hover:border-red-500/50 bg-white/[0.01] hover:bg-red-500/5 transition-all p-6 flex flex-col items-center justify-center min-h-[260px] cursor-pointer group text-center"
            >
              <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-red-500/20 text-white/30 group-hover:text-red-400 transition-colors mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                Draft Slot #{index + 1}
              </span>
              <span className="text-[9px] text-white/20 uppercase tracking-widest mt-1">
                Click to add Pokémon
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Analytics & Heatmap Section */}
      {team.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart Summary */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Team Synergy Stats</h3>
                <span className="text-[10px] text-white/40 uppercase">Average across squad</span>
              </div>
              <span className={`text-[10px] font-black rounded-full px-2.5 py-1 uppercase ${teamTier.badge}`}>
                {teamTier.tier}
              </span>
            </div>

            <RadarChart
              size={240}
              contestants={[
                {
                  name: 'Team Average',
                  color: '#8b5cf6',
                  glowColor: 'rgba(139,92,246,0.6)',
                  stats: teamAverages,
                },
              ]}
            />

            <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/5 font-mono">
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-[9px] text-white/40 uppercase">Avg BST</div>
                <div className="text-sm font-bold text-white">{teamAverages.bst}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-[9px] text-white/40 uppercase">Avg SPE</div>
                <div className="text-sm font-bold text-cyan-400">{teamAverages.speed}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-[9px] text-white/40 uppercase">Avg ATK</div>
                <div className="text-sm font-bold text-red-400">{teamAverages.attack}</div>
              </div>
            </div>
          </div>

          {/* Defensive Weakness & Resistance Heatmap */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Defensive Vulnerability Heatmap
                </h3>
              </div>
              <span className="text-[10px] text-white/40 uppercase">18 Elemental Types</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ALL_TYPES.map(type => {
                const stat = typeAnalysis[type]
                const tc = TYPE_COLORS[type] || TYPE_COLORS.default
                const isWeak = stat.weaknesses >= 2
                const isResistant = stat.resistances > stat.weaknesses

                return (
                  <div
                    key={type}
                    className={`rounded-2xl border p-2.5 flex flex-col justify-between transition-all ${
                      isWeak
                        ? 'border-red-500/40 bg-red-500/10'
                        : isResistant
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider capitalize text-white">
                        {type}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tc.neon, boxShadow: `0 0 6px ${tc.neon}` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-red-400" title="Vulnerable Members">
                        ⚠ {stat.weaknesses}
                      </span>
                      <span className="text-emerald-400" title="Resistant Members">
                        🛡 {stat.resistances + stat.immunities}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Offensive Coverage Bar */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Offensive STAB Coverage
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-300">
                  {offensiveCoverage.size} / 18 Types Covered
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ALL_TYPES.map(t => {
                  const covered = offensiveCoverage.has(t)
                  const tc = TYPE_COLORS[t] || TYPE_COLORS.default
                  return (
                    <span
                      key={t}
                      className={`text-[9px] font-black uppercase rounded-lg px-2 py-0.5 transition-all ${
                        covered
                          ? `${tc.badge} ${tc.badgeText} border`
                          : 'bg-white/5 text-white/20 border border-white/5 line-through'
                      }`}
                    >
                      {t}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-white/5 bg-white/[0.01]">
          <Sparkles className="h-8 w-8 text-violet-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
            Draft up to 6 Pokémon to activate live squad synergy analytics
          </p>
        </div>
      )}

      {/* Quick Search Picker Modal */}
      <AnimatePresence>
        {searchPickerOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchPickerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0d101a] p-6 z-10 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Draft Pokémon Operative
                </h3>
                <button
                  onClick={() => setSearchPickerOpen(false)}
                  className="p-1 rounded-full text-white/40 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="my-4">
                <input
                  type="text"
                  placeholder="Search Pokémon name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredPicker.map(p => {
                  const m = p.url.match(/\/pokemon\/(\d+)\//)
                  const id = m ? parseInt(m[1], 10) : 0
                  return (
                    <div
                      key={p.name}
                      onClick={() => draftFromPicker(p)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-red-600/10 hover:border-red-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                          alt={p.name}
                          className="h-10 w-10 object-contain"
                        />
                        <div>
                          <div className="text-sm font-bold text-white capitalize">{p.name.replace('-', ' ')}</div>
                          <div className="text-[10px] font-mono text-white/30">#{id.toString().padStart(3, '0')}</div>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-red-400 flex items-center gap-1">
                        Draft <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import JSON Modal */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d101a] p-6 z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Import Team Config</h3>
                <button onClick={() => setImportModalOpen(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="my-4">
                <textarea
                  rows={8}
                  placeholder="Paste your exported team JSON here..."
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-mono text-white placeholder:text-white/30 outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                >
                  Load Operatives
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
