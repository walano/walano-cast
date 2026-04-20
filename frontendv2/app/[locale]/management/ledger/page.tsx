// A8 — transaction ledger: every order group carrying a transaction ID.
// Server-rendered; filters via query params (?status=…).

import Link from 'next/link'
import { getAdminSession } from '@/lib/management'

const STATUSES = ['', 'awaiting_validation', 'paid', 'rejected', 'expired'] as const
const LABELS: Record<string, string> = {
  '': 'Toutes', awaiting_validation: 'À valider', paid: 'Payées', rejected: 'Rejetées', expired: 'Expirées',
}

export default async function LedgerPage({ params, searchParams }: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params
  const { status = '' } = await searchParams
  const { supabase } = await getAdminSession(locale)

  let q = supabase
    .from('order_groups')
    .select(`
      id, ref, status, amount_expected, currency, transaction_id,
      submitted_at, reject_reason,
      profiles:user_id ( display_name, phone ),
      payment_methods:payment_method_id ( name ),
      orders ( id, plans:plan_id ( label, services ( name ) ) )
    `)
    .not('transaction_id', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(200)
  if (status) q = q.eq('status', status)
  const { data: groups } = await q

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Transactions</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <Link key={s} href={`/${locale}/management/ledger${s ? `?status=${s}` : ''}`}
            style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, textDecoration: 'none', background: status === s ? '#e91035' : '#1a1a1a', color: status === s ? '#fff' : '#9a9a9a' }}>
            {LABELS[s]}
          </Link>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Réf', 'ID transaction', 'Montant', 'Méthode', 'Client', 'Articles', 'Soumis', 'Statut'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#777', textTransform: 'uppercase', borderBottom: '1px solid #1e1e1e', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(groups ?? []).map((g) => {
              const profile = g.profiles as unknown as { display_name: string | null; phone: string | null } | null
              const pm = g.payment_methods as unknown as { name: string } | null
              const orders = g.orders as unknown as Array<{ plans: { label: string; services: { name: string } | null } | null }>
              const summary = orders.map((o) => o.plans?.services?.name).filter(Boolean).join(', ')
              return (
                <tr key={g.id}>
                  <td style={cell}>{g.ref}</td>
                  <td style={{ ...cell, fontFamily: 'monospace' }}>{g.transaction_id}</td>
                  <td style={{ ...cell, fontWeight: 700 }}>{Number(g.amount_expected).toLocaleString('fr-FR')} {g.currency}</td>
                  <td style={cell}>{pm?.name}</td>
                  <td style={cell}>{profile?.display_name ?? ''}</td>
                  <td style={cell}>{summary || `${orders.length} article(s)`}</td>
                  <td style={cell}>{g.submitted_at ? new Date(g.submitted_at).toLocaleString('fr-FR') : ''}</td>
                  <td style={cell}>{g.status}{g.reject_reason ? ` · ${g.reject_reason}` : ''}</td>
                </tr>
              )
            })}
            {(groups ?? []).length === 0 && <tr><td style={cell} colSpan={8}>Aucune transaction.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const cell = { padding: '12px', fontSize: 13, borderBottom: '1px solid #161616' } as const
