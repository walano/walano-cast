import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { createAdminClient } from '@/lib/supabase/admin'

// A5 — add a shared account (Profil mode). Slots are auto-created by trigger.
// Body: { service_id, account_email, capacity, expires_at? }

export async function POST(req: NextRequest) {
  const { user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const { service_id, account_email, capacity, expires_at } = body ?? {}

  if (!service_id || !account_email || !Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
    return NextResponse.json(
      { error: 'service_id, account_email et capacity (1–20) requis.' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('shared_accounts')
    .insert({ service_id, account_email, capacity, expires_at: expires_at ?? null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'inventory.loaded',
    entity_type: 'shared_account',
    entity_id: data.id,
    details: { kind: 'slot', capacity, service_id },
  })

  // deliver any profil backorders waiting on this service (FIFO)
  const { data: fulfilled } = await admin.rpc('fulfill_awaiting_stock', { p_service: service_id })

  return NextResponse.json({ account: data, backorders_fulfilled: fulfilled ?? 0 }, { status: 201 })
}
