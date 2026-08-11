'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import AuthModal from './AuthModal'
import { X, Lightbulb, BarChart2, HelpCircle } from 'lucide-react'

interface GameToolbarProps {
  gameName: string
  accent?: string
  hint?: string
  showLightbulb?: boolean
  onLightbulb?: () => void
  howToPlay?: React.ReactNode
}

export default function GameToolbar({
  gameName,
  accent = '#71A88A',
  hint,
  showLightbulb,
  onLightbulb,
  howToPlay,
}: GameToolbarProps) {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState<{ streak: number; gold: number; silver: number; bronze: number } | null>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/daily-score')
      .then(r => r.json())
      .then(d => setStats({ streak: d.streak ?? 0, gold: d.gold ?? 0, silver: d.silver ?? 0, bronze: d.bronze ?? 0 }))
      .catch(() => setStats({ streak: 0, gold: 0, silver: 0, bronze: 0 }))
  }, [user])

  const iconBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
  }

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: 52,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        gap: 2,
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ ...iconBtn, flexDirection: 'column', gap: 5, marginRight: 4 }}
        >
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)', marginRight: 4 }} />

        {/* Icon buttons */}
        {showLightbulb && (
          <button onClick={onLightbulb} aria-label="Hint" style={iconBtn}>
            <Lightbulb size={18} />
          </button>
        )}

        <button aria-label="Stats" style={iconBtn} onClick={() => setShowStats(true)}>
          <BarChart2 size={18} />
        </button>

        {howToPlay && (
          <button onClick={() => setShowHowTo(true)} aria-label="How to play" style={iconBtn}>
            <HelpCircle size={18} />
          </button>
        )}


        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Auth CTA */}
        {user ? (
          <button
            onClick={() => signOut()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}
          >
            Log out
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '5px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}
          >
            Log in
          </button>
        )}
      </header>

      {/* Hint subtitle */}
      {hint && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', padding: '5px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {hint}
        </div>
      )}

      {/* Nav drawer */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
          <nav style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
            background: 'var(--bg)', borderRight: '1px solid var(--border)',
            zIndex: 50, display: 'flex', flexDirection: 'column', padding: '20px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 20px' }}>
              <img src="/skateiq-logo.png" alt="Skate IQ" style={{ height: 32, width: 'auto' }} />
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/play/daily', label: 'Daily Challenge' },
                { href: '/leaderboard', label: "Today's Leaderboard" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '14px 24px', fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', letterSpacing: '0.02em' }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              {[
                { href: '/subscribe', label: 'Subscribe' },
                { href: 'https://skateiq.com/collections/training-programs', label: 'Shop' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '14px 24px', fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', letterSpacing: '0.02em' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}

      {/* How to play modal */}
      {showHowTo && howToPlay && (
        <>
          <div onClick={() => setShowHowTo(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 24, width: 'min(340px, 90vw)', zIndex: 50,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: '#71A88A' }}>HOW TO PLAY</h2>
              <button onClick={() => setShowHowTo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            {howToPlay}
          </div>
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Stats popup */}
      {showStats && (
        <>
          <div onClick={() => setShowStats(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 24, width: 'min(280px, 90vw)', zIndex: 50,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: '#71A88A' }}>STATS</h2>
              <button onClick={() => setShowStats(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            {!user ? (
              <div style={{ marginTop: 4, paddingTop: 16, textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-muted)' }}>Create account to track your progress</p>
                <button
                  onClick={() => { setShowStats(false); setShowAuth(true) }}
                  style={{ background: '#ffffff', color: '#0d0e0d', border: 'none', borderRadius: 999, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Sign in
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.08em', marginBottom: 4 }}>CURRENT STREAK</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#4A8FD9' }}>🔥{stats?.streak ?? 0}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginBottom: 16 }} />
                {[
                  { emoji: '🥇', value: stats?.gold ?? 0, color: '#C9A84C' },
                  { emoji: '🥈', value: stats?.silver ?? 0, color: '#A0A9B8' },
                  { emoji: '🥉', value: stats?.bronze ?? 0, color: '#A0694A' },
                ].map(({ emoji, value, color }) => (
                  <div key={emoji} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{emoji}</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color, minWidth: 32 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
