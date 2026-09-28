'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { getPokemonDetails, getPokemonSpecies, getEvolutionChain, PokemonDetails, PokemonSpecies, EvolutionChain as EvoChainType } from '@/lib/pokeapi'
import { TYPE_COLORS } from '@/constants/typeColors'
import { TypeBadge } from './TypeBadge'
import { FavoriteButton } from './FavoriteButton'
import { ImageToggle } from './ImageToggle'
import { AudioPlayer } from './AudioPlayer'
import { StatRadar } from './StatRadar'
import { EvoFlowNode } from './EvoFlowNode'
import { getTypeEffectiveness } from '@/utils/typeEffectiveness'

export function PokemonDetailModal({ id, onClose }: { id: number, onClose: () => void }) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [evoChain, setEvoChain] = useState<EvoChainType | null>(null)
  
  useEffect(() => {
    async function load() {
      const p = await getPokemonDetails(id)
      setPokemon(p)
      try {
        const s = await getPokemonSpecies(id)
        setSpecies(s)
        if (s.evolution_chain?.url) {
          const e = await getEvolutionChain(s.evolution_chain.url)
          setEvoChain(e)
        }
      } catch (e) { console.error(e) }
    }
    load()
  }, [id])

  // Disable body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  if (!pokemon) {
    return (
      <motion.div 
        layoutId={`card-container-${id}`}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090d]/80 backdrop-blur-sm"
      >
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </motion.div>
    )
  }

  const primaryType = pokemon.types[0]?.type.name || 'default'
  const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.default
  const flavorTextEntry = species?.flavor_text_entries.find((f) => f.language.name === 'en')
  const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : ''

  const officialArtwork = pokemon.sprites.other['official-artwork'].front_default
  const pixelSprite = pokemon.sprites.front_default
  const shinySprite = pokemon.sprites.front_shiny

  const { weaknesses, resistances, immunities } = getTypeEffectiveness(pokemon.types.map(t => t.type.name as any))
  const bst = pokemon.stats.reduce((acc, stat) => acc + stat.base_stat, 0)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#08090d]/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`card-container-${id}`}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] bg-[#0c0e14] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden border-t-white/20 flex flex-col lg:flex-row`}
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-black transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Dynamic Ambient Background inside modal */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${typeColor.gradient}`} />

        {/* Left Column: Media & Core */}
        <div className="relative flex flex-col items-center p-8 lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/10 z-10">
          <div className="absolute left-6 top-6">
            <FavoriteButton pokemonId={id} />
          </div>

          <motion.div layoutId={`card-image-${id}`} className="mt-12 mb-8">
            <ImageToggle 
              name={pokemon.name}
              officialArtwork={officialArtwork}
              pixelSprite={pixelSprite}
              shinySprite={shinySprite}
            />
          </motion.div>

          <motion.h1 layoutId={`card-title-${id}`} className="text-5xl font-black capitalize text-white drop-shadow-lg mb-2 text-center">
            {pokemon.name.replace('-', ' ')}
          </motion.h1>
          <div className="text-xl font-bold text-white/30 tracking-widest mb-6">
            #{id.toString().padStart(3, '0')}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} className="shadow-lg border-white/20" />
            ))}
          </div>

          <AudioVisualizer id={id} color={typeColor.bg} />
        </div>

        {/* Right Column: Details & Dashboard */}
        <div className="flex flex-col p-8 lg:w-7/12 z-10 space-y-8">
          
          {flavorText && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-lg leading-relaxed text-white/70 italic">"{flavorText}"</p>
            </div>
          )}

          {/* Physical & Abilities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Height</span>
              <span className="text-lg font-bold text-white">{pokemon.height / 10}m</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Weight</span>
              <span className="text-lg font-bold text-white">{pokemon.weight / 10}kg</span>
            </div>
            <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <span className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Abilities</span>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((a: any) => (
                  <span key={a.ability.name} className={`px-2 py-1 text-xs font-bold capitalize rounded-md ${a.is_hidden ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/10 text-white/80 border border-white/10'}`}>
                    {a.ability.name.replace('-', ' ')} {a.is_hidden && '✨'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Radar & Progress */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest">Performance</h3>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white">BST {bst}</span>
            </div>
            <StatRadar stats={pokemon.stats} />
          </div>

          {/* Type Effectiveness */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
             <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest mb-4">Matchups</h3>
             <div className="space-y-4">
               {weaknesses.length > 0 && (
                 <div>
                   <span className="text-xs text-red-400 uppercase tracking-widest block mb-2">Weak to (2x)</span>
                   <div className="flex flex-wrap gap-2">{weaknesses.map(w => <TypeBadge key={w.type} type={w.type} />)}</div>
                 </div>
               )}
               {resistances.length > 0 && (
                 <div>
                   <span className="text-xs text-emerald-400 uppercase tracking-widest block mb-2">Resists (0.5x)</span>
                   <div className="flex flex-wrap gap-2">{resistances.map(r => <TypeBadge key={r.type} type={r.type} />)}</div>
                 </div>
               )}
               {immunities.length > 0 && (
                 <div>
                   <span className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Immune (0x)</span>
                   <div className="flex flex-wrap gap-2">{immunities.map(i => <TypeBadge key={i.type} type={i.type} />)}</div>
                 </div>
               )}
             </div>
          </div>

          {/* Evolution Flow */}
          {evoChain && (
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 overflow-hidden">
               <h3 className="text-lg font-bold text-white/90 uppercase tracking-widest mb-6">Evolution Line</h3>
               <EvoFlowNode chain={evoChain.chain} />
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  )
}
