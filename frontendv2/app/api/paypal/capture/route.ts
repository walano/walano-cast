import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/wc/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { capturePayPalOrder, paypalConfigured } from '@/lib/wc/paypal'

// PayPal step 2 (basket): capture with PayPal's API, then auto-fulfill the
// whole group. Capture ID becomes the group's transaction_id; no manual
// validation. Body: { paypal_order_id }

export async function POST(req: NextRequest) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: 'PayPal indisponible.' }, { status: 503 })
  }
  const { user, supabase } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const paypalOrderId: string | undefined = body?.paypal_order_id
  if (!paypalOrderId) return NextResponse.json({ error: 'paypal_order_id requis.' }, { status: 400 })

  let capture
  try {
    capture = await capturePayPalOrder(paypalOrderId)
  } catch (e) {
    console.error('PayPal capture failed:', e)
    return NextResponse.json({ error: 'Échec du paiement PayPal.' }, { status: 502 })
  }
  if (!capture.completed || !capture.referenceId || !capture.captureId) {
    return NextResponse.json({ error: 'Paiement PayPal non abouti.' }, { status: 402 })
  }

  // the reference must be one of the caller's own groups
  const { data: own } = await supabase
    .from('order_groups').select('id').eq('id', capture.referenceId).single()
  if (!own) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })

  const admin = createAdminClient()
  const { data: group, error } = await admin.rpc('paypal_capture_fulfill', {
    p_group: capture.referenceId,
    p_capture: `PAYPAL-${capture.captureId}`,
  })
  if (error) {
    console.error(`PAYPAL CAPTURED BUT FULFILL FAILED group=${capture.referenceId}:`, error.message)
    return NextResponse.json(
      { error: 'Paiement reçu, finalisation en cours. Contactez le support avec votre référence si rien n’apparaît.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ group })
}
