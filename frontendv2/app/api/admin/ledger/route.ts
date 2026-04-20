import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'

// A8 — transaction ledger: every order group carrying a transaction ID.
// Query params: status?, from?, to?, limit? (default 100)

export async function GET(req: NextRequest) {
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const p = req.nextUrl.searchParams
  let q = supabase
    .from('order_groups')
    .select(`
      id, ref, status, amount_expected, currency, transaction_id,
      submitted_at, validated_at, created_at, reject_reason,
      profiles:user_id ( display_name, phone ),
      payment_methods:payment_method_id ( name ),
      orders ( id, plans:plan_id ( label, services ( name ) ) )
    `)
    .not('transaction_id', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(Math.min(Number(p.get('limit') ?? 100), 500))

  const status = p.get('status')
  if (status) q = q.eq('status', status)
  const from = p.get('from')
  if (from) q = q.gte('submitted_at', from)
  const to = p.get('to')
  if (to) q = q.lte('submitted_at', to)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ledger: data })
}
