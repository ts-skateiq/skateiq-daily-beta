'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  reason?: 'save-streak' | 'gate'
}

export default function AuthModal({ onClose }: Props) {
  const { sendOTP, verifyOTP } = useAuth()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await sendOTP(email)
    setLoading(false)
    if (error) { setError(error); return }
    setStep('code')
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await verifyOTP(email, code)
    setLoading(false)
    if (error) { setError(error); return }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}>
      <div style={{ width: '100%', maxWidth: 480, borderRadius: 16, padding: '40px 32px', position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {step === 'email' ? (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 28, lineHeight: 1.2 }}>
              Log in or create an account
            </h2>

            <form onSubmit={handleSendOTP}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8,
                  background: 'var(--surface-2)', border: '1.5px solid var(--border)',
                  color: 'var(--text)', outline: 'none', marginBottom: 12, boxSizing: 'border-box',
                }}
              />
              {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 10 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 8,
                  background: 'var(--text)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
                  opacity: loading ? 0.5 : 1, marginBottom: 20,
                }}
              >
                {loading ? 'Sending…' : 'Continue'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              By continuing, you agree to the{' '}
              <a href="/terms-of-sale" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Terms of Sale</a>,{' '}
              <a href="/terms" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Terms of Service</a>, and{' '}
              <a href="/privacy" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Privacy Policy</a>.
            </p>

            <button
              style={{
                width: '100%', padding: '13px 16px', fontSize: 15, fontWeight: 600, borderRadius: 8,
                background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, marginBottom: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              style={{
                width: '100%', padding: '13px 16px', fontSize: 15, fontWeight: 600, borderRadius: 8,
                background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, marginBottom: 16,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.36.74 3.18.79 1.21-.24 2.36-.93 3.65-.84 1.56.13 2.74.72 3.51 1.87-3.24 1.94-2.48 5.89.47 7.02-.55 1.54-1.28 3.06-2.81 4.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

          </>
        ) : (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>

            <form onSubmit={handleVerify}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 22, fontFamily: 'monospace',
                  letterSpacing: '0.3em', textAlign: 'center', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1.5px solid var(--border)',
                  color: 'var(--text)', outline: 'none', marginBottom: 12, boxSizing: 'border-box',
                }}
              />
              {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 10 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 8,
                  background: 'var(--text)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
                  opacity: (loading || code.length !== 6) ? 0.4 : 1, marginBottom: 12,
                }}
              >
                {loading ? 'Verifying…' : 'Log in'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
              >
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
