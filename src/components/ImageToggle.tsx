'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageToggleProps {
  name: string
  officialArtwork: string
  pixelSprite: string
  shinySprite: string
}

type ImageType = 'official' | 'pixel' | 'shiny'

export function ImageToggle({ name, officialArtwork, pixelSprite, shinySprite }: ImageToggleProps) {
  const [activeType, setActiveType] = useState<ImageType>('official')

  const currentImage = 
    activeType === 'official' ? officialArtwork : 
    activeType === 'pixel' ? pixelSprite : shinySprite

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative flex h-64 w-64 items-center justify-center drop-shadow-2xl md:h-80 md:w-80">
        <Image
          src={currentImage || officialArtwork}
          alt={name}
          fill
          className={`object-contain transition-all duration-500 ${activeType !== 'official' ? 'scale-150 rendering-pixelated' : 'scale-100'}`}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex rounded-full bg-slate-200/50 p-1 backdrop-blur-sm dark:bg-slate-800/50 shadow-inner">
        <button
          onClick={() => setActiveType('official')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeType === 'official' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Artwork
        </button>
        <button
          onClick={() => setActiveType('pixel')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeType === 'pixel' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Pixel
        </button>
        <button
          onClick={() => setActiveType('shiny')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeType === 'shiny' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Shiny
        </button>
      </div>
    </div>
  )
}
