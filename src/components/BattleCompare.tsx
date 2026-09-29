'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Swords, Zap, ShieldAlert, Sparkles, ChevronRight, X, Plus } from 'lucide-react'
import { RadarChart, getTier } from './RadarChart'
import { TYPE_COLORS } from '@/constants/typeColors'
import { getTypeEffectiveness, PokemonType } from '@/utils/typeEffectiveness'
import { getPokemonDetails, PokemonDetails } from '@/lib/pokeapi'
import { sound } from '@/utils/soundFx'

interface BattleCompareProps {
  allPokemon: { name: string; url: string }[]
  onInspect: (id: number) => void
}

const CONTESTANT_COLORS = [
  { color: '#ef4444', glow: 'rgba(239,68,68,0.6)', border: 'border-red-500/50', bg: 'bg-red-600/10' },
  { color: '#ffffff', glow: 'rgba(255,255,255,0.6)', border: 'border-white/30', bg: 'bg-white/10' },
  { color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', border: 'border-amber-500/50', bg: 'bg-amber-500/10' },
]

export function BattleCompare({ allPokemon, onInspect }: BattleCompareProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([6, 3]) // Default: Charizard (#6) vs Venusaur (#3)
  const [contestants, setContestants] = useState<PokemonDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadContestants() {
      setLoading(true)
      try {
        const results = await Promise.all(
          selectedIds.map(id => getPokemonDetails(id))
        )
        setContestants(results)
      } catch {}
      setLoading(false)
    }
    loadContestants()
  }, [selectedIds.join(',')])

  const radarData = useMemo(() => {
    return contestants.map((c, idx) => {
      const statsObj = {
        hp: c.stats.find(s => s.stat.name === 'hp')?.base_stat || 70,
        attack: c.stats.find(s => s.stat.name === 'attack')?.base_stat || 70,
        defense: c.stats.find(s => s.stat.name === 'defense')?.base_stat || 70,
        specialAttack: c.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 70,
        specialDefense: c.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 70,
        speed: c.stats.find(s => s.stat.name === 'speed')?.base_stat || 70,
      }
      return {
        name: c.name,
        color: CONTESTANT_COLORS[idx]?.color || '#8b5cf6',
        glowColor: CONTESTANT_COLORS[idx]?.glow || 'rgba(139,92,246,0.6)',
        stats: statsObj,
      }
    })
  }, [contestants])

  // Battle Simulation Prediction Algorithm (Fighter 1 vs Fighter 2)
  const battlePrediction = useMemo(() => {
    if (contestants.length < 2) return null
    const [p1, p2] = contestants

    const p1Stats = {
      atk: Math.max(
        p1.stats.find(s => s.stat.name === 'attack')?.base_stat || 70,
        p1.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 70
      ),
      def: Math.max(
        p1.stats.find(s => s.stat.name === 'defense')?.base_stat || 70,
        p1.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 70
      ),
      spe: p1.stats.find(s => s.stat.name === 'speed')?.base_stat || 70,
      bst: p1.stats.reduce((a, b) => a + b.base_stat, 0),
    }

    const p2Stats = {
      atk: Math.max(
        p2.stats.find(s => s.stat.name === 'attack')?.base_stat || 70,
        p2.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 70
      ),
      def: Math.max(
        p2.stats.find(s => s.stat.name === 'defense')?.base_stat || 70,
        p2.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 70
      ),
      spe: p2.stats.find(s => s.stat.name === 'speed')?.base_stat || 70,
      bst: p2.stats.reduce((a, b) => a + b.base_stat, 0),
    }

    // Type effectiveness of P1 against P2
    const p2Types = p2.types.map(t => t.type.name as PokemonType)
    const p1Types = p1.types.map(t => t.type.name as PokemonType)

    let p1MaxMultiplier = 1
    p1Types.forEach(t => {
      const eff = getTypeEffectiveness(p2Types)
      const hit = eff.weaknesses.find(w => w.type === t)
      if (hit && hit.multiplier > p1MaxMultiplier) p1MaxMultiplier = hit.multiplier
    })

    let p2MaxMultiplier = 1
    p2Types.forEach(t => {
      const eff = getTypeEffectiveness(p1Types)
      const hit = eff.weaknesses.find(w => w.type === t)
      if (hit && hit.multiplier > p2MaxMultiplier) p2MaxMultiplier = hit.multiplier
    })

    // Weighted battle power score
    const p1Score = (p1Stats.bst * 0.4) + (p1Stats.spe * 0.3) + (p1Stats.atk * p1MaxMultiplier * 0.8)
    const p2Score = (p2Stats.bst * 0.4) + (p2Stats.spe * 0.3) + (p2Stats.atk * p2MaxMultiplier * 0.8)

    const total = p1Score + p2Score
    const p1WinProb = Math.min(Math.max(Math.round((p1Score / total) * 100), 10), 90)
    const p2WinProb = 100 - p1WinProb

    const p1SpeedAdv = p1Stats.spe - p2Stats.spe

    let tacticalSummary = ''
    if (p1WinProb > 55) {
      tacticalSummary = `${p1.name.toUpperCase()} holds tactical supremacy (${p1WinProb}% win prob). ${
        p1MaxMultiplier > 1 ? `Deals ${p1MaxMultiplier}x super-effective elemental damage. ` : ''
      }${p1SpeedAdv > 0 ? `Speed advantage: +${p1SpeedAdv}.` : ''}`
    } else if (p2WinProb > 55) {
      tacticalSummary = `${p2.name.toUpperCase()} holds tactical supremacy (${p2WinProb}% win prob). ${
        p2MaxMultiplier > 1 ? `Deals ${p2MaxMultiplier}x super-effective elemental damage. ` : ''
      }${p1SpeedAdv < 0 ? `Speed advantage: +${Math.abs(p1SpeedAdv)}.` : ''}`
    } else {
      tacticalSummary = 'Evenly matched combatants. Battle outcome will depend heavily on move prediction and item timing.'
    }

    return {
      p1WinProb,
      p2WinProb,
      p1MaxMultiplier,
      p2MaxMultiplier,
      p1SpeedAdv,
      tacticalSummary,
    }
  }, [contestants])

  const filteredPicker = useMemo(() => {
    if (!searchQuery.trim()) return allPokemon.slice(0, 30)
    return allPokemon.filter(p => p.name.includes(searchQuery.toLowerCase().trim())).slice(0, 30)
  }, [allPokemon, searchQuery])

  const selectPokemonForSlot = (p: { name: string; url: string }) => {
    if (pickerSlotIndex === null) return
    const m = p.url.match(/\/pokemon\/(\d+)\//)
    const id = m ? parseInt(m[1], 10) : 0
    if (!id) return

    const updated = [...selectedIds]
    if (pickerSlotIndex < updated.length) {
      updated[pickerSlotIndex] = id
    } else {
      updated.push(id)
    }
    setSelectedIds(updated)
    setPickerSlotIndex(null)
    setSearchQuery('')
    sound.playSelect()
  }

  const removeSlot = (index: number) => {
    if (selectedIds.length <= 2) return
    const updated = selectedIds.filter((_, i) => i !== index)
    setSelectedIds(updated)
    sound.playClick()
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Tactical Battle Compare Arena
            </h2>
            <p className="text-xs text-white/40 tracking-wider font-mono">
              COMPARE 2 OR 3 POKÉMON SIDE-BY-SIDE WITH AI PREDICTION ENGINE
            </p>
          </div>
        </div>

        {selectedIds.length < 3 && (
          <button
            onClick={() => { setPickerSlotIndex(selectedIds.length); sound.playClick() }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-300 border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add 3rd Challenger
          </button>
        )}
      </div>

      {/* Contestant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contestants.map((c, idx) => {
          const bst = c.stats.reduce((a, b) => a + b.base_stat, 0)
          const tier = getTier(bst)
          const style = CONTESTANT_COLORS[idx]
          const primaryType = c.types[0]?.type.name || 'normal'
          const tc = TYPE_COLORS[primaryType] || TYPE_COLORS.default

          return (
            <motion.div
              key={c.id}
              layout
              className={`relative rounded-3xl border ${style.border} ${style.bg} p-6 flex flex-col justify-between shadow-xl`}
              style={{ boxShadow: `0 10px 40px ${style.glow}` }}
            >
              {/* Slot Switcher / Remove */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color: style.color }}>
                  FIGHTER #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setPickerSlotIndex(idx); sound.playClick() }}
                    className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                  >
                    Swap
                  </button>
                  {selectedIds.length > 2 && (
                    <button
                      onClick={() => removeSlot(idx)}
                      className="p-1 rounded-full text-white/30 hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sprite & Identity */}
              <div className="my-6 flex flex-col items-center text-center">
                <div
                  onClick={() => onInspect(c.id)}
                  className="relative h-32 w-32 cursor-pointer transition-transform duration-300 hover:scale-110 mb-3 flex items-center justify-center"
                >
                  <img
                    src={c.sprites.other?.showdown?.front_default || c.sprites.other?.['official-artwork']?.front_default || c.sprites.front_default}
                    alt={c.name}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
                  />
                </div>

                <h3 className="text-xl font-black uppercase tracking-wide text-white capitalize">
                  {c.name.replace('-', ' ')}
                </h3>
                <span className="text-xs font-mono text-white/40">#{c.id.toString().padStart(3, '0')}</span>

                <div className="mt-2 flex gap-1.5">
                  {c.types.map(t => {
                    const typeColor = TYPE_COLORS[t.type.name] || TYPE_COLORS.default
                    return (
                      <span
                        key={t.type.name}
                        className={`text-[9px] font-black uppercase rounded-full px-2.5 py-0.5 ${typeColor.badge} ${typeColor.badgeText}`}
                      >
                        {t.type.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Stats Table */}
              <div className="space-y-2 pt-4 border-t border-white/5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">TOTAL BST</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{bst}</span>
                    <span className={`text-[9px] font-black rounded px-1.5 py-0.2 ${tier.badge}`}>{tier.tier}</span>
                  </div>
                </div>
                {c.stats.map(s => (
                  <div key={s.stat.name} className="flex justify-between items-center text-[11px]">
                    <span className="text-white/40 uppercase">{s.stat.name.replace('-', ' ')}</span>
                    <span className="font-bold text-white">{s.base_stat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Overlaid Radar Chart & Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Overlaid Stat Radar</h3>
              <p className="text-[10px] text-white/40 uppercase">Hexagonal comparative geometry</p>
            </div>
            <div className="flex items-center gap-2">
              {contestants.map((c, i) => (
                <span
                  key={c.name}
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${CONTESTANT_COLORS[i]?.color}25`,
                    color: CONTESTANT_COLORS[i]?.color,
                    border: `1px solid ${CONTESTANT_COLORS[i]?.color}50`,
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <RadarChart size={280} contestants={radarData} />

          <p className="text-[10px] text-white/30 text-center mt-4">
            Outer web layer = 200 Max Stat Threshold
          </p>
        </div>

        {/* AI Battle Prediction Engine */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Simulation & Type Advantage Predictor
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
                AI ENGINE ACTIVE
              </span>
            </div>

            {battlePrediction && contestants.length >= 2 && (
              <div className="space-y-6">
                {/* Win Probability Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
                    <span style={{ color: CONTESTANT_COLORS[0].color }}>
                      {contestants[0].name}: {battlePrediction.p1WinProb}%
                    </span>
                    <span style={{ color: CONTESTANT_COLORS[1].color }}>
                      {contestants[1].name}: {battlePrediction.p2WinProb}%
                    </span>
                  </div>

                  <div className="h-4 rounded-full bg-white/5 overflow-hidden flex p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: '50%' }}
                      animate={{ width: `${battlePrediction.p1WinProb}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-l-full"
                      style={{
                        backgroundColor: CONTESTANT_COLORS[0].color,
                        boxShadow: `0 0 12px ${CONTESTANT_COLORS[0].glow}`,
                      }}
                    />
                    <motion.div
                      initial={{ width: '50%' }}
                      animate={{ width: `${battlePrediction.p2WinProb}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-r-full"
                      style={{
                        backgroundColor: CONTESTANT_COLORS[1].color,
                        boxShadow: `0 0 12px ${CONTESTANT_COLORS[1].glow}`,
                      }}
                    />
                  </div>
                </div>

                {/* Tactical Analysis Narrative */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-1">
                    Tactical Assessment
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/80">
                    {battlePrediction.tacticalSummary}
                  </p>
                </div>

                {/* Stat Deltas */}
                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Speed Delta</div>
                    <div className={`text-base font-black ${battlePrediction.p1SpeedAdv >= 0 ? 'text-pink-400' : 'text-cyan-400'}`}>
                      {battlePrediction.p1SpeedAdv > 0 ? `+${battlePrediction.p1SpeedAdv} (P1)` : `${battlePrediction.p1SpeedAdv} (P2)`}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">P1 Max Multiplier</div>
                    <div className="text-base font-black text-amber-400">
                      {battlePrediction.p1MaxMultiplier}x
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">P2 Max Multiplier</div>
                    <div className="text-base font-black text-amber-400">
                      {battlePrediction.p2MaxMultiplier}x
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span>POKÉDEX OS v3.0 BATTLE KERNEL</span>
            <span>SIMULATION COMPLETE</span>
          </div>
        </div>
      </div>

      {/* Challenger Selector Modal */}
      {pickerSlotIndex !== null && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            onClick={() => setPickerSlotIndex(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0d101a] p-6 z-10 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Select Challenger for Fighter #{pickerSlotIndex + 1}
              </h3>
              <button
                onClick={() => setPickerSlotIndex(null)}
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPicker.map(p => {
                const m = p.url.match(/\/pokemon\/(\d+)\//)
                const id = m ? parseInt(m[1], 10) : 0
                return (
                  <div
                    key={p.name}
                    onClick={() => selectPokemonForSlot(p)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/30 cursor-pointer transition-all"
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
                    <button className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                      Choose <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
