import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { puzzle_id, game_key, publish_date, solved, guesses_used, time_ms } = body

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const { error } = await supabase.from('results').upsert({
      user_id: user.id,
      puzzle_id,
      game_key,
      publish_date,
      solved,
      guesses_used,
      time_ms,
    }, { onConflict: 'user_id,puzzle_id' })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game')
  const limit = parseInt(searchParams.get('limit') ?? '30')

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ results: [] })

    let query = supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (game) query = query.eq('game_key', game)

    const { data } = await query
    return NextResponse.json({ results: data ?? [] })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
