'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Volume2, Plus, Check, Sparkles, Swords, BookOpen, Shield } from 'lucide-react'
import { getPokemonDetails, getPokemonSpecies, getEvolutionChain, PokemonDetails, PokemonSpecies, EvolutionChain as EvoChainType } from '@/lib/pokeapi'
import { TYPE_COLORS } from '@/constants/typeColors'
import { useFavorites } from '@/hooks/useFavorites'
import { useTeam } from '@/hooks/useTeam'
import { getTypeEffectiveness, PokemonType } from '@/utils/typeEffectiveness'
import { AudioVisualizer } from './AudioVisualizer'
import { EvoFlowNode } from './EvoFlowNode'
import { RadarChart, getTier } from './RadarChart'
import { sound, speakPokemonLore, stopPokemonLore } from '@/utils/soundFx'

function AnimatedStat({ name, value }: { name: string; value: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let s = 0
    const timer = setInterval(() => {
      s = Math.min(s + Math.ceil(value / 25), value)
      setCount(s)
      if (s >= value) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [value])

  let glow = '#ef4444'
  if (value >= 50 && value < 90) glow = '#f59e0b'
  else if (value >= 90 && value < 120) glow = '#10b981'
  else if (value >= 120) glow = '#38bdf8'

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[10px] font-bold uppercase tracking-wider text-white/50 shrink-0 font-mono">
        {name.replace('-', ' ')}
      </span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: glow, boxShadow: `0 0 10px ${glow}` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-mono font-black text-white">{count}</span>
    </div>
  )
}

export function HoloDetailPanel({
  id,
  onClose,
  onPrev,
  onNext,
}: {
  id: number
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  onSelectPokemon?: (newId: number) => void
}) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [evoChain, setEvoChain] = useState<EvoChainType | null>(null)
  const [spriteMode, setSpriteMode] = useState<'animated' | 'artwork' | 'shiny' | 'pixel'>('animated')
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matchups' | 'moves' | 'evolution'>('overview')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [teamAdded, setTeamAdded] = useState(false)

  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()
  const { addMember, isInTeam } = useTeam()

  useEffect(() => {
    setPokemon(null)
    setSpecies(null)
    setEvoChain(null)
    setSpriteMode('animated')
    setIsSpeaking(false)
    stopPokemonLore()

    async function load() {
      try {
        const p = await getPokemonDetails(id)
        setPokemon(p)
        const s = await getPokemonSpecies(id)
        setSpecies(s)
        if (s.evolution_chain?.url) {
          const e = await getEvolutionChain(s.evolution_chain.url)
          setEvoChain(e)
        }
      } catch {}
    }
    load()
  }, [id])

  // Keyboard navigation: Left/Right arrows for slides, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onPrev) {
        sound.playClick()
        onPrev()
      } else if (e.key === 'ArrowRight' && onNext) {
        sound.playClick()
        onNext()
      } else if (e.key === 'Escape') {
        sound.playClick()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrev, onNext, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      stopPokemonLore()
    }
  }, [])

  const primaryType = pokemon?.types[0]?.type.name || 'normal'
  const color = TYPE_COLORS[primaryType] || TYPE_COLORS.default
  const flavorText =
    species?.flavor_text_entries.find(f => f.language.name === 'en')?.flavor_text.replace(/[\f\n\r]/g, ' ') ||
    'Archival field entry pending synchronization from regional database.'
  const genus = species?.genera?.find(g => g.language.name === 'en')?.genus || 'Pokémon'
  const bst = pokemon?.stats.reduce((a, s) => a + s.base_stat, 0) ?? 0
  const tier = getTier(bst)

  const currentSprite = useMemo(() => {
    if (!pokemon) return ''
    if (spriteMode === 'animated') {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
    }
    if (spriteMode === 'shiny') {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
    }
    if (spriteMode === 'pixel') {
      return pokemon.sprites.front_default
    }
    return pokemon.sprites.other['official-artwork'].front_default
  }, [pokemon, spriteMode, id])

  const { weaknesses, resistances, immunities } = useMemo(() => {
    return pokemon
      ? getTypeEffectiveness(pokemon.types.map(t => t.type.name as PokemonType))
      : { weaknesses: [], resistances: [], immunities: [] }
  }, [pokemon])

  const radarData = useMemo(() => {
    if (!pokemon) return []
    return [
      {
        name: pokemon.name,
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.7)',
        stats: {
          hp: pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 70,
          attack: pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 70,
          defense: pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 70,
          specialAttack: pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 70,
          specialDefense: pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 70,
          speed: pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 70,
        },
      },
    ]
  }, [pokemon])

  const handleSpeak = () => {
    if (isSpeaking) {
      stopPokemonLore()
      setIsSpeaking(false)
    } else {
      speakPokemonLore(`${pokemon?.name}. ${genus}. ${flavorText}`)
      setIsSpeaking(true)
    }
  }

  const handleDraftSquad = () => {
    if (!pokemon) return
    const statsObj = {
      hp: pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 70,
      attack: pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 70,
      defense: pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 70,
      specialAttack: pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 70,
      specialDefense: pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 70,
      speed: pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 70,
    }
    const success = addMember({
      id,
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name),
      sprite: pokemon.sprites.other?.showdown?.front_default || pokemon.sprites.other['official-artwork'].front_default,
      bst,
      stats: statsObj,
    })
    if (success) {
      setTeamAdded(true)
      setTimeout(() => setTeamAdded(false), 2000)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
      />

      {/* Main Inspection Modal */}
      <motion.div
        layoutId={`holo-card-${id}`}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] rounded-[2rem] overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.95)] z-10 bg-[#0B0C11]"
      >
        {/* Subtle ambient red & white glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {/* Draft to Squad */}
          <button
            onClick={handleDraftSquad}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isInTeam(id) || teamAdded
                ? 'border-red-500/50 bg-red-600/20 text-red-300'
                : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-red-500/30'
            }`}
          >
            {isInTeam(id) || teamAdded ? <Check className="h-3.5 w-3.5 text-red-400" /> : <Plus className="h-3.5 w-3.5" />}
            {isInTeam(id) ? 'In Squad' : teamAdded ? 'Added!' : 'Draft to Squad'}
          </button>

          {/* Favorite */}
          {isLoaded && (
            <button
              onClick={() => toggleFavorite(id)}
              className={`p-2 rounded-full border transition-all ${
                isFavorite(id)
                  ? 'border-red-500/50 bg-red-600/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >
              ♥
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="p-2 rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-red-500/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Left Column: Visual Showcase & Core Controls */}
        <div className="relative flex flex-col items-center justify-between p-6 sm:p-8 lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/10 shrink-0">
          {/* Slide Arrow Navigation */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
            {onPrev && (
              <button
                onClick={() => {
                  sound.playClick()
                  onPrev()
                }}
                title="Previous Pokémon (Left Arrow)"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-red-500/50 hover:bg-red-600/10 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {onNext && (
              <button
                onClick={() => {
                  sound.playClick()
                  onNext()
                }}
                title="Next Pokémon (Right Arrow)"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-red-500/50 hover:bg-red-600/10 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {!pokemon ? (
            <div className="h-56 w-56 rounded-full bg-white/5 animate-pulse my-auto" />
          ) : (
            <>
              {/* Asset Mode Switcher Toggles */}
              <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 mb-4 z-10">
                {(['animated', 'artwork', 'shiny', 'pixel'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      sound.playClick()
                      setSpriteMode(mode)
                    }}
                    className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all ${
                      spriteMode === mode
                        ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-red-400/40'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {mode === 'animated' ? '🎮 3D GIF' : mode === 'artwork' ? '🎨 Art' : mode === 'shiny' ? '✨ Shiny' : '👾 Pixel'}
                  </button>
                ))}
              </div>

              {/* Central Pokémon Display */}
              <div className="relative h-56 w-56 md:h-64 md:w-64 my-auto flex items-center justify-center">
                <motion.div
                  layoutId={`holo-image-${id}`}
                  className="relative h-full w-full flex items-center justify-center drop-shadow-2xl"
                >
                  <img
                    key={currentSprite}
                    src={currentSprite}
                    alt={pokemon.name}
                    onError={e => {
                      (e.target as HTMLImageElement).src = pokemon.sprites.other['official-artwork'].front_default
                    }}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-110 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                  />
                </motion.div>
              </div>

              {/* Title & Type Badges */}
              <div className="text-center w-full mt-4">
                <div className="text-xs font-mono text-white/40 tracking-widest">
                  #{id.toString().padStart(3, '0')} • {genus}
                </div>
                <motion.h2
                  layoutId={`holo-name-${id}`}
                  className="text-3xl font-black capitalize text-white mt-1 tracking-wide"
                >
                  {pokemon.name.replace('-', ' ')}
                </motion.h2>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {pokemon.types.map(t => {
                    const tc = TYPE_COLORS[t.type.name] || TYPE_COLORS.default
                    return (
                      <span
                        key={t.type.name}
                        className={`text-[10px] font-black uppercase tracking-wider rounded-md px-3 py-1 ${tc.badge} ${tc.badgeText}`}
                      >
                        {t.type.name}
                      </span>
                    )
                  })}
                </div>

                {/* Audio Cry Visualizer Button */}
                <div className="mt-4 flex items-center justify-center">
                  <AudioVisualizer id={id} color="bg-red-500" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Tabbed Data Deck */}
        <div className="flex flex-col lg:w-7/12 overflow-hidden">
          {/* Navigation Deck Tabs */}
          <div className="flex items-center gap-1 px-6 pt-6 border-b border-white/10 overflow-x-auto shrink-0">
            {(
              [
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'stats', label: 'Stats & Radar', icon: Sparkles },
                { id: 'matchups', label: 'Vulnerabilities', icon: Shield },
                { id: 'moves', label: 'Moveset', icon: Swords },
                { id: 'evolution', label: 'Evolution Line', icon: ChevronRight },
              ] as const
            ).map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick()
                    setActiveTab(tab.id)
                  }}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-red-500 text-white bg-white/5'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-red-400' : ''}`} /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 lg:p-8 overflow-y-auto space-y-6 flex-1">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Lore Flavor Text & Voiceover */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-mono">
                      POKÉDEX ARCHIVAL LOG
                    </span>
                    <button
                      onClick={handleSpeak}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                        isSpeaking
                          ? 'border-red-500 bg-red-600/20 text-red-300'
                          : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <Volume2 className="h-3 w-3" /> {isSpeaking ? 'Stop Voice' : 'Text-to-Speech'}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80 italic border-l-2 border-red-500/60 pl-3">
                    &quot;{flavorText}&quot;
                  </p>
                </div>

                {/* Physical Specifications */}
                {pokemon && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Height</div>
                      <div className="text-base font-black text-white font-mono">{pokemon.height / 10} m</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Weight</div>
                      <div className="text-base font-black text-white font-mono">{pokemon.weight / 10} kg</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Base BST</div>
                      <div className="text-base font-black text-red-400 font-mono">{bst}</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Tier Rating</div>
                      <span className={`text-[10px] font-black rounded px-2 py-0.5 ${tier.badge}`}>
                        {tier.tier}
                      </span>
                    </div>
                  </div>
                )}

                {/* Combat Abilities */}
                {pokemon && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                      Combat Abilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.abilities.map(a => (
                        <div
                          key={a.ability.name}
                          className={`rounded-xl px-3 py-2 border text-xs font-bold capitalize ${
                            a.is_hidden
                              ? 'bg-red-600/10 border-red-500/30 text-red-300'
                              : 'bg-white/5 border-white/10 text-white/80'
                          }`}
                        >
                          {a.ability.name.replace('-', ' ')}
                          {a.is_hidden && <span className="ml-1 text-[9px] text-red-400 font-mono">(Hidden)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATS & RADAR TAB */}
            {activeTab === 'stats' && pokemon && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                    <RadarChart size={230} contestants={radarData} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-white">Stat Breakdown</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tier.badge}`}>
                        {tier.tier}
                      </span>
                    </div>
                    {pokemon.stats.map(s => (
                      <AnimatedStat key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VULNERABILITIES & MATCHUPS TAB */}
            {activeTab === 'matchups' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-xs font-black uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
                    <span>⚠ Takes 2x / 4x Damage (Weaknesses)</span>
                  </div>
                  {weaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map(w => {
                        const tc = TYPE_COLORS[w.type] || TYPE_COLORS.default
                        return (
                          <span
                            key={w.type}
                            className={`text-xs font-black uppercase rounded-md px-3 py-1 ${tc.badge} ${tc.badgeText} border`}
                          >
                            {w.type} {w.multiplier > 2 ? '4×' : '2×'}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30">No elemental weaknesses detected.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                    <span>🛡 Takes 0.5x / 0.25x Damage (Resistances)</span>
                  </div>
                  {resistances.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resistances.map(r => {
                        const tc = TYPE_COLORS[r.type] || TYPE_COLORS.default
                        return (
                          <span
                            key={r.type}
                            className={`text-xs font-black uppercase rounded-md px-3 py-1 ${tc.badge} ${tc.badgeText} border`}
                          >
                            {r.type} {r.multiplier < 0.5 ? '¼×' : '½×'}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30">No active elemental resistances.</p>
                  )}
                </div>

                {immunities.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="text-xs font-black uppercase tracking-wider text-white/60 mb-3 flex items-center gap-1.5">
                      <span>✨ Takes 0x Damage (Complete Immunities)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {immunities.map(im => {
                        const tc = TYPE_COLORS[im.type] || TYPE_COLORS.default
                        return (
                          <span
                            key={im.type}
                            className={`text-xs font-black uppercase rounded-md px-3 py-1 ${tc.badge} ${tc.badgeText} border`}
                          >
                            {im.type} (0×)
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MOVESET TAB */}
            {activeTab === 'moves' && (
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-white/60 mb-2">
                  Arsenal & Learned Techniques ({pokemon?.moves?.length || 0} moves)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pokemon?.moves?.slice(0, 30).map(m => {
                    const levelDetail = m.version_group_details.find(
                      v => v.move_learn_method.name === 'level-up'
                    )
                    const isLevelUp = !!levelDetail

                    return (
                      <div
                        key={m.move.name}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]"
                      >
                        <div className="text-xs font-bold capitalize text-white truncate mr-2">
                          {m.move.name.replace('-', ' ')}
                        </div>
                        <span className="text-[10px] font-mono text-white/40 shrink-0">
                          {isLevelUp ? `Lv. ${levelDetail.level_learned_at}` : 'TM / Machine'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* EVOLUTION CHAIN TAB */}
            {activeTab === 'evolution' && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="text-xs font-black uppercase tracking-wider text-white/50 mb-4">
                  Evolution Flow & Metamorphosis
                </div>
                {evoChain ? (
                  <EvoFlowNode chain={evoChain.chain} />
                ) : (
                  <div className="text-center py-8 text-white/30 text-xs">
                    Loading evolutionary data...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
