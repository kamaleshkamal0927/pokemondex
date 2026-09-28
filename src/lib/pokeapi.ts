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

export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch Pokemon list')
  }
  
  return res.json()
}

export async function getPokemonDetails(nameOrId: string | number): Promise<PokemonDetails> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`, {
    next: { revalidate: 3600 } 
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch details for Pokemon ${nameOrId}`)
  }
  
  return res.json()
}
