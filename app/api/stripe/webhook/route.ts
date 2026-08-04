import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function stripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-07-29.dahlia' })
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''
  const s = stripe()

  let event: Stripe.Event
  try {
    event = s.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = adminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { mode: string; subscription: string; customer: string }
    if (session.mode === 'subscription') {
      const sub = await s.subscriptions.retrieve(session.subscription)
      const subData = sub as unknown as { status: string; current_period_end: number }
      await supabase.from('users')
        .update({
          subscription_status: subData.status,
          subscription_current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', session.customer)
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as unknown as { status: string; current_period_end: number; customer: string }
    await supabase.from('users')
      .update({
        subscription_status: sub.status,
        subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', sub.customer)
  }

  return NextResponse.json({ received: true })
}
