import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://a.klaviyo.com/api'

export async function POST(req: NextRequest) {
  const key = process.env.KLAVIYO_API_KEY
  if (!key) return NextResponse.json({ ok: true }) // No-op in dev

  const body = await req.json()
  const { email, marketing_consent, current_streak, games_played, subscription_status, event } = body

  try {
    // Upsert profile
    await fetch(`${BASE}/profiles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${key}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            properties: {
              source: 'skate_iq_games',
              current_streak: current_streak ?? 0,
              games_played: games_played ?? 0,
              subscription_status: subscription_status ?? 'free',
            },
            ...(marketing_consent !== undefined && {
              subscriptions: {
                email: { marketing: { consent: marketing_consent ? 'SUBSCRIBED' : 'UNSUBSCRIBED' } }
              }
            }),
          }
        }
      })
    })

    // Fire event if provided
    if (event) {
      await fetch(`${BASE}/events/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${key}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'event',
            attributes: {
              profile: { data: { type: 'profile', attributes: { email } } },
              metric: { data: { type: 'metric', attributes: { name: event } } },
              properties: body,
            }
          }
        })
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
