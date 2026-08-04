'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface Props {
  feature?: string
}

export default function Paywall({ feature = 'this feature' }: Props) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gold-dim)' }}>
        <Lock size={20} style={{ color: 'var(--gold)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2">Unlock {feature}</h2>
      <p className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
        Get full archive access, detailed stats, leaderboards, and more.
      </p>
      <p className="text-2xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
        $4.99<span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>/mo</span>
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>7-day free trial · Cancel anytime</p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-3 rounded-full font-bold text-sm transition-opacity hover:opacity-80"
        style={{ background: 'var(--gold)', color: '#0a0a0a', opacity: loading ? 0.5 : 1 }}
      >
        {loading ? 'Loading…' : 'Start free trial'}
      </button>
    </div>
  )
}
