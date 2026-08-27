'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface Entry {
  user_id: string
  makes: number
  total: number
  username: string
  streak: number
  dots: string
  created_at: string
}

const MOCK_ENTRIES: Entry[] = [
  { user_id: 'mock-1', makes: 1, total: 1, username: 'rileyk',   streak: 14, dots: '🟢', created_at: '' },
  { user_id: 'mock-2', makes: 1, total: 1, username: 'jakemoss', streak: 7,  dots: '🟢', created_at: '' },
  { user_id: 'mock-3', makes: 1, total: 1, username: 'carsonb',  streak: 21, dots: '🟢', created_at: '' },
  { user_id: 'mock-4', makes: 0, total: 1, username: 'taylors',  streak: 3,  dots: '🔴', created_at: '' },
  { user_id: 'mock-5', makes: 0, total: 1, username: 'devonm',   streak: 5,  dots: '🔴', created_at: '' },
]

function getMedalEmoji(makes: number, total: number): string | null {
  if (makes === total) return '🥇'
  if (makes === 0) return total === 1 ? '🥉' : null
  if (total === 2) return '🥈'
  if (total === 3) return makes >= 2 ? '🥈' : '🥉'
  if (total === 4) return makes >= 3 ? '🥈' : '🥉'
  if (total === 5) return makes >= 3 ? '🥈' : '🥉'
  return makes / total >= 0.6 ? '🥈' : '🥉'
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayUTC())
  const [entries, setEntries] = useState<Entry[]>([])
  const today = todayUTC()

  useEffect(() => {
    fetch(`/api/leaderboard?date=${date}`)
      .then(r => r.json())
      .then(d => { if (d.entries?.length > 0) setEntries(d.entries) })
      .catch(() => {})
  }, [date])

  const myUsername = user?.email?.split('@')[0].toLowerCase() ?? null
  const displayEntries = entries.length > 0 ? entries : MOCK_ENTRIES

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 0 48px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Page heading */}
      <div style={{ width: '100%', maxWidth: 480, padding: '20px 20px 0' }}>
        <div style={{ fontFamily: 'var(--font-alumni), sans-serif', fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1, color: 'var(--text)' }}>
          Leaderboard
        </div>
      </div>

      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        padding: '16px 20px 16px',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 10,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <button
            onClick={() => setDate(d => shiftDate(d, -1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, padding: '4px 8px', lineHeight: 1 }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>
              {formatDate(date)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {`${displayEntries.length} player${displayEntries.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          <button
            onClick={() => setDate(d => shiftDate(d, 1))}
            disabled={date >= today}
            style={{ background: 'none', border: 'none', cursor: date >= today ? 'default' : 'pointer', color: date >= today ? 'var(--border)' : 'var(--text-muted)', fontSize: 20, padding: '4px 8px', lineHeight: 1 }}
          >
            →
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ width: '100%', maxWidth: 480, padding: '0 16px', marginTop: 8 }}>
        {displayEntries.map((entry, i) => {
            const isMe = entry.username === myUsername
            const medal = getMedalEmoji(entry.makes, entry.total)

            return (
              <div
                key={entry.user_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 4px',
                  borderBottom: '1px solid var(--border)',
                  background: isMe ? 'rgba(113,168,138,0.06)' : 'transparent',
                  borderRadius: isMe ? 8 : 0,
                }}
              >
                {/* Username + Medal */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  overflow: 'hidden',
                  justifyContent: 'flex-start',
                }}>
                  <span style={{
                    fontSize: 15,
                    fontWeight: isMe ? 700 : 500,
                    color: isMe ? '#71A88A' : 'var(--text)',
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.username}
                  </span>
                  {isMe && <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#71A88A', fontWeight: 600 }}>you</span>}
                </div>

                {/* Status */}
                <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0, color: entry.makes > 0 ? '#71A88A' : '#CB8D82' }}>
                  {entry.makes > 0 ? '✅ Completed' : '❌ Incomplete'}
                </div>

                {/* Streak */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                  {entry.streak > 0 && (
                    <>
                      <span style={{ fontSize: 14 }}>🔥</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#4A8FD9' }}>{entry.streak}</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}

      </div>

      {!user && (
        <div style={{ marginTop: 32, textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Sign in to appear on the leaderboard
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            background: '#ffffff',
            color: '#0d0e0d',
            borderRadius: 999,
            padding: '10px 28px',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}
