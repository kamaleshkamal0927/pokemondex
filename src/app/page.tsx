import { getAllPokemon } from '@/lib/pokeapi'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const data = await getAllPokemon()
  
  // We only want the first 1000 or so to avoid weird forms at the end of the API
  // but PokeAPI returns 1300. We'll just pass all results to the client.
  const allPokemon = data.results

  return (
    <main className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Pokédex Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Search, filter, and explore the entire Pokémon universe.
          </p>
        </header>

        <DashboardClient initialPokemon={allPokemon} />
      </div>
    </main>
  )
}
