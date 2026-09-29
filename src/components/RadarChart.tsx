'use client'

import { useMemo } from 'react'

export interface RadarStatItem {
  name: string
  label: string
  value: number
  max?: number
}

export interface RadarContestant {
  name: string
  color: string
  glowColor: string
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
}

interface RadarChartProps {
  contestants: RadarContestant[]
  size?: number
}

const STAT_KEYS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'speed', label: 'SPE' },
  { key: 'specialDefense', label: 'SPD' },
  { key: 'specialAttack', label: 'SPA' },
] as const

const MAX_STAT = 200

export function getTier(bst: number): { tier: string; color: string; badge: string } {
  if (bst >= 600) return { tier: 'S+ TIER', color: '#ec4899', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.5)]' }
  if (bst >= 530) return { tier: 'S TIER', color: '#a855f7', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.5)]' }
  if (bst >= 480) return { tier: 'A TIER', color: '#3b82f6', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' }
  if (bst >= 400) return { tier: 'B TIER', color: '#10b981', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
  if (bst >= 300) return { tier: 'C TIER', color: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  return { tier: 'D TIER', color: '#ef4444', badge: 'bg-red-500/20 text-red-300 border-red-500/40' }
}

export function RadarChart({ contestants, size = 300 }: RadarChartProps) {
  const center = size / 2
  const radius = (size / 2) * 0.72
  const numAxes = STAT_KEYS.length
  const angleStep = (Math.PI * 2) / numAxes

  // Precompute grid polygon rings (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const gridPolygons = useMemo(() => {
    return gridLevels.map(level => {
      const r = radius * level
      const points = Array.from({ length: numAxes }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      return points.join(' ')
    })
  }, [center, radius, numAxes, angleStep])

  // Compute stat polygon for each contestant
  const contestantPolygons = useMemo(() => {
    return contestants.map(c => {
      const points = STAT_KEYS.map((stat, i) => {
        const val = Math.min(Math.max(c.stats[stat.key] || 10, 10), MAX_STAT)
        const r = (val / MAX_STAT) * radius
        const angle = i * angleStep - Math.PI / 2
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      return points.join(' ')
    })
  }, [contestants, center, radius, angleStep])

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circular web lines */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === gridPolygons.length - 1 ? 'rgba(255, 255, 255, 0.02)' : 'none'}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis spokes */}
        {Array.from({ length: numAxes }).map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x2 = center + radius * Math.cos(angle)
          const y2 = center + radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          )
        })}

        {/* Contestants polygon data layers */}
        {contestants.map((c, idx) => (
          <g key={c.name + idx}>
            <polygon
              points={contestantPolygons[idx]}
              fill={c.color}
              fillOpacity={contestants.length > 1 ? 0.25 : 0.35}
              stroke={c.color}
              strokeWidth="2.5"
              style={{
                filter: `drop-shadow(0 0 10px ${c.glowColor || c.color})`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
            {/* Corner dots */}
            {contestantPolygons[idx].split(' ').map((pt, pIdx) => {
              const [px, py] = pt.split(',')
              return (
                <circle
                  key={pIdx}
                  cx={px}
                  cy={py}
                  r="3.5"
                  fill="#ffffff"
                  stroke={c.color}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 6px ${c.color})` }}
                />
              )
            })}
          </g>
        ))}

        {/* Axis Labels */}
        {STAT_KEYS.map((stat, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelDist = radius + 22
          const x = center + labelDist * Math.cos(angle)
          const y = center + labelDist * Math.sin(angle)

          return (
            <g key={stat.key} transform={`translate(${x}, ${y})`}>
              <text
                x="0"
                y="3"
                textAnchor="middle"
                className="text-[10px] font-black uppercase tracking-wider fill-white/60 font-mono"
              >
                {stat.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
