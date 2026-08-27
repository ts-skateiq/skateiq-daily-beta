import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getMondayKey(d: Date): string {
  const dow = d.getUTCDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const mon = new Date(d)
  mon.setUTCDate(d.getUTCDate() + diff)
  return mon.toISOString().split('T')[0]
}

async function computeWeeklyStreak(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data } = await supabase
    .from('daily_scores')
    .select('date')
    .eq('user_id', userId)

  if (!data || data.length === 0) return 0

  const weekCounts = new Map<string, number>()
  for (const row of data) {
    const key = getMondayKey(new Date(row.date + 'T00:00:00Z'))
    weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1)
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  let weekStart = new Date(today)
  weekStart.setUTCDate(today.getUTCDate() + (today.getUTCDay() === 0 ? -6 : 1 - today.getUTCDay()))

  let streak = 0
  let first = true
  for (let i = 0; i < 500; i++) {
    const key = weekStart.toISOString().split('T')[0]
    const count = weekCounts.get(key) ?? 0
    if (count >= 3) {
      streak++
    } else if (first) {
      // current week in progress, skip to previous
    } else {
      break
    }
    first = false
    weekStart = new Date(weekStart)
    weekStart.setUTCDate(weekStart.getUTCDate() - 7)
  }

  return streak
}

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

    // If already submitted today, return locked score
    const { data: existing } = await supabase
      .from('daily_scores')
      .select('streak')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing) {
      return NextResponse.json({ ok: true, streak: existing.streak, locked: true })
    }

    await supabase.from('daily_scores').insert({
      user_id: user.id,
      date: today,
      makes,
      total,
      username,
      dots: dots ?? '',
      streak: 0,
    })

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

function getMedalType(makes: number, total: number): 'gold' | 'silver' | 'bronze' | null {
  if (makes === total) return 'gold'
  if (makes === 0) return total === 1 ? 'bronze' : null
  if (total === 2) return 'silver'
  if (total === 3) return makes >= 2 ? 'silver' : 'bronze'
  if (total === 4) return makes >= 3 ? 'silver' : 'bronze'
  if (total === 5) return makes >= 3 ? 'silver' : 'bronze'
  return makes / total >= 0.6 ? 'silver' : 'bronze'
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ streak: 0, gold: 0, silver: 0, bronze: 0 })

    const [streak, weeklyStreak, { data: scores }] = await Promise.all([
      computeStreak(supabase, user.id),
      computeWeeklyStreak(supabase, user.id),
      supabase.from('daily_scores').select('makes, total').eq('user_id', user.id),
    ])

    let gold = 0, silver = 0, bronze = 0
    for (const s of scores ?? []) {
      const m = getMedalType(s.makes, s.total)
      if (m === 'gold') gold++
      else if (m === 'silver') silver++
      else if (m === 'bronze') bronze++
    }

    return NextResponse.json({ streak, weeklyStreak, gold, silver, bronze })
  } catch {
    return NextResponse.json({ streak: 0, gold: 0, silver: 0, bronze: 0 })
  }
}
