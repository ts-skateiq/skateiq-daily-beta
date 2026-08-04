'use client'

import { useEffect, useState } from 'react'
import GameToolbar from '@/components/GameToolbar'
import AuthModal from '@/components/AuthModal'

const DAILY_URL = process.env.NEXT_PUBLIC_DAILY_CHALLENGE_URL ?? 'http://localhost:3001'

const howToPlay = (
  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
    <p style={{ marginTop: 0 }}><strong>3 skills or tricks.</strong> Same 3 for everyone, no matter your level.</p>
    <p>Unlimited attempts. Try each trick as many times as you like.</p>
    <p>Keep your own score. This is on the honor system.</p>
    <p style={{ marginBottom: 0 }}>A new challenge is released daily at midnight PST.</p>
  </div>
)

export default function DailyGamePage() {
  const [height, setHeight] = useState('100vh')
  const [showAuth, setShowAuth] = useState(false)

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
