'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  sendOTP: (email: string) => Promise<{ error?: string }>
  verifyOTP: (email: string, token: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadUser = useCallback(async (id: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setUser(data as User)
  }, [supabase])

  const refreshUser = useCallback(async () => {
    if (!supabase) return
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) await loadUser(authUser.id)
  }, [supabase, loadUser])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user.id)
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadUser])

  const sendOTP = async (email: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    })
    return { error: error?.message }
  }

  const verifyOTP = async (email: string, token: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.verifyOtp({
      email, token, type: 'email'
    })
    if (!error) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase.from('users').upsert({
          id: authUser.id,
          email: authUser.email!,
        }, { onConflict: 'id', ignoreDuplicates: true })
        await loadUser(authUser.id)
      }
    }
    return { error: error?.message }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
