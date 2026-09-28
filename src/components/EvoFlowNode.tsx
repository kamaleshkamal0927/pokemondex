'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { EvolutionNode } from '@/lib/pokeapi'

function getIdFromSpeciesUrl(url: string): string {
  const match = url.match(/\/pokemon-species\/(\d+)\//)
  return match ? match[1] : '1'
}

function flattenChain(node: EvolutionNode): EvolutionNode[][] {
  if (node.evolves_to.length === 0) return [[node]]
  return node.evolves_to.flatMap(next =>
    flattenChain(next).map(branch => [node, ...branch])
  )
}

function BeamPath() {
  return (
    <div className="flex flex-col items-center gap-1 px-3">
      <svg width="60" height="24" viewBox="0 0 60 24" className="overflow-visible">
        <motion.line
          x1="0" y1="12" x2="60" y2="12"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.polygon
          points="55,8 60,12 55,16"
          fill="rgba(255,255,255,0.3)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        />
      </svg>
    </div>
  )
}

function EvoNode({ node, delay }: { node: EvolutionNode; delay: number }) {
  const id = getIdFromSpeciesUrl(node.species.url)
  const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  const trigger = node.evolution_details[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center"
    >
      {trigger && (
        <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/10">
          {trigger.min_level ? `Lvl ${trigger.min_level}` : trigger.trigger.name.replace('-', ' ')}
        </div>
      )}
      <Link href={`/pokemon/${id}`} className="group flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/30 transition-all group-hover:scale-110 p-2 shadow-lg">
          <Image
            src={imgUrl}
            alt={node.species.name}
            fill
            className="object-contain drop-shadow-lg p-2"
          />
        </div>
        <span className="text-xs font-bold capitalize text-white/60 group-hover:text-white transition-colors tracking-wide">
          {node.species.name}
        </span>
      </Link>
    </motion.div>
  )
}

export function EvoFlowNode({ chain }: { chain: EvolutionNode }) {
  const paths = flattenChain(chain)

  // Deduplicate paths and show up to 3 unique branches
  const uniquePaths = paths.slice(0, 3)

  return (
    <div className="flex flex-col gap-6 overflow-x-auto pb-2">
      {uniquePaths.map((path, pathIdx) => (
        <div key={pathIdx} className="flex items-center min-w-max">
          {path.map((node, nodeIdx) => (
            <div key={`${node.species.name}-${nodeIdx}`} className="flex items-center">
              {nodeIdx > 0 && <BeamPath />}
              <EvoNode node={node} delay={nodeIdx * 0.15 + pathIdx * 0.1} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
