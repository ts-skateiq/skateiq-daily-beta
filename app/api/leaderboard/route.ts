import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('daily_scores')
      .select('user_id, makes, total, username, created_at')
      .eq('date', date)
      .order('makes', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    const sorted = (data ?? []).sort((a, b) => {
      const ratioA = a.makes / a.total
      const ratioB = b.makes / b.total
      if (ratioB !== ratioA) return ratioB - ratioA
      if (b.makes !== a.makes) return b.makes - a.makes
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    return NextResponse.json({ entries: sorted, count: sorted.length })
  } catch {
    return NextResponse.json({ entries: [], count: 0 })
  }
}
