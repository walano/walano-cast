import { NextRequest, NextResponse } from 'next/server'
import { requireUser, clientMeta } from '@/lib/wc/guards'
import { rpcErrorResponse } from '@/lib/wc/errors'
import { decryptSecret } from '@/lib/wc/crypto'

// U6 — one-time reveal. The RPC flips the reveal guard atomically and returns
// ciphertext; decryption happens here (key never enters the DB).

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { user, supabase } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 })

  const { ip, ua } = clientMeta(req)
  const { data, error } = await supabase.rpc('begin_reveal', {
    p_order_id: id,
    p_ip: ip,
    p_ua: ua,
  })
  if (error) return rpcErrorResponse(error)

  let secret: string
  try {
    secret = decryptSecret(data as string)
  } catch (e) {
    // Reveal is already consumed at this point — surface loudly for support.
    console.error(`DECRYPT FAILURE on order ${id}:`, e)
    return NextResponse.json(
      { error: 'Erreur de déchiffrement — contactez le support avec votre référence de commande.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ secret })
}
