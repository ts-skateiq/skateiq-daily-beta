'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { todayUTC } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import AuthModal from '@/components/AuthModal'

const GAMES = [
  {
    key: 'daily',
    label: 'DAILY CHALLENGE',
    desc: '3 tricks. Make or bail.',
    accent: '#71A88A',
    path: '/play/daily',
  },
]

type Status = 'pending' | 'won' | 'lost'

export default function HubPage() {
  const [completion, setCompletion] = useState<Record<string, Status>>({})
  const [showAuth, setShowAuth] = useState(false)
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null)
  const { user } = useAuth()
  const today = todayUTC()

  useEffect(() => {
    fetch('/api/daily-quote')
      .then(r => r.json())
      .then(d => { if (d.text) setQuote(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const stored: Record<string, Status> = {}
    GAMES.forEach(g => {
      const val = localStorage.getItem(`result_${g.key}_${today}`)
      stored[g.key] = val === 'won' || val === 'lost' ? val : 'pending'
    })
    setCompletion(stored)
  }, [today])

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: '#111111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Headline */}
      <h1 style={{
        fontFamily: 'var(--font-alumni), sans-serif',
        fontSize: 'clamp(64px, 18vw, 120px)',
        fontWeight: 700,
        lineHeight: 0.9,
        textAlign: 'center',
        letterSpacing: '0.01em',
        marginBottom: 20,
        textTransform: 'uppercase',
      }}>
        <span style={{ color: 'var(--text)' }}>TODAY&rsquo;S </span>
        <span style={{ color: 'var(--text)' }}>GAMES</span>
      </h1>

      {/* Daily quote */}
      {quote && (
        <div style={{ maxWidth: 400, width: '100%', margin: '0 0 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 4px' }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author && (
            <p style={{ fontSize: 12, color: '#ffffff', fontWeight: 600, margin: 0 }}>
              — {quote.author}
            </p>
          )}
        </div>
      )}

      {/* Date */}
      <p style={{ fontSize: 13, color: '#3a3a3a', textAlign: 'center', marginBottom: 52 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Game cards */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GAMES.map(g => {
          const status = completion[g.key] ?? 'pending'
          const done = status === 'won' || status === 'lost'
          return (
            <Link
              key={g.key}
              href={g.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                borderRadius: 14,
                padding: '20px 24px',
                textDecoration: 'none',
                opacity: 1,
                transition: 'opacity 0.15s',
                border: `1px solid ${g.accent}`,
              }}
            >
              <div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: g.accent,
                  marginBottom: 5,
                }}>
                  {g.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>{g.desc}</div>
              </div>
              <div style={{
                fontSize: 36,
                color: status === 'won' ? g.accent : status === 'lost' ? '#CB8D82' : '#4a4a4a',
                fontWeight: 600,
              }}>
                {status === 'won' ? '✓' : status === 'lost' ? '✗' : '›'}
              </div>
            </Link>
          )
        })}
      </div>

      {!user && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 36, width: '100%', maxWidth: 360 }}>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              width: '100%',
              maxWidth: 320,
              background: '#ffffff',
              color: '#0d0e0d',
              border: 'none',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            Create free account
          </button>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              color: '#fff',
              fontWeight: 500,
            }}
          >
            Already registered? <span style={{ fontWeight: 700 }}>Log in</span>
          </button>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <a
        href="http://localhost:3001/admin.html"
        style={{
          marginTop: 48,
          fontSize: 12,
          color: '#71A88A',
          textDecoration: 'none',
          opacity: 0.6,
        }}
      >
        Admin
      </a>
    </div>
  )
}
