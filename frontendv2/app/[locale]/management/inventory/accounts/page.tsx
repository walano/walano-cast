// A5 — shared accounts (Profil mode). Service-role reads, admin-gated first.

import { getAdminSession } from '@/lib/management'
import { createAdminClient } from '@/lib/supabase/admin'
import SharedAccountsManager from '@/components/admin/SharedAccountsManager'

export default async function AccountsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)
  const admin = createAdminClient()

  const [{ data: services }, { data: accounts }, { data: slots }] = await Promise.all([
    supabase.from('services').select('id, name, category_id, categories ( inventory_kind )').order('name'),
    admin.from('shared_accounts').select('*').order('created_at'),
    admin.from('account_slots').select('id, shared_account_id, status'),
  ])

  const slotsByAccount: Record<string, Record<string, number>> = {}
  for (const s of slots ?? []) {
    slotsByAccount[s.shared_account_id] ??= {}
    slotsByAccount[s.shared_account_id][s.status] = (slotsByAccount[s.shared_account_id][s.status] ?? 0) + 1
  }

  const slotServices = (services ?? [])
    .map((s) => ({
      id: s.id,
      name: s.name,
      inventory_kind: (s.categories as unknown as { inventory_kind: string })?.inventory_kind ?? 'none',
    }))
    .filter((s) => s.inventory_kind === 'slot')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Comptes partagés</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Comptes Netflix / Prime… avec leurs slots de profils. Ajouter un compte crée automatiquement ses slots.
      </p>
      <SharedAccountsManager services={slotServices} accounts={(accounts ?? []).map((a) => ({ ...a, slots: slotsByAccount[a.id] ?? {} }))} />
    </div>
  )
}
