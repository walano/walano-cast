// "Abonnements": the user's order groups + per-item deliveries. All
// subscription details live HERE only (never in emails — notification policy).

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import GroupsList, { type UserGroup, type UserLine } from '@/components/account/GroupsList'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

function render(template: string | null, vars: Record<string, string>): string | null {
  if (!template) return null
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
}

export default async function AbonnementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(`/${locale}/abonnements`)}`)

  const { data: groups } = await supabase
    .from('order_groups')
    .select(`
      id, ref, status, amount_expected, reject_reason, created_at,
      orders (
        id, status, amount_expected, checkout_data, fulfilled_at,
        plans:plan_id ( label, services ( id, name, logo_url ) ),
        categories:category_id ( post_payment_instructions )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(40)

  // zero-access data assembled server-side for this user only
  const lineIds = (groups ?? []).flatMap((g) => (g.orders as unknown as { id: string }[]).map((o) => o.id))
  const admin = createAdminClient()
  const [{ data: reveals }, { data: slots }] = lineIds.length
    ? await Promise.all([
        admin.from('item_reveals').select('order_id, revealed_at').in('order_id', lineIds),
        admin.from('account_slots').select('order_id, shared_accounts ( account_email )').in('order_id', lineIds),
      ])
    : [{ data: [] }, { data: [] }]
  const revealMap = new Map((reveals ?? []).map((r) => [r.order_id, r.revealed_at]))
  const accountMap = new Map((slots ?? []).map((s) => [s.order_id, (s.shared_accounts as unknown as { account_email: string } | null)?.account_email ?? null]))

  const list: UserGroup[] = (groups ?? []).map((g) => {
    const orders = g.orders as unknown as Array<{
      id: string; status: string; amount_expected: string; checkout_data: Record<string, string>
      plans: { label: string; services: { id: string; name: string; logo_url: string | null } | null } | null
      categories: { post_payment_instructions: string | null } | null
    }>
    const items: UserLine[] = orders.map((o) => {
      const checkout = o.checkout_data ?? {}
      const accountEmail = accountMap.get(o.id) ?? null
      const waText = encodeURIComponent(`Bonjour WalanoCast ! Commande ${g.ref}${checkout.profile_name ? `, profil « ${checkout.profile_name} »` : ''}`)
      const whatsappLink = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${waText}` : ''
      return {
        id: o.id, status: o.status, amount: Number(o.amount_expected),
        serviceName: o.plans?.services?.name ?? '', logo: o.plans?.services?.logo_url ?? null,
        planLabel: o.plans?.label ?? '', checkoutData: checkout, accountEmail,
        hasSecret: revealMap.has(o.id), revealed: revealMap.get(o.id) != null, whatsappLink,
        instructions: o.status === 'fulfilled'
          ? render(o.categories?.post_payment_instructions ?? null, { order_ref: g.ref, whatsapp_link: whatsappLink, ...checkout, ...(accountEmail ? { account_email: accountEmail } : {}) })
          : null,
      }
    })
    return {
      id: g.id, ref: g.ref, status: g.status, amount: Number(g.amount_expected),
      rejectReason: g.reject_reason, createdAt: g.created_at, items,
    }
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>Mes abonnements</h1>
      <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 28px' }}>Vos commandes, livraisons et instructions : tout est ici.</p>
      <GroupsList groups={list} locale={locale} />
    </div>
  )
}
