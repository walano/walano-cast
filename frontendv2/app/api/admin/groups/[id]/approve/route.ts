import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyUserOrderReady } from '@/lib/wc/notify'

// A6 — approve an order group's payment. Cascades fulfillment to every line
// item (deliver / backorder / manual) in one transaction.

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { data: group, error } = await supabase.rpc('approve_group', { p_group: id })
  if (error) return rpcErrorResponse(error)

  const admin = createAdminClient()
  const { data: u } = await admin.auth.admin.getUserById(group.user_id)
  if (u?.user?.email) await notifyUserOrderReady(u.user.email, group.ref)

  return NextResponse.json({ group })
}
