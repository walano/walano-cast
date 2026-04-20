// Shared bits for the catalog managers.

export type Category = {
  id: string; name: string; slug: string; description: string | null
  checkout_fields: unknown; delivery_type: string; inventory_kind: string
  post_payment_instructions: string | null; is_active: boolean
}
export type Service = {
  id: string; category_id: string; name: string; slug: string
  description: string | null; logo_url: string | null; cover_url: string | null
  is_active: boolean; sort_order: number
  checkout_fields_override: unknown | null
}
export type Plan = {
  id: string; service_id: string; label: string; duration_days: number
  price_amount: string; price_currency: string; details: string | null; is_active: boolean
}

export async function saveCatalog(resource: string, body: Record<string, unknown>, method: 'POST' | 'PATCH') {
  const res = await fetch(`/api/admin/catalog/${resource}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await res.json().catch(() => null)
  if (!res.ok) throw new Error(j?.error ?? 'Erreur.')
  return j
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
