'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutGrid, Users, Swords, Gamepad2, Heart, Volume2, VolumeX } from 'lucide-react'
import { useSoundFX } from './SoundProvider'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/team', label: 'Team Builder', icon: Users },
  { href: '/compare', label: 'Battle Compare', icon: Swords },
  { href: '/minigame', label: "Who's That?", icon: Gamepad2 },
  { href: '/favorites', label: 'Favorites', icon: Heart },
]

export function Sidebar() {
  const pathname = usePathname()
  const { enabled, toggleSound, play } = useSoundFX()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40 flex-col border-r border-white/10 bg-[#08090d]/80 backdrop-blur-2xl">
        <div className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <span className="text-white font-black text-lg">P</span>
              <div className="absolute inset-0 rounded-xl border border-white/20" />
            </div>
            <div>
              <div className="text-sm font-black tracking-widest uppercase text-white">Pokédex</div>
              <div className="text-[10px] tracking-widest text-white/40 uppercase">OS v3.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => play('click')}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white bg-white/[0.06] border border-white/10'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                )}
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { toggleSound(); play('click') }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.03] transition-all"
          >
            {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            {enabled ? 'Sound: ON' : 'Sound: OFF'}
          </button>
          <div className="mt-4 flex items-center gap-2 px-4 text-[10px] text-white/20 uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-white/20'} animate-pulse`} />
            {enabled ? 'Audio Active' : 'Audio Muted'}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#08090d]/90 backdrop-blur-2xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => play('click')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'text-blue-400' : 'text-white/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-semibold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
