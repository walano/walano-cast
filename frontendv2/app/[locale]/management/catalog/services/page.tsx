// A2 — services (Netflix, Spotify, Snapchat+, …).

import { getAdminSession } from '@/lib/management'
import ServicesManager from '@/components/admin/ServicesManager'

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase.from('services').select('*').order('sort_order').order('name'),
    supabase.from('categories').select('*').order('name'),
  ])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Services</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Les produits vendus (Netflix, Spotify, …), chacun rattaché à une catégorie.
      </p>
      <ServicesManager services={services ?? []} categories={categories ?? []} />
    </div>
  )
}
