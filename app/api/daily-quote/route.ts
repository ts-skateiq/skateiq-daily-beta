import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'public', 'quotes.json')
const EPOCH = new Date('2026-07-31').getTime()

export async function GET() {
  const all = fs.existsSync(FILE)
    ? (JSON.parse(fs.readFileSync(FILE, 'utf8')) as { text: string; author: string }[]).filter(q => q.text?.trim())
    : []
  if (!all.length) return NextResponse.json({ text: '', author: '' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const idx = Math.floor((today.getTime() - EPOCH) / 86400000)
  return NextResponse.json(all[((idx % all.length) + all.length) % all.length])
}
