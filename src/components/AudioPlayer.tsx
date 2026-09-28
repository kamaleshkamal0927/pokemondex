'use client'

import { Play, Volume2 } from 'lucide-react'
import { useRef, useState } from 'react'

export function AudioPlayer({ id }: { id: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = () => {
    if (audioRef.current) {
      setIsPlaying(true)
      audioRef.current.volume = 0.5
      audioRef.current.play()
    }
  }

  return (
    <div>
      <button
        onClick={playAudio}
        className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 shadow-sm"
      >
        {isPlaying ? <Volume2 className="h-4 w-4 animate-pulse text-blue-500" /> : <Play className="h-4 w-4" />}
        Play Cry
      </button>
      <audio 
        ref={audioRef} 
        src={`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
