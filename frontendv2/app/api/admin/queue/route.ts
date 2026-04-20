import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'

// Admin board data:
//  - awaiting_validation: order GROUPS to approve/reject (with line items)
//  - fulfilling: line-item orders needing a manual action (complete)
//  - awaiting_stock: line-item backorders waiting for the admin to load stock

export async function GET() {
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const groupsQ = supabase
    .from('order_groups')
    .select(`
      id, ref, status, amount_expected, currency, transaction_id, submitted_at, created_at,
      profiles:user_id ( display_name, phone ),
      payment_methods:payment_method_id ( name ),
      orders ( id, amount_expected, checkout_data, delivery_type_snapshot,
                plans:plan_id ( label, services ( name ) ) )
    `)
    .eq('status', 'awaiting_validation')
    .order('submitted_at', { ascending: true })

  const lineSelect = `
    id, status, checkout_data, created_at,
    order_groups:group_id ( ref ),
    profiles:user_id ( display_name, phone ),
    plans:plan_id ( label, services ( name ) )
  `
  const fulfillingQ = supabase.from('orders').select(lineSelect).eq('status', 'fulfilling').order('created_at', { ascending: true })
  const backorderQ = supabase.from('orders').select(lineSelect).eq('status', 'awaiting_stock').order('created_at', { ascending: true })

  const [groups, fulfilling, backorders] = await Promise.all([groupsQ, fulfillingQ, backorderQ])
  const err = groups.error ?? fulfilling.error ?? backorders.error
  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  return NextResponse.json({
    awaiting_validation: groups.data,
    fulfilling: fulfilling.data,
    awaiting_stock: backorders.data,
  })
}
