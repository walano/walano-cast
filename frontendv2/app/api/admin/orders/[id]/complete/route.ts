import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { encryptSecret } from '@/lib/wc/crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyUserOrderReady } from '@/lib/wc/notify'

// A7 — complete a manual fulfillment ('fulfilling' → 'fulfilled').
// Body: { delivery_data?: string }  e.g. the created account's credentials for
// "Compte personnel". Encrypted here; the DB only ever sees ciphertext.

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const deliveryData: string | undefined = body?.delivery_data?.trim() || undefined

  const { data: order, error } = await supabase.rpc('complete_manual', {
    p_order_id: id,
    p_encrypted_delivery: deliveryData ? encryptSecret(deliveryData) : null,
  })
  if (error) return rpcErrorResponse(error)

  const admin = createAdminClient()
  const { data: u } = await admin.auth.admin.getUserById(order.user_id)
  if (u?.user?.email) await notifyUserOrderReady(u.user.email, order.ref)

  return NextResponse.json({ order })
}
