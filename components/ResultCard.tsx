'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface Props {
  title: string
  accent: string
  won: boolean
  guessesUsed?: number
  maxGuesses?: number
  shareString: string
  onPlayNext?: () => void
  nextLabel?: string
  onLogin?: () => void
  children?: React.ReactNode
}

export default function ResultCard({
  title, accent, won, guessesUsed, maxGuesses,
  shareString, onPlayNext, nextLabel, onLogin, children
}: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = shareString
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-bounce-in w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {children && <div className="mb-3" style={{ width: '100%', maxWidth: 320 }}>{children}</div>}

      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-1.5 rounded-full font-semibold transition-opacity hover:opacity-88 active:opacity-75 mb-3"
        style={{ background: accent, color: '#0d0e0d', fontSize: 15, padding: '14px 28px', width: '100%', maxWidth: 320, marginBottom: 10 }}
      >
        {copied ? 'Copied!' : 'Share'}
        {copied ? <Check size={16} /> : <Share2 size={16} />}
      </button>

      {onPlayNext && (
        <button
          onClick={onPlayNext}
          className="flex items-center justify-center rounded-full font-semibold transition-opacity hover:opacity-75 active:opacity-60"
          style={{ background: '#ffffff', border: 'none', color: '#0d0e0d', fontSize: 15, padding: '14px 28px', width: '100%', maxWidth: 320, boxSizing: 'border-box' }}
        >
          {nextLabel ?? 'Next game →'}
        </button>
      )}

      {onLogin && (
        <p style={{ fontSize: 15, color: 'var(--text)', marginTop: 12, textAlign: 'center' }}>
          Already registered?{' '}
          <button
            onClick={onLogin}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text)', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
          >
            Log in
          </button>
        </p>
      )}
    </div>
  )
}
