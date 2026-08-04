'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { isPaidUser } from '@/lib/utils'
import { Suspense } from 'react'

function AccountContent() {
  const { user, signOut, refreshUser } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('success')) refreshUser()
  }, [params, refreshUser])

  if (!user) {
    router.push('/')
    return null
  }

  const paid = isPaidUser(user.subscription_status)

  const handlePortal = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
  }

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-black mb-6">Account</h1>

      <div className="w-full rounded-2xl p-5 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>EMAIL</div>
        <div className="text-sm mb-4">{user.email}</div>
        <div className="text-xs font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>PLAN</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: paid ? 'var(--gold)' : 'var(--text)' }}>
            {paid ? 'Skate IQ Pro' : 'Free'}
          </span>
          {user.subscription_status === 'trialing' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>Trial</span>
          )}
        </div>
      </div>

      {paid ? (
        <button
          onClick={handlePortal}
          className="w-full py-3 rounded-full border text-sm font-bold mb-3 transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Manage subscription
        </button>
      ) : (
        <button
          onClick={handleUpgrade}
          className="w-full py-3 rounded-full text-sm font-bold mb-3 transition-opacity hover:opacity-80"
          style={{ background: 'var(--gold)', color: '#0a0a0a' }}
        >
          Upgrade to Pro — $4.99/mo
        </button>
      )}

      <button
        onClick={() => { signOut(); router.push('/') }}
        className="w-full py-3 rounded-full border text-sm font-bold transition-opacity hover:opacity-80"
        style={{ borderColor: 'var(--border)', color: 'var(--clay)' }}
      >
        Log out
      </button>
    </div>
  )
}

export default function AccountPage() {
  return <Suspense><AccountContent /></Suspense>
}
