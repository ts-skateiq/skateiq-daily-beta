'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { todayUTC } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import AuthModal from '@/components/AuthModal'

const GAMES = [
  {
    key: 'daily',
    label: 'GET STARTED',
    desc: '',
    accent: '#71A88A',
    path: '/play/daily',
  },
]

type Status = 'pending' | 'won' | 'lost'

export default function HubPage() {
  const [completion, setCompletion] = useState<Record<string, Status>>({})
  const [showAuth, setShowAuth] = useState(false)
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const { user } = useAuth()
  const today = todayUTC()

  useEffect(() => {
    if (user) {
      fetch('/api/daily-score')
        .then(r => r.json())
        .then(d => setStreak(d.streak ?? 0))
        .catch(() => {})
    } else {
      setStreak(0)
    }
  }, [user])

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
        fontSize: 'clamp(24px, 8vw, 85px)',
        whiteSpace: 'nowrap',
        fontWeight: 700,
        lineHeight: 0.9,
        textAlign: 'center',
        letterSpacing: '0.01em',
        marginBottom: 20,
        textTransform: 'uppercase',
      }}>
        <span style={{ color: 'var(--text)' }}>DAILY </span>
        <span style={{ color: 'var(--text)' }}>CHALLENGE</span>
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
                justifyContent: 'center',
                position: 'relative',
                background: 'var(--surface)',
                borderRadius: 999,
                width: 320,
                height: 50.5,
                boxSizing: 'border-box',
                padding: 0,
                margin: '0 auto',
                textDecoration: 'none',
                opacity: 1,
                transition: 'opacity 0.15s',
                border: `1px solid ${g.accent}`,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: g.accent,
                }}>
                  {g.label}
                </div>
              </div>
              <div style={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-60%)',
                fontSize: 45,
                color: status === 'won' ? g.accent : status === 'lost' ? '#CB8D82' : '#71A88A',
                fontWeight: 600,
                lineHeight: 1,
              }}>
                {status === 'won' ? '✓' : status === 'lost' ? '✗' : '›'}
              </div>
            </Link>
          )
        })}
      </div>

      {user && streak > 0 && (
        <div style={{
          marginTop: 16,
          fontSize: 13,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span><strong style={{ color: 'var(--text)' }}>{streak}</strong> day streak</span>
        </div>
      )}

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
        href="/admin.html"
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
