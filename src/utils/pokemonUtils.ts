import { POKEMON_GENERATIONS } from '@/lib/pokeapi'

export function getGeneration(id: number): number {
  for (let i = 0; i < POKEMON_GENERATIONS.length; i++) {
    if (id <= POKEMON_GENERATIONS[i].end) return i + 1
  }
  return 9
}

export function getStatTier(bst: number): { tier: string; color: string } {
  if (bst >= 600) return { tier: 'S', color: 'from-amber-400 to-yellow-300' }
  if (bst >= 500) return { tier: 'A', color: 'from-emerald-400 to-green-300' }
  if (bst >= 400) return { tier: 'B', color: 'from-cyan-400 to-blue-300' }
  if (bst >= 300) return { tier: 'C', color: 'from-violet-400 to-purple-300' }
  return { tier: 'D', color: 'from-slate-400 to-gray-300' }
}
