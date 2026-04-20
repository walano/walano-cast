// Backorders — line items paid but awaiting stock.

import { getAdminSession } from '@/lib/management'
import OrdersBoard from '@/components/admin/OrdersBoard'

export default async function StuckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await getAdminSession(locale)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>En approvisionnement</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Articles payés en rupture de stock. Chargez du stock pour une livraison automatique, ou relivrez ici.
      </p>
      <OrdersBoard view="stock" />
    </div>
  )
}
