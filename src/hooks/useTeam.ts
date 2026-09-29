'use client'

import { useState, useEffect, useCallback } from 'react'
import { sound } from '@/utils/soundFx'

export interface TeamMember {
  id: number
  name: string
  types: string[]
  sprite: string
  bst: number
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
}

const STORAGE_KEY = 'pokedex_team_v3'
export const MAX_TEAM_SIZE = 6

export function useTeam() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setTeam(JSON.parse(saved))
      }
    } catch {}
    setIsLoaded(true)
  }, [])

  const saveTeam = useCallback((newTeam: TeamMember[]) => {
    setTeam(newTeam)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTeam))
    } catch {}
  }, [])

  const addMember = useCallback((member: TeamMember): boolean => {
    if (team.length >= MAX_TEAM_SIZE) {
      sound.playError()
      return false
    }
    if (team.some(m => m.id === member.id)) {
      sound.playError()
      return false
    }
    const updated = [...team, member]
    saveTeam(updated)
    sound.playSelect()
    return true
  }, [team, saveTeam])

  const removeMember = useCallback((id: number) => {
    const updated = team.filter(m => m.id !== id)
    saveTeam(updated)
    sound.playClick()
  }, [team, saveTeam])

  const clearTeam = useCallback(() => {
    saveTeam([])
    sound.playClick()
  }, [saveTeam])

  const isInTeam = useCallback((id: number): boolean => {
    return team.some(m => m.id === id)
  }, [team])

  const exportTeamJSON = useCallback((): string => {
    return JSON.stringify(team, null, 2)
  }, [team])

  const importTeamJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed)) {
        const valid = parsed.slice(0, MAX_TEAM_SIZE).filter(p => p.id && p.name && Array.isArray(p.types))
        saveTeam(valid)
        sound.playSuccess()
        return true
      }
    } catch {}
    sound.playError()
    return false
  }, [saveTeam])

  return {
    team,
    isLoaded,
    addMember,
    removeMember,
    clearTeam,
    isInTeam,
    exportTeamJSON,
    importTeamJSON,
    maxSize: MAX_TEAM_SIZE,
  }
}
