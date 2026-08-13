'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import AuthModal from './AuthModal'
import { X } from 'lucide-react'

const GAME_ROUTES = ['/play/wordle/game', '/play/connections/game', '/play/daily/game']

export default function TopBar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (GAME_ROUTES.some(r => pathname === r)) return null

  return (
    <>
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 20px',
        height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5, color: 'var(--text)' }}
        >
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text)', borderRadius: 2 }} />
        </button>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/skateiq-logo.png" alt="Skate IQ" style={{ height: 36, width: 'auto', display: 'block' }} />
        </Link>

        {/* Log in / user */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {user ? (
            <button
              onClick={() => signOut()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--sage)', fontWeight: 600 }}
            >
              Log out
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#ffffff', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              Log in
            </button>
          )}
        </div>
      </header>

      {/* Slide-out nav menu */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
          <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: 260,
            background: 'var(--bg)',
            borderRight: '1px solid var(--border)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 0',
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
                { href: '/how-scoring-works', label: 'How Scoring Works' },
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
                { href: 'https://skateiq.com/collections/training-programs', label: 'Learn' },
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

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
