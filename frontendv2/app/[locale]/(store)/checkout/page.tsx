// Checkout for the whole basket. Server loads the catalog (so line prices +
// checkout fields are authoritative) and payment methods; the client reads the
// cart, collects per-item fields, and creates one order group.
// ?group=<id> resumes payment for an existing pending/rejected group.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchCatalog, effectiveCheckoutFields } from '@/lib/catalog'
import CheckoutFlow, { type PlanInfo, type ResumeGroup } from '@/components/checkout/CheckoutFlow'
import type { CheckoutField } from '@/lib/wc/checkout-fields'

export default async function CheckoutRoute({ params, searchParams }: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ group?: string }>
}) {
  const { locale } = await params
  const { group: groupParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(`/${locale}/checkout`)}`)

  const { services } = await fetchCatalog()
  const plans: Record<string, PlanInfo> = {}
  for (const s of services) {
    const fields = effectiveCheckoutFields(s) as CheckoutField[]
    for (const p of s.plans) {
      plans[p.id] = {
        planId: p.id, serviceId: s.id, serviceName: s.name, logo: s.logo_url,
        planLabel: p.label, price: Number(p.price_amount), details: p.details,
        available: s.available, checkoutFields: fields,
      }
    }
  }

  const { data: allMethods } = await supabase
    .from('payment_methods')
    .select('id, name, instructions, receiving_account, kind')
    .eq('is_active', true)
    .order('name')
  const methods = (allMethods ?? []).filter((m) => m.kind === 'manual')
  const paypalMethod = (allMethods ?? []).find((m) => m.kind === 'paypal') ?? null

  // resume an existing group's payment
  let resume: ResumeGroup | null = null
  if (groupParam) {
    const { data: g } = await supabase
      .from('order_groups')
      .select('id, ref, status, amount_expected, payment_method_id, reject_reason, expires_at')
      .eq('id', groupParam)
      .single()
    if (g && ['pending_payment', 'rejected'].includes(g.status)) {
      const method = (allMethods ?? []).find((m) => m.id === g.payment_method_id) ?? null
      resume = {
        id: g.id, ref: g.ref, amount: Number(g.amount_expected),
        rejectReason: g.reject_reason,
        method: method ? { id: method.id, name: method.name, instructions: method.instructions, receiving_account: method.receiving_account, kind: method.kind } : null,
      }
    }
  }

  return (
    <CheckoutFlow
      locale={locale}
      plans={plans}
      methods={methods}
      paypalClientId={paypalMethod ? (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null) : null}
      paypalMeHandle={paypalMethod ? (process.env.NEXT_PUBLIC_PAYPAL_ME || null) : null}
      paypalMethodId={paypalMethod?.id ?? null}
      resume={resume}
    />
  )
}
