'use client'

import { useEffect, useState } from 'react'
import GameToolbar from '@/components/GameToolbar'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/lib/auth-context'

const DAILY_URL = ''

export default function DailyGamePage() {
  const [height, setHeight] = useState('100vh')
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useAuth()

  const howToPlay = (
    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li style={{ marginBottom: 8 }}><strong>Set a timer.</strong> Perform the prescribed drill for 10 minutes.</li>
        <li style={{ marginBottom: 8 }}><strong>Keep your own score.</strong> This is on the honor system.</li>
        <li style={{ marginBottom: 8 }}><strong>Don't cheat.</strong> You're only cheating yourself.</li>
      </ul>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: '#71A88A' }}>SCORING</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #71A88A', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71A88A', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="4,12 9,18 20,6"/></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#71A88A' }}>Completed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #CB8D82', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CB8D82', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" width="16" height="16"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#CB8D82' }}>Incomplete</span>
          </div>
        </div>
        <div style={{ paddingBottom: 16 }} />
      </div>
      <div style={{ marginTop: 0, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: '#71A88A' }}>STREAKS</h2>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
          <li style={{ marginBottom: 8 }}><strong>Daily streak.</strong> Complete the drill every day to keep it going.</li>
          <li><strong>Weekly streak.</strong> Complete at least 3 days in a week to count that week.</li>
        </ul>
        <div style={{ paddingBottom: 16 }} />
      </div>
      {!user && (
        <div style={{ marginTop: 0, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-muted)' }}>Create an account to track your progress</p>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: '#ffffff',
              color: '#0d0e0d',
              border: 'none',
              borderRadius: 999,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  )

  useEffect(() => {
    const update = () => { setHeight(`${window.innerHeight - 52}px`) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === 'open-auth') setShowAuth(true)
      if (e.data?.type === 'daily-complete' && user) {
        fetch('/api/daily-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ makes: e.data.makes, total: e.data.total }),
        })
          .then(r => r.json())
          .then(d => {
            const iframe = document.querySelector('iframe')
            iframe?.contentWindow?.postMessage({ type: 'streak-update', streak: d.streak ?? 0 }, '*')
          })
          .catch(() => {})
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [user])

  return (
    <div className="flex flex-col w-full">
      <GameToolbar gameName="Daily Challenge" howToPlay={howToPlay} />
      <iframe
        src="/game.html?view=round"
        style={{ width: '100%', height, border: 'none', display: 'block' }}
        title="Daily Challenge"
        allow="accelerometer; autoplay; clipboard-write"
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
