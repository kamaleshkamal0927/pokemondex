import { getAllPokemon } from '@/lib/pokeapi'
import { DashboardClient } from '@/components/DashboardClient'

export default async function Home() {
  const data = await getAllPokemon()
  const allPokemon = data.results.filter(p => {
    const m = p.url.match(/\/pokemon\/(\d+)\//)
    return m ? parseInt(m[1], 10) <= 1025 : false
  })

  return <DashboardClient initialPokemon={allPokemon} />
}
