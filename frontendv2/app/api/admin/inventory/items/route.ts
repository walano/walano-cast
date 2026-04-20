import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { encryptSecret } from '@/lib/wc/crypto'

// A5 — bulk load keys / invite links / credential sets.
// Body: { service_id, plan_id?, payloads: string[] }
// Each payload is encrypted here; plaintext never reaches the DB or logs.

export async function POST(req: NextRequest) {
  const { user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const serviceId: string | undefined = body?.service_id
  const planId: string | null = body?.plan_id ?? null
  const payloads: unknown = body?.payloads

  if (!serviceId || !Array.isArray(payloads) || payloads.length === 0) {
    return NextResponse.json({ error: 'service_id et payloads[] requis.' }, { status: 400 })
  }
  if (payloads.length > 500) {
    return NextResponse.json({ error: '500 éléments maximum par chargement.' }, { status: 400 })
  }

  const clean = payloads
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
  if (clean.length === 0) return NextResponse.json({ error: 'Aucun élément valide.' }, { status: 400 })

  const admin = createAdminClient()
  const rows = clean.map((p) => ({
    service_id: serviceId,
    plan_id: planId,
    encrypted_payload: encryptSecret(p),
  }))

  const { error } = await admin.from('inventory_items').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // audit with count only — never payloads (spec A5)
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'inventory.loaded',
    entity_type: 'service',
    entity_id: serviceId,
    details: { kind: 'item', count: rows.length, plan_id: planId },
  })

  // deliver any backorders waiting on this service (FIFO)
  const { data: fulfilled } = await admin.rpc('fulfill_awaiting_stock', { p_service: serviceId })

  return NextResponse.json({ loaded: rows.length, backorders_fulfilled: fulfilled ?? 0 }, { status: 201 })
}
