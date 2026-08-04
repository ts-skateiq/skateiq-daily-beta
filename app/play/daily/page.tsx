'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { todayUTC } from '@/lib/utils'

const ACCENT = '#71A88A'
const MUTED = '#8b908a'

export default function DailyLanding() {
  const [played, setPlayed] = useState(false)

  useEffect(() => {
    const val = localStorage.getItem(`result_daily_${todayUTC()}`)
    setPlayed(val === 'won' || val === 'lost')
  }, [])

  return (
    <div style={{
      minHeight: 'calc(100svh - 56px)',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
      }}>
      <h1 style={{
        fontFamily: 'var(--font-alumni), sans-serif',
        fontSize: 'clamp(48px, 10vw, 96px)',
        fontWeight: 700,
        lineHeight: 1,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        width: '100%',
        margin: 0,
      }}>
        <span style={{ color: 'var(--text)' }}>DAILY </span>
        <span style={{ color: 'var(--text)' }}>CHALLENGE</span>
      </h1>

      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.5, margin: 0 }}>
        3 tricks. Make or bail.
      </p>

      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <Link
          href="/subscribe"
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1.5px solid ${ACCENT}`, color: ACCENT, fontWeight: 600, fontSize: 14, padding: '12px 8px', borderRadius: 999, textDecoration: 'none' }}
        >
          Subscribe
        </Link>
        <Link
          href="/login"
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1.5px solid ${ACCENT}`, color: ACCENT, fontWeight: 600, fontSize: 14, padding: '12px 8px', borderRadius: 999, textDecoration: 'none' }}
        >
          Log in
        </Link>
        <Link
          href="/play/daily/game"
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: ACCENT, color: '#0d0e0d', fontWeight: 600, fontSize: 14, padding: '12px 8px', borderRadius: 999, textDecoration: 'none' }}
        >
          {played ? 'Results' : 'Start'}
        </Link>
      </div>
      </div>
    </div>
  )
}
