'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return
    const duration = 1000
    const incrementTime = Math.max(duration / end, 10)
    
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) clearInterval(timer)
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value])

  return <span>{count}</span>
}

export function StatRadar({ stats }: { stats: any[] }) {
  return (
    <div className="flex flex-col gap-5">
      {stats.map((stat: any, i: number) => {
        const val = stat.base_stat
        let color = 'from-red-500 to-rose-400 shadow-red-500/50'
        if (val >= 50 && val < 90) color = 'from-amber-500 to-yellow-400 shadow-amber-500/50'
        else if (val >= 90 && val < 120) color = 'from-emerald-500 to-green-400 shadow-emerald-500/50'
        else if (val >= 120) color = 'from-cyan-400 to-indigo-500 shadow-cyan-500/50'

        return (
          <div key={stat.stat.name} className="flex items-center gap-4">
            <span className="w-28 text-xs font-bold uppercase tracking-widest text-white/50">
              {stat.stat.name.replace('-', ' ')}
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((val / 255) * 100, 100)}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${color} shadow-[0_0_10px_currentColor]`}
              />
            </div>
            <span className="w-8 text-right text-sm font-black text-white drop-shadow-md">
              <AnimatedCounter value={val} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
