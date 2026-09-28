import { getPokemonList } from '@/lib/pokeapi'
import { PokemonCard } from '@/components/PokemonCard'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1
  const limit = 20
  const offset = (page - 1) * limit

  const data = await getPokemonList(limit, offset)
  const totalPages = Math.ceil(data.count / limit)

  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Pokédex
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Search for Pokémon by name or using the National Pokédex number.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.results.map((pokemon) => (
            <PokemonCard 
              key={pokemon.name} 
              name={pokemon.name} 
              url={pokemon.url} 
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center space-x-4">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}`}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}`}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
