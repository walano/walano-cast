// Storefront catalog source — Supabase (categories → services → plans + stock).
// Replaces the old Chariow/Express pipeline. Maps rows onto the v2 design
// shapes (CardProduct, CatOption-like) so design components stay unchanged.

import { createClient } from '@/lib/supabase/server'
import { categoryIcon, type CardProduct } from '@/lib/v2-adapter'

export type CatalogService = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  sort_order: number
  // service-level override wins over the category's checkout_fields
  // (e.g. Netflix PIN 4 digits, Prime Video PIN 5)
  checkout_fields_override: unknown
  category: { id: string; name: string; slug: string; checkout_fields: unknown } | null
  plans: { id: string; label: string; duration_days: number; price_amount: string; details: string | null }[]
  available: number
}

export function effectiveCheckoutFields(s: CatalogService): unknown[] {
  const override = s.checkout_fields_override
  if (Array.isArray(override) && override.length > 0) return override
  const catFields = s.category?.checkout_fields
  return Array.isArray(catFields) ? catFields : []
}

export async function fetchCatalog(): Promise<{
  services: CatalogService[]
  cats: { id: string; label: string; icon: string; iconUrl: string | null }[]
}> {
  const supabase = await createClient()

  const [{ data: services }, { data: cats }, { data: stock }] = await Promise.all([
    supabase
      .from('services')
      .select(`
        id, name, slug, description, logo_url, cover_url, sort_order, checkout_fields_override,
        categories ( id, name, slug, checkout_fields ),
        plans ( id, label, duration_days, price_amount, details, is_active )
      `)
      .eq('is_active', true)
      .order('sort_order')
      .order('name'),
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
    supabase.rpc('get_stock_counts'),
  ])

  const stockMap = new Map<string, number>(
    ((stock ?? []) as { service_id: string; available: number }[]).map((s) => [s.service_id, Number(s.available)]),
  )

  const mapped: CatalogService[] = (services ?? []).map((s) => {
    const category = (s.categories as unknown as CatalogService['category']) ?? null
    const plans = ((s.plans as unknown as (CatalogService['plans'][number] & { is_active: boolean })[]) ?? [])
      .filter((p) => p.is_active)
      .sort((a, b) => a.duration_days - b.duration_days)
    return {
      id: s.id, name: s.name, slug: s.slug, description: s.description,
      logo_url: s.logo_url, cover_url: s.cover_url, sort_order: s.sort_order,
      checkout_fields_override: s.checkout_fields_override,
      category, plans,
      available: stockMap.get(s.id) ?? 0,
    }
  })

  return {
    services: mapped,
    cats: (cats ?? []).map((c) => ({
      id: c.slug,
      label: c.name,
      icon: categoryIcon(c.slug),
      iconUrl: null,
    })),
  }
}

export function serviceToCardProduct(s: CatalogService, idxInCat: number): CardProduct {
  const cheapest = s.plans.reduce<CatalogService['plans'][number] | null>(
    (min, p) => (min === null || Number(p.price_amount) < Number(min.price_amount) ? p : min),
    null,
  )
  const initials = s.name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/)
  return {
    id: s.id,
    cat: s.category?.slug ?? 'autres',
    initials: initials.length >= 2
      ? (initials[0][0] + initials[1][0]).toUpperCase()
      : (s.name.slice(0, 2) || '??').toUpperCase(),
    platform: s.name,
    name: cheapest?.label ?? '',
    price: Number(cheapest?.price_amount ?? 0),
    old: null,
    discount: null,
    idx: idxInCat,
    icon: s.logo_url,
    banner: s.cover_url,
    description: s.description,
    planId: cheapest?.id ?? null,
    planLabel: cheapest?.label ?? null,
  }
}

export function servicesToCardProducts(services: CatalogService[]): CardProduct[] {
  const perCat = new Map<string, number>()
  return services.map((s) => {
    const cat = s.category?.slug ?? 'autres'
    const idx = perCat.get(cat) ?? 0
    perCat.set(cat, idx + 1)
    return serviceToCardProduct(s, idx)
  })
}
