import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { todayUTC } from '@/lib/utils'

// Fallback puzzles when Supabase isn't configured
const FALLBACKS: Record<string, object> = {
  wordle: { word: 'SKATE', hint: 'The foundation of it all' },
  connections: {
    groups: [
      { category: 'FLIP TRICKS',  color: 'yellow', items: ['KICKFLIP','HEELFLIP','HARDFLIP','INWARD'] },
      { category: 'GRINDS',       color: 'green',  items: ['NOSEGRIND','TAILSLIDE','FEEBLE','CROOKED'] },
      { category: 'GRABS',        color: 'blue',   items: ['MELON','INDY','STALEFISH','MUTE'] },
      { category: 'STANCES',      color: 'purple', items: ['REGULAR','GOOFY','FAKIE','SWITCH'] },
    ]
  },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game') ?? 'wordle'
  const date = searchParams.get('date') ?? todayUTC()

  // Block future puzzle payloads
  if (date > todayUTC()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('game_key', game)
      .eq('publish_date', date)
      .single()

    if (error || !data) throw error

    return NextResponse.json(data)
  } catch {
    // Return fallback for local dev without Supabase
    return NextResponse.json({
      id: `fallback-${game}-${date}`,
      game_key: game,
      publish_date: date,
      payload: FALLBACKS[game] ?? {},
      difficulty: 'medium',
    })
  }
}
