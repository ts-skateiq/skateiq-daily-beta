'use client'

import { useEffect, useState } from 'react'
import GameToolbar from '@/components/GameToolbar'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/lib/auth-context'

const DAILY_URL = 'https://daily-skate-challenge-beta-production.up.railway.app'

export default function DailyGamePage() {
  const [height, setHeight] = useState('100vh')
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useAuth()

  const howToPlay = (
    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li style={{ marginBottom: 8 }}><strong>Unlimited attempts.</strong> Try each trick as many times as you like.</li>
        <li style={{ marginBottom: 8 }}><strong>Keep your own score.</strong> This is on the honor system.</li>
        <li>A new challenge is released daily at midnight UTC.</li>
      </ul>
      {!user && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
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
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className="flex flex-col w-full">
      <GameToolbar gameName="Daily Challenge" howToPlay={howToPlay} />
      <iframe
        src={`${DAILY_URL}?view=round`}
        style={{ width: '100%', height, border: 'none', display: 'block' }}
        title="Daily Challenge"
        allow="accelerometer; autoplay; clipboard-write"
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
