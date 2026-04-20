// v2 design shapes + small helpers. The catalog source is lib/catalog.ts
// (Supabase); this module only keeps the shared CardProduct contract the
// design components consume, plus the category icon heuristic.

export type CardProduct = {
  id: string
  cat: string // category slug, or 'autres'
  initials: string
  platform: string // service name (brand line)
  name: string // short plan descriptor
  price: number
  old: number | null
  discount: number | null
  idx: number // palette index within its category
  icon: string | null
  banner: string | null // wide cover URL
  description: string | null
  planId: string | null // cheapest plan — drives quick add-to-cart / buy-now
  planLabel: string | null
}

// Best-effort icon name for the category nav (falls back to a generic grid).
export function categoryIcon(slug: string): string {
  const s = slug.toLowerCase()
  if (/(film|movie|serie|cine|tv|video|entertain|stream)/.test(s)) return 'film'
  if (/(music|musique|audio|son)/.test(s)) return 'music'
  if (/(ia|ai|intelligence|software|app)/.test(s)) return 'ai'
  if (/(game|gaming|jeu)/.test(s)) return 'gamepad'
  if (/(carte|card|gift|cadeau|recharge|misc|other|cle|key|abonnement|profil|compte)/.test(s)) return 'gift'
  return 'grid'
}
