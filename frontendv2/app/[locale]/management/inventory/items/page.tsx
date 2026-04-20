// A5 — keys / invite links stock. Inventory tables are zero-client-access,
// so reads use the service role (page is admin-gated first).

import { getAdminSession } from '@/lib/management'
import { createAdminClient } from '@/lib/supabase/admin'
import ItemsInventory from '@/components/admin/ItemsInventory'

export default async function ItemsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)
  const admin = createAdminClient()

  const [{ data: services }, { data: items }] = await Promise.all([
    supabase.from('services').select('id, name, category_id, categories ( inventory_kind )').order('name'),
    admin.from('inventory_items').select('id, service_id, status'),
  ])

  const stock: Record<string, Record<string, number>> = {}
  for (const it of items ?? []) {
    stock[it.service_id] ??= {}
    stock[it.service_id][it.status] = (stock[it.service_id][it.status] ?? 0) + 1
  }

  const itemServices = (services ?? [])
    .map((s) => ({
      id: s.id,
      name: s.name,
      inventory_kind: (s.categories as unknown as { inventory_kind: string })?.inventory_kind ?? 'none',
    }))
    .filter((s) => s.inventory_kind === 'item')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Clés & liens</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Stock des livraisons automatiques : clés d’abonnement, liens d’invitation, identifiants.
      </p>
      <ItemsInventory services={itemServices} stock={stock} />
    </div>
  )
}
