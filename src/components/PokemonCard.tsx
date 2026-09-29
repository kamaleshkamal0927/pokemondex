'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { FavoriteButton } from './FavoriteButton'
import { TypeBadge } from './TypeBadge'
import { PokemonCardSkeleton } from './Skeletons'
import { TYPE_COLORS } from '@/constants/typeColors'
import { getPokemonSpecies, PokemonSpecies } from '@/lib/pokeapi'

interface PokemonCardProps {
  name: string
  url: string
  onClick: () => void
}

export function PokemonCard({ name, url, onClick }: PokemonCardProps) {
  const [types, setTypes] = useState<string[]>([])
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [realName, setRealName] = useState(name)

  const idMatch = url.match(/\/pokemon\/(\d+)\//)
  const id = idMatch ? parseInt(idMatch[1], 10) : 0
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [res, speciesData] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
          getPokemonSpecies(id).catch(() => null)
        ])
        if (res.ok) {
          const data = await res.json()
          setTypes(data.types.map((t: any) => t.type.name))
          setRealName(data.name)
        }
        if (speciesData) setSpecies(speciesData)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  if (isLoading) return <PokemonCardSkeleton />

  const primaryType = types[0] || 'default'
  const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.default
  
  const flavorTextEntry = species?.flavor_text_entries.find((f) => f.language.name === 'en')
  const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.'

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layoutId={`card-container-${id}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative h-[340px] w-full cursor-pointer perspective-1000"
    >
      <AnimatePresence initial={false} mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClick}
            className={`absolute inset-0 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 shadow-[0_8_30px_rgb(0,0,0,0.5)] border-t-white/20 flex flex-col group ${typeColor.hoverShadow} transition-shadow duration-500`}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Magnetic Spotlight */}
            <motion.div 
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "transparent" }}
            />

            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/20 p-4">
              <motion.div layoutId={`card-image-${id}`} className="relative h-full w-full">
                <Image
                  src={imageUrl}
                  alt={realName}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </motion.div>
            </div>
            
            <div className="mt-4 flex flex-1 flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <motion.h2 layoutId={`card-title-${id}`} className="text-xl font-bold capitalize text-white drop-shadow-md">
                  {realName.replace('-', ' ')}
                </motion.h2>
                <span className="text-sm font-medium text-white/50 tracking-wider">
                  #{id.toString().padStart(3, '0')}
                </span>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  {types.map((t) => (
                    <TypeBadge key={t} type={t} className="shadow-lg border-white/10" />
                  ))}
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                  className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Lore ↺
                </button>
              </div>
            </div>

            <div className="absolute right-3 top-3 z-20">
              <FavoriteButton pokemonId={id} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 shadow-[0_8_30px_rgb(0,0,0,0.5)] border-t-white/20 flex flex-col`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white capitalize">{realName.replace('-', ' ')}</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
              >
                Back ↺
              </button>
            </div>
            <p className="text-sm leading-relaxed text-white/80 italic flex-1 overflow-y-auto custom-scrollbar">
              "{flavorText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
