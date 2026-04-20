import type { SupabaseClient } from '@supabase/supabase-js'
import { validateCheckoutData, type CheckoutField } from '@/lib/wc/checkout-fields'

// Validate a basket of { plan_id, checkout_data } against each service's
// effective checkout fields (service override wins over category). Returns
// clean items for create_group, or a user-facing error string.

type RawItem = { plan_id?: string; checkout_data?: Record<string, unknown> }

export async function validateItems(
  supabase: SupabaseClient,
  items: RawItem[],
): Promise<{ ok: true; clean: { plan_id: string; checkout_data: Record<string, string> }[] } | { ok: false; error: string }> {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: 'Panier vide.' }
  if (items.length > 10) return { ok: false, error: 'Maximum 10 articles par commande.' }

  const planIds = items.map((i) => i.plan_id).filter(Boolean) as string[]
  if (planIds.length !== items.length) return { ok: false, error: 'Article invalide.' }

  const { data: plans } = await supabase
    .from('plans')
    .select('id, services ( checkout_fields_override, categories ( checkout_fields ) )')
    .in('id', planIds)

  const fieldsByPlan = new Map<string, CheckoutField[]>()
  for (const p of plans ?? []) {
    const svc = p.services as unknown as {
      checkout_fields_override: CheckoutField[] | null
      categories: { checkout_fields: CheckoutField[] }
    }
    const fields = (Array.isArray(svc?.checkout_fields_override) && svc.checkout_fields_override.length > 0)
      ? svc.checkout_fields_override
      : svc?.categories?.checkout_fields ?? []
    fieldsByPlan.set(p.id, fields)
  }

  const clean: { plan_id: string; checkout_data: Record<string, string> }[] = []
  for (const item of items) {
    const fields = fieldsByPlan.get(item.plan_id!)
    if (!fields) return { ok: false, error: 'Une offre du panier n’est plus disponible.' }
    const v = validateCheckoutData(fields, item.checkout_data ?? {})
    if (!v.ok) return { ok: false, error: v.error }
    clean.push({ plan_id: item.plan_id!, checkout_data: v.clean })
  }
  return { ok: true, clean }
}
