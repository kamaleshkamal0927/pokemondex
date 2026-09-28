import Link from 'next/link'
import Image from 'next/image'
import { FavoriteButton } from './FavoriteButton'

interface PokemonCardProps {
  name: string
  url: string
}

export function PokemonCard({ name, url }: PokemonCardProps) {
  // Extract ID from URL (e.g., https://pokeapi.co/api/v2/pokemon/1/)
  const idMatch = url.match(/\/pokemon\/(\d+)\//)
  const id = idMatch ? parseInt(idMatch[1], 10) : 0
  
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-slate-800">
      <Link href={`/pokemon/${id}`} className="block p-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 p-4 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-xl font-bold capitalize text-slate-800 dark:text-white">
            {name}
          </h2>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            #{id.toString().padStart(3, '0')}
          </span>
        </div>
      </Link>
      
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton pokemonId={id} pokemonName={name} />
      </div>
    </div>
  )
}
