import { EvolutionNode } from '@/lib/pokeapi'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

// Flatten evolution chain into an array of arrays (handling branching evolutions like Eevee)
// For simplicity in UI, we'll try to show a linear path or a simple branching path.
function extractStages(node: EvolutionNode): EvolutionNode[][] {
  if (node.evolves_to.length === 0) return [[node]]
  
  const branches = node.evolves_to.flatMap(extractStages)
  return branches.map(branch => [node, ...branch])
}

function getIdFromUrl(url: string) {
  const match = url.match(/\/pokemon-species\/(\d+)\//)
  return match ? match[1] : ''
}

export function EvolutionChain({ chain }: { chain: EvolutionNode }) {
  const paths = extractStages(chain)

  // Just render the first path if it's super complex, or render all if simple
  // Let's render all unique paths.
  
  return (
    <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
      <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Evolution Chain</h3>
      
      <div className="flex flex-col gap-8 overflow-x-auto pb-4">
        {paths.map((path, i) => (
          <div key={i} className="flex min-w-max items-center gap-4">
            {path.map((node, j) => {
              const id = getIdFromUrl(node.species.url)
              const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
              const trigger = node.evolution_details[0]

              return (
                <div key={node.species.name} className="flex items-center gap-4">
                  {j > 0 && (
                    <div className="flex flex-col items-center px-2 text-slate-400">
                      <ArrowRight className="h-6 w-6" />
                      {trigger && (
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          {trigger.min_level ? `Lvl ${trigger.min_level}` : trigger.trigger.name.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <Link href={`/pokemon/${id}`} className="group flex flex-col items-center gap-2">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100 p-2 transition-transform group-hover:scale-110 dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600">
                      <Image
                        src={imgUrl}
                        alt={node.species.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-semibold capitalize text-slate-700 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                      {node.species.name}
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
