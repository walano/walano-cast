import { NextResponse } from 'next/server'

// WC_* codes raised by the Postgres RPCs → HTTP status + user-facing message (FR)

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  WC_UNAUTHENTICATED: { status: 401, message: 'Connectez-vous pour continuer.' },
  WC_FORBIDDEN: { status: 403, message: 'Accès refusé.' },
  WC_NOT_FOUND: { status: 404, message: 'Commande introuvable.' },
  WC_PLAN_NOT_FOUND: { status: 404, message: 'Cette offre n’est plus disponible.' },
  WC_PAYMENT_METHOD_NOT_FOUND: { status: 404, message: 'Méthode de paiement indisponible.' },
  WC_TOO_MANY_PENDING: { status: 429, message: 'Vous avez déjà 3 commandes en attente de paiement. Terminez-les ou attendez leur expiration.' },
  WC_OUT_OF_STOCK: { status: 409, message: 'Rupture de stock — réessayez plus tard.' },
  WC_BAD_STATUS: { status: 409, message: 'Cette action n’est pas possible dans l’état actuel de la commande.' },
  WC_EXPIRED: { status: 410, message: 'Cette commande a expiré. Créez une nouvelle commande.' },
  WC_ALREADY_REVEALED: { status: 410, message: 'Ce contenu a déjà été affiché une fois. Contactez le support si besoin.' },
  WC_NO_SECRET: { status: 404, message: 'Rien à afficher pour cette commande.' },
  WC_RATE_LIMITED: { status: 429, message: 'Trop de tentatives. Réessayez dans une heure.' },
}

// submit_txn returns outcomes instead of raising (so failed attempts stay logged)
export const SUBMIT_OUTCOME_MAP: Record<string, { status: number; message: string }> = {
  not_found: ERROR_MAP.WC_NOT_FOUND,
  bad_status: ERROR_MAP.WC_BAD_STATUS,
  expired: ERROR_MAP.WC_EXPIRED,
  rate_limited: ERROR_MAP.WC_RATE_LIMITED,
  bad_format: { status: 422, message: 'Format du numéro de transaction invalide. Vérifiez et réessayez.' },
  duplicate: { status: 409, message: 'Ce numéro de transaction a déjà été utilisé.' },
}

export function rpcErrorResponse(error: { message?: string } | null): NextResponse {
  const code = Object.keys(ERROR_MAP).find((c) => error?.message?.includes(c))
  if (code) {
    const { status, message } = ERROR_MAP[code]
    return NextResponse.json({ error: message, code }, { status })
  }
  console.error('Unexpected RPC error:', error?.message)
  return NextResponse.json({ error: 'Erreur interne. Réessayez.' }, { status: 500 })
}
