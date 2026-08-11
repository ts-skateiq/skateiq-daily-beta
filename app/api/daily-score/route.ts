import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function computeStreak(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data } = await supabase
    .from('daily_scores')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (!data || data.length === 0) return 0

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const mostRecent = new Date(data[0].date + 'T00:00:00Z')
  const diffDays = Math.floor((today.getTime() - mostRecent.getTime()) / 86400000)
  if (diffDays > 1) return 0

  const dateSet = new Set(data.map((r: { date: string }) => r.date))
  let streak = 0
  const checkDate = new Date(diffDays === 1 ? mostRecent : today)

  for (let i = 0; i <= data.length; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dateSet.has(dateStr)) {
      streak++
      checkDate.setUTCDate(checkDate.getUTCDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export async function POST(req: NextRequest) {
  try {
    const { makes, total, dots } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('email').eq('id', user.id).single()
    const username = (profile?.email ?? user.email ?? '').split('@')[0].toLowerCase()
    const today = new Date().toISOString().split('T')[0]

    // Upsert score first so streak count includes today
    await supabase.from('daily_scores').upsert({
      user_id: user.id,
      date: today,
      makes,
      total,
      username,
      dots: dots ?? '',
      streak: 0,
    }, { onConflict: 'user_id,date' })

    const streak = await computeStreak(supabase, user.id)

    const { error } = await supabase
      .from('daily_scores')
      .update({ streak })
      .eq('user_id', user.id)
      .eq('date', today)

    if (error) throw error
    return NextResponse.json({ ok: true, streak })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ streak: 0 })
    const streak = await computeStreak(supabase, user.id)
    return NextResponse.json({ streak })
  } catch {
    return NextResponse.json({ streak: 0 })
  }
}
