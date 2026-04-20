import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { createAdminClient } from '@/lib/supabase/admin'

// A1–A4 — admin CRUD for the catalog, one generic route:
//   POST  /api/admin/catalog/:resource        → create (body = columns)
//   PATCH /api/admin/catalog/:resource        → update (body = { id, ...columns })
// Writes use the service role (catalog tables have no client write policies).

const EDITABLE: Record<string, string[]> = {
  categories: ['name', 'slug', 'description', 'checkout_fields', 'delivery_type',
               'inventory_kind', 'post_payment_instructions', 'is_active'],
  services: ['category_id', 'name', 'slug', 'description', 'logo_url', 'cover_url',
             'is_active', 'sort_order', 'checkout_fields_override'],
  plans: ['service_id', 'label', 'duration_days', 'price_amount', 'price_currency',
          'details', 'is_active'],
  payment_methods: ['name', 'instructions', 'receiving_account', 'txn_id_pattern', 'is_active'],
}

function pick(body: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params
  const allowed = EDITABLE[resource]
  if (!allowed) return NextResponse.json({ error: 'Ressource inconnue.' }, { status: 404 })

  const { user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Corps JSON requis.' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.from(resource).insert(pick(body, allowed)).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: `${resource.replace(/s$/, '')}.created`,
    entity_type: resource,
    entity_id: data.id,
    details: {},
  })
  return NextResponse.json({ [resource]: data }, { status: 201 })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const { resource } = await ctx.params
  const allowed = EDITABLE[resource]
  if (!allowed) return NextResponse.json({ error: 'Ressource inconnue.' }, { status: 404 })

  const { user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const id: string | undefined = body?.id
  if (!id) return NextResponse.json({ error: 'id requis.' }, { status: 400 })

  const admin = createAdminClient()
  const changes = pick(body, allowed)

  // delivery_type / inventory_kind become immutable once any order references
  // the category (spec §3.2) — retroactive changes would break fulfillment.
  if (resource === 'categories' && ('delivery_type' in changes || 'inventory_kind' in changes)) {
    const { count } = await admin
      .from('orders').select('id', { count: 'exact', head: true }).eq('category_id', id)
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'delivery_type / inventory_kind ne sont plus modifiables : des commandes existent pour cette catégorie.' },
        { status: 409 },
      )
    }
  }

  // price changes are audit-logged with old → new (spec A3)
  let priceAudit: Record<string, unknown> | null = null
  if (resource === 'plans' && 'price_amount' in changes) {
    const { data: before } = await admin.from('plans').select('price_amount').eq('id', id).single()
    if (before && Number(before.price_amount) !== Number(changes.price_amount)) {
      priceAudit = { old: before.price_amount, new: changes.price_amount }
    }
  }

  const { data, error } = await admin.from(resource).update(changes).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: priceAudit ? 'price.changed' : `${resource.replace(/s$/, '')}.updated`,
    entity_type: resource,
    entity_id: id,
    details: priceAudit ?? { fields: Object.keys(changes) },
  })
  return NextResponse.json({ [resource]: data })
}
