// A7 — manual fulfillment to-do list (top-up, comptes personnels).

import { getAdminSession } from '@/lib/management'
import OrdersBoard from '@/components/admin/OrdersBoard'

export default async function ManualPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await getAdminSession(locale)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Commandes à traiter</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Paiement validé — effectuez l’action (recharge, création de compte), puis marquez livré.
        Les données saisies sont chiffrées et affichées une seule fois au client.
      </p>
      <OrdersBoard view="manual" />
    </div>
  )
}
