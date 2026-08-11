import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sessions } from '@/lib/admin-sessions'

const FILE = path.join(process.cwd(), 'public', 'quotes.json')

function load() {
  if (!fs.existsSync(FILE)) return []
  return JSON.parse(fs.readFileSync(FILE, 'utf8'))
}

export async function GET() {
  return NextResponse.json(load())
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token || !sessions.has(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  if (!Array.isArray(body)) return NextResponse.json({ error: 'expected array' }, { status: 400 })
  fs.writeFileSync(FILE, JSON.stringify(body, null, 2))
  return NextResponse.json({ ok: true })
}
