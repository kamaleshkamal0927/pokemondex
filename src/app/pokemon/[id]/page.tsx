import { getPokemonDetails, getPokemonSpecies, getEvolutionChain } from '@/lib/pokeapi'
import { FavoriteButton } from '@/components/FavoriteButton'
import { TypeBadge } from '@/components/TypeBadge'
import { StatBar } from '@/components/StatBar'
import { AudioPlayer } from '@/components/AudioPlayer'
import { ImageToggle } from '@/components/ImageToggle'
import { EvolutionChain } from '@/components/EvolutionChain'
import { TYPE_COLORS } from '@/constants/typeColors'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  // Fetch details & species in parallel
  const [pokemon, species] = await Promise.all([
    getPokemonDetails(resolvedParams.id),
    getPokemonSpecies(resolvedParams.id).catch(() => null)
  ])

  // Fetch evolution chain if species is available
  const evoChain = species?.evolution_chain?.url 
    ? await getEvolutionChain(species.evolution_chain.url).catch(() => null)
    : null

  // Images
  const officialArtwork = pokemon.sprites.other['official-artwork'].front_default
  const pixelSprite = pokemon.sprites.front_default
  const shinySprite = pokemon.sprites.front_shiny

  // English Flavor text
  const flavorTextEntry = species?.flavor_text_entries.find((f: any) => f.language.name === 'en')
  const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.'

  // Type color
  const primaryType = pokemon.types[0]?.type.name || 'default'
  const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.default

  // Calculate BST
  const bst = pokemon.stats.reduce((acc: number, stat: any) => acc + stat.base_stat, 0)

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-500 bg-gradient-to-br ${typeColor.gradient} bg-opacity-10 dark:bg-opacity-20`}>
      <div className="mx-auto max-w-5xl">
        <Link 
          href="/"
          className="mb-6 inline-flex items-center rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-slate-900 backdrop-blur-md transition-all hover:bg-white/70 dark:bg-black/30 dark:text-white dark:hover:bg-black/50 shadow-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="overflow-hidden rounded-[2.5rem] bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-slate-900/90">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Column: Media & Core Info */}
            <div className={`relative flex flex-col items-center p-8 lg:w-5/12 bg-gradient-to-b ${typeColor.gradient} bg-opacity-20`}>
              <div className="absolute right-6 top-6 z-10">
                <FavoriteButton pokemonId={pokemon.id} />
              </div>
              
              <div className="mt-8 mb-6">
                <ImageToggle 
                  name={pokemon.name}
                  officialArtwork={officialArtwork}
                  pixelSprite={pixelSprite}
                  shinySprite={shinySprite}
                />
              </div>

              <div className="mt-4 flex flex-col items-center text-center">
                <span className="mb-2 text-2xl font-black text-white/70 drop-shadow-sm">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
                <h1 className="mb-4 text-5xl font-black capitalize text-white drop-shadow-md">
                  {pokemon.name.replace('-', ' ')}
                </h1>
                
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                  {pokemon.types.map((t: any) => (
                    <TypeBadge key={t.type.name} type={t.type.name} className="shadow-lg" />
                  ))}
                </div>

                <AudioPlayer id={pokemon.id} />
              </div>
            </div>

            {/* Right Column: Details & Stats */}
            <div className="flex flex-col p-8 lg:w-7/12">
              <p className="mb-8 text-lg leading-relaxed text-slate-700 dark:text-slate-300 italic">
                "{flavorText}"
              </p>

              {/* Physical Traits & Abilities */}
              <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 shadow-sm">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Height</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{pokemon.height / 10} m</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 shadow-sm">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Weight</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{pokemon.weight / 10} kg</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 shadow-sm">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Abilities</p>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((a: any) => (
                      <span key={a.ability.name} className={`rounded-md px-2 py-1 text-xs font-bold capitalize ${a.is_hidden ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {a.ability.name.replace('-', ' ')} {a.is_hidden && '(Hidden)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-800 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Base Stats</h3>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Total: {bst}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {pokemon.stats.map((stat: any) => (
                    <StatBar 
                      key={stat.stat.name} 
                      name={stat.stat.name} 
                      value={stat.base_stat} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {evoChain && <EvolutionChain chain={evoChain.chain} />}
        
      </div>
    </main>
  )
}
