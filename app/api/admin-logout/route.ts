import { NextRequest, NextResponse } from 'next/server'
import { sessions } from '@/lib/admin-sessions'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (token) sessions.delete(token)
  return NextResponse.json({ ok: true })
}
