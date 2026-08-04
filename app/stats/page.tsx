'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { todayUTC } from '@/lib/utils'

const GAMES = [
  { key: 'wordle',      label: 'Skate Word', accent: '#71A88A' },
  { key: 'connections', label: 'Connect',    accent: '#7E9ECC' },
]

interface Stats {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
}

export default function StatsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Record<string, Stats>>({})

  useEffect(() => {
    if (!user) return
    GAMES.forEach(async g => {
      const res = await fetch(`/api/results?game=${g.key}&limit=100`)
      const { results } = await res.json()
      const played = results.length
      const won = results.filter((r: { solved: boolean }) => r.solved).length

      // Compute streak from sorted results
      let streak = 0, maxStreak = 0, tmp = 0
      const sorted = [...results].sort((a: { publish_date: string }, b: { publish_date: string }) => a.publish_date > b.publish_date ? 1 : -1)
      let prev = ''
      for (const r of sorted) {
        if (r.solved) {
          const d = new Date(r.publish_date)
          const prevD = prev ? new Date(prev) : null
          if (!prevD || (d.getTime() - prevD.getTime()) === 86400000) {
            tmp++
          } else {
            tmp = 1
          }
          maxStreak = Math.max(maxStreak, tmp)
          if (r.publish_date === todayUTC() || r.publish_date === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            streak = tmp
          }
          prev = r.publish_date
        } else {
          tmp = 0
          prev = ''
        }
      }

      setStats(s => ({ ...s, [g.key]: { played, won, currentStreak: streak, maxStreak } }))
    })
  }, [user])

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-black mb-6">Your Stats</h1>
      {!user && (
        <p className="text-sm text-center" style={{ color: 'var(--text-dim)' }}>
          Log in to see your stats across devices.
        </p>
      )}
      {GAMES.map(g => {
        const s = stats[g.key]
        return (
          <div key={g.key} className="w-full rounded-2xl p-5 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold tracking-widest mb-4" style={{ color: g.accent }}>{g.label}</div>
            {s ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Played', val: s.played },
                  { label: 'Win %',  val: s.played ? Math.round(s.won / s.played * 100) : 0 },
                  { label: 'Streak', val: s.currentStreak },
                  { label: 'Best',   val: s.maxStreak },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="text-2xl font-black">{val}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>No games played yet</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
