import { getPokemonDetails } from '@/lib/pokeapi'
import { FavoriteButton } from '@/components/FavoriteButton'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const pokemon = await getPokemonDetails(resolvedParams.id)
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link 
          href="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pokédex
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-800">
          <div className="relative flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative flex min-h-[300px] w-full items-center justify-center bg-slate-100 p-8 md:w-1/2 dark:bg-slate-700">
              <div className="absolute right-4 top-4 z-10">
                <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} />
              </div>
              
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <Image
                  src={imageUrl}
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="flex w-full flex-col p-8 md:w-1/2">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-extrabold capitalize text-slate-900 dark:text-white">
                  {pokemon.name}
                </h1>
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
              </div>

              {/* Types */}
              <div className="mb-8 flex gap-3">
                {pokemon.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold capitalize text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>

              {/* Physical Traits */}
              <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
                <div>
                  <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">Height</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {pokemon.height / 10} m
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">Weight</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {pokemon.weight / 10} kg
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                  Base Stats
                </h3>
                <div className="space-y-4">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="flex items-center gap-4">
                      <span className="w-32 text-sm font-medium capitalize text-slate-600 dark:text-slate-400">
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-sm font-bold text-slate-900 dark:text-white">
                        {stat.base_stat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
