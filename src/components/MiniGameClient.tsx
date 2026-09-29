'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Volume2, Trophy, RotateCcw, Sparkles } from 'lucide-react'
import { useSoundFX } from './SoundProvider'

interface GameState {
  pokemonId: number
  pokemonName: string
  options: string[]
  revealed: boolean
  correct: boolean | null
}

const TOTAL_OPTIONS = 4

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MiniGameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(15)
  const [isPlaying, setIsPlaying] = useState(false)
  const [allNames, setAllNames] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { play } = useSoundFX()

  // Load high score and all pokemon names
  useEffect(() => {
    const stored = localStorage.getItem('pokedex_minigame_highscore')
    if (stored) setHighScore(parseInt(stored, 10))
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then(res => res.json())
      .then(data => setAllNames(data.results.map((r: any) => r.name)))
  }, [])

  const startRound = useCallback(() => {
    if (allNames.length === 0) return
    const id = Math.floor(Math.random() * 1025) + 1
    const correctName = allNames[id - 1]
    const wrongNames = shuffleArray(allNames.filter(n => n !== correctName)).slice(0, TOTAL_OPTIONS - 1)
    const options = shuffleArray([correctName, ...wrongNames])

    setGameState({
      pokemonId: id,
      pokemonName: correctName,
      options,
      revealed: false,
      correct: null,
    })
    setTimer(15)
    setShowResult(false)
    play('scan')
  }, [allNames, play])

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setStreak(0)
    startRound()
    play('open')
  }

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || !gameState || gameState.revealed) return
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handleAnswer(null)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPlaying, gameState])

  const handleAnswer = (answer: string | null) => {
    if (!gameState || gameState.revealed) return
    if (timerRef.current) clearInterval(timerRef.current)

    const isCorrect = answer === gameState.pokemonName
    setGameState(prev => prev ? { ...prev, revealed: true, correct: isCorrect } : null)
    setShowResult(true)

    if (isCorrect) {
      const points = 100 + timer * 10 + streak * 20
      setScore(s => s + points)
      setStreak(s => s + 1)
      play('success')
    } else {
      setStreak(0)
      play('error')
    }
  }

  const nextRound = () => {
    startRound()
  }

  const endGame = () => {
    setIsPlaying(false)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('pokedex_minigame_highscore', String(score))
    }
    play('close')
  }

  const playCry = () => {
    if (gameState && audioRef.current) {
      audioRef.current.src = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${gameState.pokemonId}.ogg`
      audioRef.current.volume = 0.4
      audioRef.current.play()
      play('click')
    }
  }

  const artworkUrl = gameState
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gameState.pokemonId}.png`
    : ''

  return (
    <div className="w-full px-4 md:px-8 lg:px-12">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-400 to-amber-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Who's That Pokémon?</h1>
        </div>
        <p className="text-sm text-white/40 ml-4">Guess the Pokémon from its silhouette. Beat the timer for bonus points!</p>
      </div>

      {/* Score Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Score</div>
          <div className="text-2xl font-black text-white tabular-nums">{score}</div>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Streak</div>
          <div className="text-2xl font-black text-white tabular-nums">{streak}</div>
          {streak >= 3 && <Sparkles className="inline-block h-3 w-3 text-yellow-400 ml-1" />}
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">High Score</div>
          <div className="text-2xl font-black text-yellow-400 tabular-nums flex items-center justify-center gap-1">
            <Trophy className="h-4 w-4" />{highScore}
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white/[0.03] border border-white/10 p-12 text-center max-w-md"
          >
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                <Play className="h-10 w-10 text-black ml-1" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Ready to Play?</h2>
            <p className="text-sm text-white/40 mb-6">15 seconds per round. Faster answers earn more points. Build streaks for multipliers!</p>
            <button
              onClick={startGame}
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3 text-sm font-black text-black uppercase tracking-wider hover:scale-105 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.4)]"
            >
              Start Game
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Timer */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase tracking-widest text-white/40">Time Remaining</span>
              <span className={`text-sm font-bold tabular-nums ${timer <= 5 ? 'text-red-400' : 'text-white/60'}`}>{timer}s</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timer <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-400 to-amber-500'}`}
                animate={{ width: `${(timer / 15) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {gameState && (
              <motion.div
                key={gameState.pokemonId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {/* Silhouette / Revealed Image */}
                <div className="relative flex flex-col items-center mb-8">
                  <div className="relative w-64 h-64 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={artworkUrl}
                      alt=""
                      className={`w-48 h-48 object-contain transition-all duration-500 ${
                        gameState.revealed ? 'drop-shadow-2xl' : 'brightness-0 contrast-200'
                      }`}
                    />
                  </div>
                  <button
                    onClick={playCry}
                    className="mt-4 flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                  >
                    <Volume2 className="h-4 w-4" /> Play Cry Hint
                  </button>
                  <audio ref={audioRef} />
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-3">
                  {gameState.options.map(option => {
                    const isCorrect = option === gameState.pokemonName
                    const isSelected = gameState.revealed && isCorrect
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={gameState.revealed}
                        className={`rounded-xl border px-4 py-4 text-sm font-bold capitalize transition-all ${
                          gameState.revealed
                            ? isCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                              : 'border-white/10 bg-white/[0.02] text-white/30'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        {option.replace('-', ' ')}
                      </button>
                    )
                  })}
                </div>

                {/* Result + Next */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col items-center gap-4"
                  >
                    <div className={`text-2xl font-black ${gameState.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {gameState.correct ? 'Correct!' : `It was ${gameState.pokemonName.replace('-', ' ')}!`}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={nextRound}
                        className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:scale-105 transition-transform"
                      >
                        Next Round
                      </button>
                      <button
                        onClick={endGame}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" /> End Game
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
