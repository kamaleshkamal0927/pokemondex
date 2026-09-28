'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function AudioVisualizer({ id, color }: { id: number, color: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = () => {
    if (audioRef.current) {
      setIsPlaying(true)
      audioRef.current.volume = 0.5
      audioRef.current.play()
    }
  }

  // Visualizer rings
  const rings = [1, 2, 3]

  return (
    <div className="relative flex items-center justify-center mt-4">
      {isPlaying && rings.map((ring) => (
        <motion.div
          key={ring}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: ring * 0.3,
            ease: "easeOut"
          }}
          className={`absolute inset-0 rounded-full border-2 border-white/50 ${color.replace('bg-', 'border-')}`}
        />
      ))}
      <button
        onClick={playAudio}
        className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 transition-all hover:scale-110 group"
      >
        {isPlaying ? (
          <Volume2 className="h-6 w-6 text-white animate-pulse" />
        ) : (
          <Play className="h-6 w-6 text-white ml-1 group-hover:text-emerald-400 transition-colors" />
        )}
      </button>
      <audio 
        ref={audioRef} 
        src={`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
