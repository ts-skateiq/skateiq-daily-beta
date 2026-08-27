'use client'

import { useAuth } from '@/lib/auth-context'
import Paywall from '@/components/Paywall'
import { isPaidUser } from '@/lib/utils'
import Link from 'next/link'

export default function ArchivePage() {
  const { user } = useAuth()

  if (!user || !isPaidUser(user.subscription_status)) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="opacity-20 pointer-events-none mb-6 w-full max-w-sm">
          <div className="rounded-xl p-4 mb-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="h-4 w-24 rounded mb-2" style={{ background: 'var(--surface-2)' }} />
            <div className="h-3 w-full rounded mb-1" style={{ background: 'var(--surface-2)' }} />
            <div className="h-3 w-3/4 rounded" style={{ background: 'var(--surface-2)' }} />
          </div>
        </div>
        <Paywall feature="the puzzle archive" />
      </div>
    )
  }

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">
      <h1 style={{ fontFamily: 'var(--font-alumni), sans-serif', fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: 24, color: 'var(--text)' }}>Archive</h1>
      <div className="w-full flex flex-col gap-2">
        {days.map(date => (
          <div key={date} className="flex gap-2">
            <Link
              href={`/play/wordle?date=${date}`}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#71A88A' }}
            >
              Word — {date}
            </Link>
            <Link
              href={`/play/connections?date=${date}`}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#7E9ECC' }}
            >
              Connect — {date}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
