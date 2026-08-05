import { NextResponse } from 'next/server'

const GAME_URL = 'https://daily-skate-challenge-beta-production.up.railway.app'

export async function GET() {
  try {
    const res = await fetch(`${GAME_URL}/api/daily-quote`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ text: '', author: '' })
  }
}
