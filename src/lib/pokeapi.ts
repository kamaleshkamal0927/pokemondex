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

export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string
    language: { name: string }
  }[]
  evolution_chain: {
    url: string
  }
}

export interface EvolutionDetail {
  min_level: number | null
  trigger: { name: string }
}

export interface EvolutionNode {
  species: { name: string; url: string }
  evolution_details: EvolutionDetail[]
  evolves_to: EvolutionNode[]
}

export interface EvolutionChain {
  chain: EvolutionNode
}

export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 } 
  })
  if (!res.ok) throw new Error('Failed to fetch Pokemon list')
  return res.json()
}

export async function getAllPokemon(): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=10000`, {
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
