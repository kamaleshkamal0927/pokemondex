'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Plus, Check } from 'lucide-react'
import { TYPE_COLORS } from '@/constants/typeColors'
import { useFavorites } from '@/hooks/useFavorites'
import { useTeam } from '@/hooks/useTeam'
import { sound } from '@/utils/soundFx'

interface HoloCardProps {
  name: string
  id: number
  types: string[]
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function HoloCard({ name, id, types, onClick, size = 'md' }: HoloCardProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()
  const { isInTeam, addMember } = useTeam()
  const cardRef = useRef<HTMLDivElement>(null)
  const [imgSrc, setImgSrc] = useState(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
  )
  const [isAdded, setIsAdded] = useState(false)

  const primaryType = types[0] || 'normal'
  const color = TYPE_COLORS[primaryType] || TYPE_COLORS.default

  // 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 25 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const heights = { sm: 'h-[210px]', md: 'h-[290px]', lg: 'h-[390px]' }
  const imgSizes = { sm: 'h-24 w-24', md: 'h-36 w-36', lg: 'h-52 w-52' }

  const handleQuickAddTeam = async (e: React.MouseEvent) => {
    e.stopPropagation()
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
        id,
        name,
        types,
        sprite:
          data.sprites.other?.showdown?.front_default ||
          data.sprites.other?.['official-artwork']?.front_default ||
          data.sprites.front_default,
        bst,
        stats: statsObj,
      })
      if (success) {
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1500)
      }
    } catch {}
  }

  return (
    <motion.div
      ref={cardRef}
      layoutId={`holo-card-${id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        sound.playOpen()
        onClick()
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`holo-card relative cursor-pointer rounded-2xl border border-white/10 hover:border-red-500/50 bg-[#0E1015]/90 hover:bg-[#12141C] shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(239,68,68,0.15)] transition-all duration-300 ${heights[size]} overflow-hidden group`}
    >
      {/* Subtle radial shine in card center */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition-opacity"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
        }}
      />

      {/* ID Badge in Top-Left */}
      <div className="absolute top-3.5 left-4 z-10">
        <span className="text-[10px] font-black tracking-widest text-white/40 font-mono">
          #{id.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Top Action Buttons (Favorite + Quick Draft) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          onClick={handleQuickAddTeam}
          title={isInTeam(id) ? 'Already in Squad' : 'Quick Draft to Squad'}
          className={`p-1.5 rounded-lg border transition-all ${
            isInTeam(id) || isAdded
              ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          {isInTeam(id) || isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>

        {isLoaded && (
          <button
            onClick={e => {
              e.stopPropagation()
              toggleFavorite(id)
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              isFavorite(id)
                ? 'border-red-500/50 bg-red-600/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            <Heart className={`h-3 w-3 ${isFavorite(id) ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Pokémon Animated GIF or Artwork Image */}
      <div className="absolute inset-0 flex items-center justify-center pt-2">
        <motion.div
          layoutId={`holo-image-${id}`}
          className={`relative ${imgSizes[size]} flex items-center justify-center`}
        >
          <img
            src={imgSrc}
            alt={name}
            onError={() => {
              setImgSrc(
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
              )
            }}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          />
        </motion.div>
      </div>

      {/* Bottom Info Strip */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <motion.h3
          layoutId={`holo-name-${id}`}
          className="text-sm font-black uppercase tracking-wider text-white capitalize group-hover:text-red-400 transition-colors"
          style={{ fontSize: size === 'lg' ? '1.15rem' : size === 'md' ? '0.9rem' : '0.75rem' }}
        >
          {name.replace('-', ' ')}
        </motion.h3>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {types.map(t => {
            const tc = TYPE_COLORS[t] || TYPE_COLORS.default
            return (
              <span
                key={t}
                className={`text-[8.5px] font-black uppercase tracking-wider rounded-md px-2 py-0.5 ${tc.badge} ${tc.badgeText}`}
              >
                {t}
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export function HoloCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-[210px]', md: 'h-[290px]', lg: 'h-[390px]' }
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse ${heights[size]}`} />
  )
}
