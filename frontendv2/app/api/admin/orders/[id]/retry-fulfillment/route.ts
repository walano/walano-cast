import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyUserOrderReady } from '@/lib/wc/notify'

// A6 recovery — claim fresh stock for an order stuck in 'paid'.

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { data: order, error } = await supabase.rpc('retry_fulfillment', { p_order_id: id })
  if (error) return rpcErrorResponse(error)

  const admin = createAdminClient()
  const { data: u } = await admin.auth.admin.getUserById(order.user_id)
  if (u?.user?.email) await notifyUserOrderReady(u.user.email, order.ref)

  return NextResponse.json({ order })
}
