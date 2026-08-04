import { NextResponse } from 'next/server'

const GAME_URL = process.env.NEXT_PUBLIC_DAILY_CHALLENGE_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${GAME_URL}/api/daily-quote`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ text: '', author: '' })
  }
}
