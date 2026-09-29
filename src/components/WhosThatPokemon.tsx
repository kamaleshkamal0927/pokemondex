'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Trophy, Flame, RotateCcw, Sparkles, Check, X, ArrowRight } from 'lucide-react'
import { sound } from '@/utils/soundFx'
import { TYPE_COLORS } from '@/constants/typeColors'

interface WhosThatPokemonProps {
  allPokemon: { name: string; url: string }[]
}

interface Question {
  correctId: number
  correctName: string
  options: { id: number; name: string }[]
  types: string[]
  artworkUrl: string
}

const TOTAL_TIME = 15

export function WhosThatPokemon({ allPokemon }: WhosThatPokemonProps) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pokedex_minigame_highscore')
      if (saved) setHighScore(parseInt(saved, 10))
    } catch {}
  }, [])

  const generateQuestion = useCallback(async () => {
    if (allPokemon.length === 0) return
    setLoading(true)
    setRevealed(false)
    setSelectedAnswer(null)
    setTimeLeft(TOTAL_TIME)

    // Pick a random pokemon from Gen 1 to Gen 5 for recognizable silhouettes
    const pool = allPokemon.slice(0, 649)
    const randomItem = pool[Math.floor(Math.random() * pool.length)]
    const match = randomItem.url.match(/\/pokemon\/(\d+)\//)
    const correctId = match ? parseInt(match[1], 10) : 25

    // Fetch types and data
    let types: string[] = ['electric']
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${correctId}`)
      if (res.ok) {
        const data = await res.json()
        types = data.types.map((t: any) => t.type.name)
      }
    } catch {}

    // Pick 3 distractors
    const distractors: { id: number; name: string }[] = []
    while (distractors.length < 3) {
      const dist = pool[Math.floor(Math.random() * pool.length)]
      const m = dist.url.match(/\/pokemon\/(\d+)\//)
      const dId = m ? parseInt(m[1], 10) : 1
      if (dId !== correctId && !distractors.some(d => d.id === dId)) {
        distractors.push({ id: dId, name: dist.name })
      }
    }

    const options = [...distractors, { id: correctId, name: randomItem.name }].sort(() => Math.random() - 0.5)

    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctId}.png`

    setQuestion({
      correctId,
      correctName: randomItem.name,
      options,
      types,
      artworkUrl,
    })
    setLoading(false)
    sound.playScan()
  }, [allPokemon])

  // Initial load
  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  // Timer countdown
  useEffect(() => {
    if (revealed || loading) return

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [revealed, loading])

  const handleTimeout = () => {
    setRevealed(true)
    setStreak(0)
    sound.playError()
  }

  const handleGuess = (guessedName: string) => {
    if (revealed || !question) return
    setSelectedAnswer(guessedName)
    setRevealed(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const isCorrect = guessedName.toLowerCase() === question.correctName.toLowerCase()
    if (isCorrect) {
      const bonus = timeLeft * 10
      const newScore = score + 100 + bonus
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      if (newScore > highScore) {
        setHighScore(newScore)
        try {
          localStorage.setItem('pokedex_minigame_highscore', String(newScore))
        } catch {}
      }
      sound.playSuccess()
      sound.playCry(question.correctId)
    } else {
      setStreak(0)
      sound.playError()
      sound.playCry(question.correctId)
    }
  }

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (revealed || !question) {
        if (revealed && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          generateQuestion()
        }
        return
      }
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 4 && question.options[num - 1]) {
        handleGuess(question.options[num - 1].name)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [revealed, question, generateQuestion])

  const primaryType = question?.types[0] || 'electric'
  const tc = TYPE_COLORS[primaryType] || TYPE_COLORS.default

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Who&apos;s That Pokémon?
            </h2>
            <p className="text-xs text-white/40 tracking-wider font-mono">
              IDENTIFY THE SILHOUETTE BEFORE TIME RUNS OUT
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
            <Flame className="h-4 w-4" /> {streak} STREAK
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Trophy className="h-4 w-4" /> {score} PTS (BEST: {highScore})
          </div>
        </div>
      </div>

      {/* Main Arena */}
      <div
        className="relative rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#0e1220] to-[#080b13] p-8 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]"
      >
        {/* Ambient glow matching type */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: revealed
              ? `radial-gradient(circle at 50% 40%, rgba(${tc.rgb}, 0.25) 0%, transparent 70%)`
              : 'radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* 15-second Timer Bar */}
        <div className="relative w-full h-2 rounded-full bg-white/5 overflow-hidden mb-8 border border-white/5">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${
              timeLeft <= 4 ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-gradient-to-r from-violet-500 to-cyan-400'
            }`}
            style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%` }}
          />
        </div>

        {/* Silhouette Centerpiece */}
        <div className="relative flex flex-col items-center justify-center min-h-[300px] my-4">
          {loading ? (
            <div className="h-48 w-48 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          ) : question ? (
            <div className="relative">
              {/* Silhouette / Revealed Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative h-64 w-64 md:h-72 md:w-72"
              >
                <img
                  src={question.artworkUrl}
                  alt="Who's that Pokemon?"
                  className={`h-full w-full object-contain transition-all duration-700 ${
                    revealed ? 'pokemon-revealed' : 'pokemon-silhouette'
                  }`}
                />
              </motion.div>

              {/* Audio Hint Button */}
              <button
                onClick={() => sound.playCry(question.correctId)}
                title="Play Audio Cry Hint"
                className="absolute -bottom-2 right-4 p-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-red-600 transition-all shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold"
              >
                <Volume2 className="h-4 w-4" /> Cry Hint
              </button>
            </div>
          ) : null}

          {/* Reveal Result Banner */}
          <AnimatePresence>
            {revealed && question && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="text-2xl md:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 capitalize">
                  It&apos;s {question.correctName.replace('-', ' ')}!
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xs font-mono text-white/40">#{question.correctId.toString().padStart(3, '0')}</span>
                  {question.types.map(t => {
                    const c = TYPE_COLORS[t] || TYPE_COLORS.default
                    return (
                      <span key={t} className={`text-[10px] font-black uppercase rounded-full px-2.5 py-0.5 ${c.badge} ${c.badgeText}`}>
                        {t}
                      </span>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4 Multiple-Choice Buttons */}
        {question && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {question.options.map((opt, idx) => {
              const isCorrect = opt.name === question.correctName
              const isChosen = opt.name === selectedAnswer
              let btnStyle = 'border-white/10 bg-white/[0.03] text-white hover:border-violet-500/50 hover:bg-white/5'

              if (revealed) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                } else if (isChosen) {
                  btnStyle = 'border-red-500 bg-red-500/20 text-red-300'
                } else {
                  btnStyle = 'border-white/5 bg-white/[0.01] text-white/30 opacity-40'
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleGuess(opt.name)}
                  disabled={revealed}
                  className={`p-4 rounded-2xl border text-sm font-black uppercase tracking-wider flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono text-white/60">
                      {idx + 1}
                    </span>
                    <span className="capitalize">{opt.name.replace('-', ' ')}</span>
                  </div>

                  {revealed && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                  {revealed && isChosen && !isCorrect && <X className="h-5 w-5 text-red-400" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Next Round Action */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={generateQuestion}
              className="px-8 py-4 rounded-2xl font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 transition-all"
            >
              Next Challenger <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
