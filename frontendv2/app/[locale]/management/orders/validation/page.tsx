// A6 — validation queue: check each transaction ID against the mobile money
// statement, then approve or reject.

import { getAdminSession } from '@/lib/management'
import OrdersBoard from '@/components/admin/OrdersBoard'

export default async function ValidationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await getAdminSession(locale)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Paiements à valider</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Vérifiez chaque ID de transaction dans le relevé mobile money avant d’approuver.
      </p>
      <OrdersBoard view="validation" />
    </div>
  )
}
