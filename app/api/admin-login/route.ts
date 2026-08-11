import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sessions } from '@/lib/admin-sessions'

const ADMIN_EMAIL_1 = (process.env.ADMIN_EMAIL_1 || '').toLowerCase()
const ADMIN_EMAIL_2 = (process.env.ADMIN_EMAIL_2 || '').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

const USERS: Record<string, string> = {
  [ADMIN_EMAIL_1]: ADMIN_PASSWORD,
  [ADMIN_EMAIL_2]: ADMIN_PASSWORD,
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const key = (email || '').toLowerCase()
  if (!USERS[key] || USERS[key] !== password) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, key)
  return NextResponse.json({ token })
}
