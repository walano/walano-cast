// A3 — plans (durées + prix).

import { getAdminSession } from '@/lib/management'
import PlansManager from '@/components/admin/PlansManager'

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)

  const [{ data: plans }, { data: services }] = await Promise.all([
    supabase.from('plans').select('*').order('duration_days'),
    supabase.from('services').select('*').order('name'),
  ])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Offres</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Durées et prix par service. Les commandes existantes gardent leur prix d’origine.
      </p>
      <PlansManager plans={plans ?? []} services={services ?? []} />
    </div>
  )
}
