// A4 — payment methods CRUD.

import { getAdminSession } from '@/lib/management'
import PaymentMethodsManager from '@/components/admin/PaymentMethodsManager'

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)

  const { data: methods } = await supabase.from('payment_methods').select('*').order('name')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Méthodes de paiement</h1>
      <PaymentMethodsManager methods={methods ?? []} />
    </div>
  )
}
