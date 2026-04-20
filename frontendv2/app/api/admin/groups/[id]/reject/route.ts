import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyUserOrderRejected } from '@/lib/wc/notify'

// A6 — reject an order group's payment. Body: { reason }

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const reason: string = body?.reason?.trim()
  if (!reason) return NextResponse.json({ error: 'Motif de rejet requis.' }, { status: 400 })

  const { data: group, error } = await supabase.rpc('reject_group', { p_group: id, p_reason: reason })
  if (error) return rpcErrorResponse(error)

  const admin = createAdminClient()
  const { data: u } = await admin.auth.admin.getUserById(group.user_id)
  if (u?.user?.email) await notifyUserOrderRejected(u.user.email, group.ref)

  return NextResponse.json({ group })
}
