'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ResultCard from '@/components/ResultCard'
import GameToolbar from '@/components/GameToolbar'
import AuthModal from '@/components/AuthModal'
import { todayUTC } from '@/lib/utils'
import type { ConnectionsGroup } from '@/lib/types'
import { cn } from '@/lib/utils'

const SAGE    = '#7E9ECC'
const GAME_KEY    = 'connections'
const MAX_MISTAKES = 4

const COLOR_MAP: Record<string, string> = {
  yellow: '#D4A843',
  green:  '#71A88A',
  blue:   '#CB8D82',
  purple: '#9b59b6',
}

function buildShareString(groups: ConnectionsGroup[], guessHistory: string[][], won: boolean): string {
  const today = todayUTC()
  const colorLetter: Record<string, string> = { yellow: 'Y', green: 'G', blue: 'B', purple: 'P' }
  const grid = guessHistory.map(guess =>
    guess.map(item => {
      const group = groups.find(g => g.items.includes(item))
      return group ? colorLetter[group.color] : 'X'
    }).join('')
  ).join('\n')
  return `Skate IQ – Connect ${today}\n${won ? 'WIN' : 'LOSS'}\n\n${grid}\n\nskateiq.com/games`
}

export default function ConnectionsGame() {
  const router = useRouter()
  const [groups, setGroups]         = useState<ConnectionsGroup[]>([])
  const [loading, setLoading]       = useState(true)
  const [tiles, setTiles]           = useState<string[]>([])
  const [selected, setSelected]     = useState<string[]>([])
  const [solved, setSolved]         = useState<ConnectionsGroup[]>([])
  const [mistakes, setMistakes]     = useState(0)
  const [gameOver, setGameOver]     = useState(false)
  const [won, setWon]               = useState(false)
  const [message, setMessage]       = useState('')
  const [shaking, setShaking]       = useState(false)
  const [guessHistory, setGuessHistory] = useState<string[][]>([])
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    fetch(`/api/puzzle?game=connections&date=${todayUTC()}`)
      .then(r => r.json())
      .then(data => {
        const payload = data.payload as { groups: ConnectionsGroup[] }
        setGroups(payload.groups)
        const allItems = payload.groups.flatMap(g => g.items)
        setTiles(allItems.sort(() => Math.random() - 0.5))
        setLoading(false)

        const saved = localStorage.getItem(`${GAME_KEY}_${todayUTC()}`)
        if (saved) {
          const s = JSON.parse(saved)
          setSolved(s.solved)
          setMistakes(s.mistakes)
          setGameOver(s.gameOver)
          setWon(s.won)
          setGuessHistory(s.guessHistory)
          const remaining = allItems.filter(
            item => !s.solved.flatMap((g: ConnectionsGroup) => g.items).includes(item)
          )
          setTiles(remaining.sort(() => Math.random() - 0.5))
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const showMessage = (msg: string, duration = 2000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  const toggleSelect = (item: string) => {
    if (gameOver) return
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : prev.length < 4 ? [...prev, item] : prev
    )
  }

  const shuffle = () => setTiles(prev => [...prev].sort(() => Math.random() - 0.5))

  const submitGuess = () => {
    if (selected.length !== 4) return
    const newHistory = [...guessHistory, selected]
    setGuessHistory(newHistory)

    const match = groups.find(g =>
      g.items.every(item => selected.includes(item)) &&
      selected.every(item => g.items.includes(item))
    )

    if (match) {
      const newSolved = [...solved, match]
      const remaining = tiles.filter(t => !match.items.includes(t))
      setSolved(newSolved)
      setTiles(remaining)
      setSelected([])
      showMessage(match.category)
      const isWin = newSolved.length === groups.length
      if (isWin) { setWon(true); setGameOver(true) }
      localStorage.setItem(`result_${GAME_KEY}_${todayUTC()}`, isWin ? 'won' : 'playing')
      localStorage.setItem(`${GAME_KEY}_${todayUTC()}`, JSON.stringify({
        solved: newSolved, mistakes, gameOver: isWin, won: isWin, guessHistory: newHistory,
      }))
    } else {
      const maxMatch = Math.max(...groups.map(g => selected.filter(i => g.items.includes(i)).length))
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
      setSelected([])
      showMessage(maxMatch === 3 ? 'One away…' : 'Not quite')
      if (newMistakes >= MAX_MISTAKES) {
        setGameOver(true)
        localStorage.setItem(`result_${GAME_KEY}_${todayUTC()}`, 'lost')
        localStorage.setItem(`${GAME_KEY}_${todayUTC()}`, JSON.stringify({
          solved, mistakes: newMistakes, gameOver: true, won: false, guessHistory: newHistory,
        }))
      }
    }
  }

  // true = that mistake slot has been used = dot goes dim
  const mistakeDots = Array.from({ length: MAX_MISTAKES }, (_, i) => i < mistakes)
  const shareString = buildShareString(groups, guessHistory, won)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
      Loading…
    </div>
  )

  const connectHowTo = (
    <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
      <p style={{ margin: '0 0 10px' }}>Group 16 skate terms into 4 categories of 4.</p>
      <p style={{ margin: '0 0 10px' }}>Select 4 tiles and tap <strong>Submit</strong> to guess a group.</p>
      <p style={{ margin: 0 }}>You get 4 mistakes before the game ends.</p>
    </div>
  )

  return (
    <div className="flex flex-col w-full pb-8">
      <GameToolbar
        gameName="Skate Connect"
        accent={SAGE}
        howToPlay={connectHowTo}
      />

      {/* Toast */}
      {message && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 px-5 py-2 rounded-full text-sm font-bold" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
          {message}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>

      {/* Solved group banners */}
      <div className="flex flex-col gap-2" style={{ padding: '0 16px' }}>
        {solved.map(g => (
          <div key={g.category} className="w-full rounded-xl text-center" style={{ background: COLOR_MAP[g.color], padding: '21px' }}>
            <div className="font-black uppercase tracking-wide text-white" style={{ fontSize: 15 }}>{g.category}</div>
            <div className="text-white opacity-80" style={{ fontSize: 13, marginTop: 4 }}>{g.items.join(', ')}</div>
          </div>
        ))}
      </div>

      {/* Tile grid */}
      {!gameOver && (
        <div
          className={cn(shaking && 'animate-shake')}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: '12px 16px 0',
          }}
        >
          {tiles.map(item => {
            const isSelected = selected.includes(item)
            return (
              <button
                key={item}
                onClick={() => toggleSelect(item)}
                className="rounded-xl font-black uppercase transition-all active:scale-95 select-none"
                style={{
                  aspectRatio: '1',
                  background: isSelected ? SAGE : 'var(--surface-2)',
                  color: isSelected ? '#0a0a0a' : 'var(--text)',
                  border: 'none',
                  fontSize: item.length > 9 ? 9 : item.length > 6 ? 11 : 13,
                  letterSpacing: '0.03em',
                  padding: '0 4px',
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            )
          })}
        </div>
      )}

      {/* Mistakes + buttons */}
      {!gameOver && (
        <div className="flex flex-col items-center gap-4" style={{ paddingTop: 20 }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Mistakes Remaining</span>
            {mistakeDots.map((used, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full transition-colors"
                style={{ background: used ? 'var(--surface-2)' : '#7E9ECC' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={shuffle}
              className="text-sm font-bold transition-opacity hover:opacity-80 active:opacity-60"
              style={{ background: SAGE, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', cursor: 'pointer' }}
            >
              Shuffle
            </button>
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="text-sm font-bold transition-opacity hover:opacity-80 active:opacity-60"
              style={{ background: SAGE, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', opacity: selected.length === 0 ? 0.35 : 1 }}
            >
              Deselect All
            </button>
            <button
              onClick={submitGuess}
              disabled={selected.length !== 4}
              className="text-sm font-bold transition-opacity hover:opacity-80 active:opacity-60"
              style={{ background: SAGE, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', opacity: selected.length !== 4 ? 0.35 : 1 }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {gameOver && (
        <div className="flex flex-col pb-6" style={{ marginTop: 8 }}>
          {!won && (
            <div className="flex flex-col gap-2" style={{ padding: '0 16px', marginBottom: 10 }}>
              {groups.filter(g => !solved.find(s => s.category === g.category)).map(g => (
                <div key={g.category} className="w-full rounded-xl text-center" style={{ background: 'transparent', border: `2px solid ${COLOR_MAP[g.color]}`, padding: '19px' }}>
                  <div className="font-black uppercase tracking-wide text-white" style={{ fontSize: 15 }}>{g.category}</div>
                  <div className="text-white opacity-80" style={{ fontSize: 13, marginTop: 4 }}>{g.items.join(', ')}</div>
                </div>
              ))}
            </div>
          )}
          <ResultCard
            title="CONNECT"
            accent={SAGE}
            won={won}
            shareString={shareString}
            onPlayNext={() => setShowAuth(true)}
            nextLabel="Create free account"
            onLogin={() => setShowAuth(true)}
          />
        </div>
      )}

      </div>{/* end centered wrapper */}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
