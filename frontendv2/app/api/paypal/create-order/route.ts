import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { validateItems } from '@/lib/wc/validate-items'
import { createPayPalOrder, paypalConfigured, xafToEur } from '@/lib/wc/paypal'

// PayPal step 1 (basket): create our order group (reserves stock, snapshots
// prices) then a matching PayPal order in EUR for the group total.
// Body: { items: [{ plan_id, checkout_data? }] }

export async function POST(req: NextRequest) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: 'PayPal indisponible.' }, { status: 503 })
  }
  const { user, supabase } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const validated = await validateItems(supabase, body?.items ?? [])
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 422 })

  const { data: paypalMethod } = await supabase
    .from('payment_methods').select('id').eq('kind', 'paypal').eq('is_active', true).limit(1).single()
  if (!paypalMethod) return NextResponse.json({ error: 'PayPal indisponible.' }, { status: 503 })

  const { data: group, error } = await supabase.rpc('create_group', {
    p_payment_method_id: paypalMethod.id,
    p_items: validated.clean,
  })
  if (error) return rpcErrorResponse(error)

  try {
    const paypalOrderId = await createPayPalOrder(
      xafToEur(Number(group.amount_expected)),
      group.id,
      `WalanoCast ${group.ref}`,
    )
    return NextResponse.json({ paypal_order_id: paypalOrderId, group_id: group.id, ref: group.ref })
  } catch (e) {
    console.error('PayPal create failed:', e)
    return NextResponse.json({ error: 'PayPal indisponible. Réessayez ou payez par mobile money.' }, { status: 502 })
  }
}
