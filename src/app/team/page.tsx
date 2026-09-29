import { getAllPokemon } from '@/lib/pokeapi'
import { TeamBuilderClient } from '@/components/TeamBuilderClient'

export default async function TeamPage() {
  const data = await getAllPokemon()
  const allPokemon = data.results.filter((p) => {
    const m = p.url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) <= 1025 : false
  })

  return (
    <main className="flex-1 px-4 md:px-8 lg:px-12">
      <TeamBuilderClient allPokemon={allPokemon} />
    </main>
  )
}
