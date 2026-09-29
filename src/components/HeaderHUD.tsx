'use client'

import { useState } from 'react'
import { Zap, Volume2, VolumeX, Monitor, Search, Swords, Compass, Trophy, Heart } from 'lucide-react'
import { sound } from '@/utils/soundFx'
import { useTeam } from '@/hooks/useTeam'
import { useFavorites } from '@/hooks/useFavorites'

export type NavTab = 'explorer' | 'team' | 'battle' | 'minigame' | 'favorites'

interface HeaderHUDProps {
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  onOpenCommandPalette: () => void
  scanlinesEnabled: boolean
  setScanlinesEnabled: (v: boolean) => void
}

export function HeaderHUD({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  scanlinesEnabled,
  setScanlinesEnabled,
}: HeaderHUDProps) {
  const [soundOn, setSoundOn] = useState(sound.isEnabled())
  const { team } = useTeam()
  const { favorites } = useFavorites()

  const handleToggleSound = () => {
    const next = sound.toggle()
    setSoundOn(next)
  }

  const handleToggleScanlines = () => {
    setScanlinesEnabled(!scanlinesEnabled)
    sound.playClick()
  }

  const navItems: { id: NavTab; label: string; icon: any; badge?: number }[] = [
    { id: 'explorer', label: 'Explorer', icon: Compass },
    { id: 'team', label: 'Team Builder', icon: Swords, badge: team.length },
    { id: 'battle', label: 'Battle Arena', icon: Zap },
    { id: 'minigame', label: 'Guess Who', icon: Trophy },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favorites.length },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090C]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Terminal status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500/30">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest uppercase text-white">
                Pokédex
              </span>
              <span className="text-[9px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded">
                PRO EDITION
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/50">
                SYSTEM ONLINE • POKEAPI LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick()
                  setActiveTab(item.id)
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.45)] border border-red-400/40'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-white/60'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={() => {
              sound.playClick()
              onOpenCommandPalette()
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:border-red-500/30 hover:bg-white/5 text-white/50 hover:text-white transition-all text-xs font-mono"
            title="Global Search (Cmd + K)"
          >
            <Search className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={handleToggleScanlines}
            title={scanlinesEnabled ? 'CRT Scanlines: ON' : 'CRT Scanlines: OFF'}
            className={`p-2.5 rounded-xl border transition-all ${
              scanlinesEnabled
                ? 'border-red-500/50 bg-red-600/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                : 'border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound FX: ON' : 'Sound FX: MUTED'}
            className={`p-2.5 rounded-xl border transition-all ${
              soundOn
                ? 'border-red-500/40 bg-red-600/15 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'border-white/10 bg-white/[0.03] text-white/30 hover:text-white hover:border-white/20'
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs Strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-white/5 bg-[#06070a]">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick()
                setActiveTab(item.id)
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-white/20 px-1 py-0.2 text-[8px] font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </header>
  )
}
