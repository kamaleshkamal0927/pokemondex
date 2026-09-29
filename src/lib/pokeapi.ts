const BASE_URL = 'https://pokeapi.co/api/v2'

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: {
    name: string
    url: string
  }[]
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonAbility {
  ability: {
    name: string
    url: string
  }
  is_hidden: boolean
  slot: number
}

export interface PokemonMoveVersion {
  level_learned_at: number
  move_learn_method: {
    name: string
    url?: string
  }
  version_group?: {
    name: string
  }
}

export interface PokemonMove {
  move: {
    name: string
    url: string
  }
  version_group_details: PokemonMoveVersion[]
}

export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    front_default: string
    front_shiny: string
    other: {
      'official-artwork': {
        front_default: string
        front_shiny?: string
      }
      showdown?: {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  moves?: PokemonMove[]
}

export type PokemonDetailsFull = PokemonDetails

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string
    language: { name: string }
  }[]
  genera?: {
    genus: string
    language: { name: string }
  }[]
  is_legendary?: boolean
  is_mythical?: boolean
  evolution_chain: {
    url: string
  }
}

export interface EvolutionDetail {
  min_level: number | null
  trigger: { name: string }
  item?: { name: string } | null
}

export interface EvolutionNode {
  species: { name: string; url: string }
  evolution_details: EvolutionDetail[]
  evolves_to: EvolutionNode[]
}

export interface EvolutionChain {
  chain: EvolutionNode
}

// ─── GENERATION CONFIG ───
export interface GenerationConfig {
  id: number
  name: string
  region: string
  startId: number
  endId: number
}

export const GENERATIONS: GenerationConfig[] = [
  { id: 1, name: 'Gen I', region: 'Kanto', startId: 1, endId: 151 },
  { id: 2, name: 'Gen II', region: 'Johto', startId: 152, endId: 251 },
  { id: 3, name: 'Gen III', region: 'Hoenn', startId: 252, endId: 386 },
  { id: 4, name: 'Gen IV', region: 'Sinnoh', startId: 387, endId: 493 },
  { id: 5, name: 'Gen V', region: 'Unova', startId: 494, endId: 649 },
  { id: 6, name: 'Gen VI', region: 'Kalos', startId: 650, endId: 721 },
  { id: 7, name: 'Gen VII', region: 'Alola', startId: 722, endId: 809 },
  { id: 8, name: 'Gen VIII', region: 'Galar', startId: 810, endId: 905 },
  { id: 9, name: 'Gen IX', region: 'Paldea', startId: 906, endId: 1025 },
]

export const POKEMON_GENERATIONS = [
  { name: 'Gen I', start: 1, end: 151 },
  { name: 'Gen II', start: 152, end: 251 },
  { name: 'Gen III', start: 252, end: 386 },
  { name: 'Gen IV', start: 387, end: 493 },
  { name: 'Gen V', start: 494, end: 649 },
  { name: 'Gen VI', start: 650, end: 721 },
  { name: 'Gen VII', start: 722, end: 809 },
  { name: 'Gen VIII', start: 810, end: 905 },
  { name: 'Gen IX', start: 906, end: 1025 },
]

export function getGenerationByPokemonId(id: number): GenerationConfig | null {
  return GENERATIONS.find(g => id >= g.startId && id <= g.endId) || null
}

// Known Mythical & Legendary IDs
const MYTHICAL_IDS = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721,
  801, 802, 807, 808, 809, 893, 1025
])

const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384,
  480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646,
  716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800,
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898,
  905, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024
])

export function getPokemonRarity(id: number): 'mythical' | 'legendary' | 'standard' {
  if (MYTHICAL_IDS.has(id)) return 'mythical'
  if (LEGENDARY_IDS.has(id)) return 'legendary'
  return 'standard'
}

// Asset URL helpers
export function getShowdownSprite(id: number, shiny: boolean = false): string {
  const folder = shiny ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${folder}${id}.gif`
}

export function getOfficialArtwork(id: number, shiny: boolean = false): string {
  const folder = shiny ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${folder}${id}.png`
}

export function getPixelSprite(id: number, shiny: boolean = false): string {
  const folder = shiny ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${folder}${id}.png`
}

export function getCryUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
}

// API functions
export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 } 
  })
  if (!res.ok) throw new Error('Failed to fetch Pokemon list')
  return res.json()
}

export async function getAllPokemon(): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=1025`, {
    next: { revalidate: 86400 } // Cache for 1 day
  })
  if (!res.ok) throw new Error('Failed to fetch all Pokemon')
  return res.json()
}

export async function getPokemonDetails(nameOrId: string | number): Promise<PokemonDetails> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`, {
    next: { revalidate: 3600 } 
  })
  if (!res.ok) throw new Error(`Failed to fetch details for Pokemon ${nameOrId}`)
  return res.json()
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`, {
    next: { revalidate: 3600 } 
  })
  if (!res.ok) throw new Error(`Failed to fetch species for Pokemon ${nameOrId}`)
  return res.json()
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const res = await fetch(url, {
    next: { revalidate: 3600 } 
  })
  if (!res.ok) throw new Error(`Failed to fetch evolution chain`)
  return res.json()
}

export async function getPokemonByType(type: string): Promise<{ pokemon: { pokemon: { name: string, url: string } }[] }> {
  const res = await fetch(`${BASE_URL}/type/${type.toLowerCase()}`, {
    next: { revalidate: 86400 } 
  })
  if (!res.ok) throw new Error(`Failed to fetch pokemon by type`)
  return res.json()
}
