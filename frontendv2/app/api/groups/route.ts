import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { validateItems } from '@/lib/wc/validate-items'

// U3 — create an order group (basket). Body:
// { payment_method_id, items: [{ plan_id, checkout_data? }] }

export async function POST(req: NextRequest) {
  const { user, supabase } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const paymentMethodId: string | undefined = body?.payment_method_id
  if (!paymentMethodId) return NextResponse.json({ error: 'Méthode de paiement requise.' }, { status: 400 })

  const validated = await validateItems(supabase, body?.items ?? [])
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 422 })

  const { data, error } = await supabase.rpc('create_group', {
    p_payment_method_id: paymentMethodId,
    p_items: validated.clean,
  })
  if (error) return rpcErrorResponse(error)

  return NextResponse.json({ group: data }, { status: 201 })
}
