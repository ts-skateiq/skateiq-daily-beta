'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ResultCard from '@/components/ResultCard'
import GameToolbar from '@/components/GameToolbar'
import AuthModal from '@/components/AuthModal'
import { todayUTC } from '@/lib/utils'

const WORD_LENGTH = 5
const MAX_GUESSES = 6
const ACCENT = '#D4A843'
const GAME_KEY = 'wordle'

// Key colors matching reference (uniform gray for unused, NYT colors for used)
const KEY_BG_DEFAULT  = '#818384'
const KEY_BG_CORRECT  = '#71A88A'
const KEY_BG_PRESENT  = ACCENT
const KEY_BG_ABSENT   = '#3a3a3c'

type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'active'

interface GuessRow {
  letters: string[]
  states: LetterState[]
  submitted: boolean
}

function puzzleNumber(): string {
  // Day 1 = June 19, 2021 (Wordle origin)
  const origin = Date.UTC(2021, 5, 19)
  const now = Date.UTC(...(todayUTC().split('-').map(Number) as [number, number, number]))
  const day = Math.floor((now - origin) / 86400000) + 1
  return day.toLocaleString('en-US')
}

function buildShareString(guesses: GuessRow[], won: boolean): string {
  const count = won ? guesses.filter(g => g.submitted).length : 'X'
  const grid = guesses
    .filter(g => g.submitted)
    .map(row => row.states.map(s =>
      s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛'
    ).join(''))
    .join('\n')
  return `Skate Word ${puzzleNumber()} ${count}/${MAX_GUESSES}\n\n${grid}`
}

export default function WordleGame() {
  const router = useRouter()
  const [word, setWord] = useState('')
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(true)
  const [guesses, setGuesses] = useState<GuessRow[]>(
    Array.from({ length: MAX_GUESSES }, () => ({
      letters: Array(WORD_LENGTH).fill(''),
      states:  Array(WORD_LENGTH).fill('empty' as LetterState),
      submitted: false,
    }))
  )
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('')
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({})
  const [shakeRow, setShakeRow] = useState<number | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    fetch(`/api/puzzle?game=wordle&date=${todayUTC()}`)
      .then(r => r.json())
      .then(data => {
        setWord(data.payload?.word ?? 'SKATE')
        setHint(data.payload?.hint ?? '')
        setLoading(false)

        const saved = localStorage.getItem(`${GAME_KEY}_${todayUTC()}`)
        if (saved) {
          const state = JSON.parse(saved)
          setGuesses(state.guesses)
          setCurrentRow(state.currentRow)
          setCurrentCol(state.currentCol)
          setGameOver(state.gameOver)
          setWon(state.won)
          setKeyStates(state.keyStates)
        }
      })
      .catch(() => {
        setWord('SKATE')
        setLoading(false)
      })
  }, [])

  const saveState = useCallback((state: object) => {
    localStorage.setItem(`${GAME_KEY}_${todayUTC()}`, JSON.stringify(state))
    localStorage.setItem(`result_${GAME_KEY}_${todayUTC()}`, (state as { won?: boolean }).won ? 'won' : 'lost')
  }, [])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  const submitGuess = useCallback(() => {
    if (currentRow >= MAX_GUESSES || !word) return
    const row = guesses[currentRow]
    const guess = row.letters.join('')

    if (guess.length < WORD_LENGTH) {
      showMessage('Not enough letters')
      setShakeRow(currentRow)
      setTimeout(() => setShakeRow(null), 600)
      return
    }

    const newStates: LetterState[] = Array(WORD_LENGTH).fill('absent')
    const wordArr = word.split('')
    const used = Array(WORD_LENGTH).fill(false)

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === wordArr[i]) {
        newStates[i] = 'correct'
        used[i] = true
      }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (newStates[i] === 'correct') continue
      const idx = wordArr.findIndex((l, j) => l === guess[i] && !used[j])
      if (idx !== -1) { newStates[i] = 'present'; used[idx] = true }
    }

    const newGuesses = guesses.map((g, i) =>
      i === currentRow ? { ...g, states: newStates, submitted: true } : g
    )
    setGuesses(newGuesses)

    const newKeys = { ...keyStates }
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i]
      const prev = newKeys[letter]
      const next = newStates[i]
      if (prev !== 'correct') {
        if (next === 'correct') newKeys[letter] = 'correct'
        else if (next === 'present') newKeys[letter] = 'present'
        else if (!prev) newKeys[letter] = 'absent'
      }
    }
    setKeyStates(newKeys)

    const isWin = newStates.every(s => s === 'correct')
    const isLoss = !isWin && currentRow + 1 >= MAX_GUESSES

    if (isWin) {
      setWon(true)
      setGameOver(true)
      showMessage('Nailed it!')
    } else if (isLoss) {
      setGameOver(true)
      showMessage(word)
    }

    const nextRow = currentRow + 1
    setCurrentRow(nextRow)
    setCurrentCol(0)
    saveState({ guesses: newGuesses, currentRow: nextRow, currentCol: 0, gameOver: isWin || isLoss, won: isWin, keyStates: newKeys })
  }, [currentRow, guesses, word, keyStates, saveState])

  const handleKey = useCallback((key: string) => {
    if (gameOver) return
    if (key === 'ENTER') { submitGuess(); return }
    if (key === 'BACKSPACE' || key === '⌫') {
      if (currentCol === 0) return
      const newGuesses = guesses.map((g, i) => {
        if (i !== currentRow) return g
        const letters = [...g.letters]
        letters[currentCol - 1] = ''
        return { ...g, letters }
      })
      setGuesses(newGuesses)
      setCurrentCol(c => c - 1)
      return
    }
    if (/^[A-Z]$/.test(key) && currentCol < WORD_LENGTH) {
      const newGuesses = guesses.map((g, i) => {
        if (i !== currentRow) return g
        const letters = [...g.letters]
        letters[currentCol] = key
        return { ...g, letters }
      })
      setGuesses(newGuesses)
      setCurrentCol(c => Math.min(c + 1, WORD_LENGTH))
    }
  }, [gameOver, currentRow, currentCol, guesses, submitGuess])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      handleKey(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const tileFill = (state: LetterState) => {
    if (state === 'correct') return '#71A88A'
    if (state === 'present') return ACCENT
    if (state === 'absent')  return '#3a3a3c'
    return 'transparent'
  }

  const tileBorder = (row: GuessRow, ci: number) => {
    if (row.submitted) return tileFill(row.states[ci])
    return row.letters[ci] ? '#878a8c' : '#3a3a3c'
  }

  const keyBg = (k: string) => {
    const s = keyStates[k]
    if (!s) return KEY_BG_DEFAULT
    if (s === 'correct') return KEY_BG_CORRECT
    if (s === 'present') return KEY_BG_PRESENT
    if (s === 'absent')  return KEY_BG_ABSENT
    return KEY_BG_DEFAULT
  }

  const KEYBOARD: (string | null)[][] = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    [null,'A','S','D','F','G','H','J','K','L',null],
    ['ENTER','Z','X','C','V','B','N','M','⌫'],
  ]

  const shareString = buildShareString(guesses, won)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
      Loading…
    </div>
  )

  // NYT Wordle board: 350px wide, 5px gaps → tile = (350 - 4*5) / 5 = 66px
  const BOARD = 'min(350px, calc(100vw - 24px))'
  const TILE = 'calc((min(350px, 100vw - 24px) - 20px) / 5)'

  const wordleHowTo = (
    <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
      <p style={{ margin: '0 0 12px' }}>Guess the 5-letter skate term in 6 tries.</p>
      {[
        { letter: 'K', bg: '#538d4e', text: 'Correct spot' },
        { letter: 'I', bg: ACCENT, text: 'Wrong spot' },
        { letter: 'C', bg: '#3a3a3c', text: 'Not in word' },
      ].map(({ letter, bg, text }) => (
        <div key={letter} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14, flexShrink: 0 }}>{letter}</div>
          <span>{text}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col w-full pb-4">
      <GameToolbar
        gameName="Skate Word"
        accent={ACCENT}
        howToPlay={wordleHowTo}
      />

      {/* Message toast */}
      {message && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
          {message}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Grid — NYT dimensions: 350px board, 66px tiles, 5px gaps */}
      <div className="flex flex-col items-center" style={{ gap: 5, paddingTop: 26 }}>
        {guesses.map((row, ri) => (
          <div
            key={ri}
            className={shakeRow === ri ? 'animate-shake' : ''}
            style={{ display: 'flex', gap: 5, width: BOARD }}
          >
            {row.letters.map((letter, ci) => (
              <div
                key={ci}
                className="flex items-center justify-center font-black rounded select-none transition-colors"
                style={{
                  width: TILE,
                  height: TILE,
                  fontSize: 'calc((min(350px, 100vw - 24px) - 20px) / 5 * 0.42)',
                  background: row.submitted ? tileFill(row.states[ci]) : 'transparent',
                  border: `2px solid ${tileBorder(row, ci)}`,
                  color: row.submitted ? '#ffffff' : 'var(--text)',
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Result card */}
      {gameOver && (
        <div className="px-4 pb-6 w-full" style={{ marginTop: 10 }}>
          <ResultCard
            title="SKATE WORD"
            accent={ACCENT}
            won={won}
            guessesUsed={guesses.filter(g => g.submitted).length}
            maxGuesses={MAX_GUESSES}
            shareString={shareString}
            onPlayNext={() => setShowAuth(true)}
            nextLabel="Create free account"
            onLogin={() => setShowAuth(true)}
          />
        </div>
      )}

      {/* Keyboard */}
      {!gameOver && (
        <div className="flex flex-col w-full select-none" style={{ paddingTop: 26, paddingBottom: 12, gap: 8 }}>
          {KEYBOARD.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
              {row.map((k, ki) =>
                k === null ? (
                  <div key={`spacer-${ri}-${ki}`} style={{ flex: 0.5 }} />
                ) : (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    className="rounded font-bold flex items-center justify-center transition-opacity active:opacity-70"
                    style={{
                      flex: k === 'ENTER' || k === '⌫' ? 1.5 : 1,
                      height: 58,
                      background: keyBg(k),
                      color: '#ffffff',
                      border: 'none',
                      fontSize: k === 'ENTER' ? 11 : 14,
                      letterSpacing: k === 'ENTER' ? '-0.5px' : '0',
                      cursor: 'pointer',
                      minWidth: 0,
                    }}
                    aria-label={k}
                  >
                    {k === '⌫' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" aria-hidden="true">
                        <path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
                      </svg>
                    ) : k}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      </div>{/* end centered wrapper */}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
