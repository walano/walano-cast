import { NextRequest, NextResponse } from 'next/server'
import { requireUser, clientMeta } from '@/lib/wc/guards'
import { rpcErrorResponse, SUBMIT_OUTCOME_MAP } from '@/lib/wc/errors'
import { verifyTurnstile } from '@/lib/wc/turnstile'
import { notifyAdminNewSubmission } from '@/lib/wc/notify'

// U4 — submit the transaction ID for an order group.
// Body: { transaction_id, turnstile_token? }

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const txnId: string | undefined = body?.transaction_id
  if (!txnId) return NextResponse.json({ error: 'transaction_id requis.' }, { status: 400 })

  const { ip, ua } = clientMeta(req)
  if (!(await verifyTurnstile(body?.turnstile_token, ip))) {
    return NextResponse.json({ error: 'Vérification anti-robot échouée.' }, { status: 403 })
  }

  const { data, error } = await supabase.rpc('submit_group_txn', {
    p_group: id, p_txn: txnId, p_ip: ip, p_ua: ua,
  })
  if (error) return rpcErrorResponse(error)

  const outcome: string = data?.outcome
  if (outcome !== 'accepted') {
    const mapped = SUBMIT_OUTCOME_MAP[outcome] ?? { status: 500, message: 'Erreur interne.' }
    return NextResponse.json({ error: mapped.message, outcome }, { status: mapped.status })
  }

  await notifyAdminNewSubmission(data.group?.ref ?? id)
  return NextResponse.json({ group: data.group })
}
