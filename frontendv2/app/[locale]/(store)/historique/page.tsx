// "Historique de paiement": every order group where a transaction ID was submitted.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATUS_FR: Record<string, { label: string; color: string }> = {
  awaiting_validation: { label: 'En vérification', color: '#38bdf8' },
  paid: { label: 'Payé', color: '#22c55e' },
  rejected: { label: 'Rejeté', color: '#ff5c72' },
  expired: { label: 'Expirée', color: '#777' },
}

export default async function HistoriquePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth?next=/${locale}/historique`)

  const { data: groups } = await supabase
    .from('order_groups')
    .select('id, ref, status, amount_expected, transaction_id, submitted_at, payment_methods:payment_method_id ( name ), orders ( id )')
    .not('transaction_id', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>Historique de paiement</h1>
      <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 28px' }}>Toutes vos transactions soumises.</p>

      {(groups ?? []).length === 0 ? (
        <div style={{ background: '#121212', borderRadius: 12, padding: '48px 24px', textAlign: 'center', color: '#9a9a9a', fontSize: 15 }}>
          Aucune transaction pour le moment.
        </div>
      ) : (
        <div style={{ background: '#121212', borderRadius: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                {['Date', 'Commande', 'Articles', 'ID transaction', 'Méthode', 'Montant', 'Statut'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #1e1e1e', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(groups ?? []).map((g) => {
                const pm = g.payment_methods as unknown as { name: string } | null
                const n = (g.orders as unknown as unknown[])?.length ?? 0
                const s = STATUS_FR[g.status] ?? { label: g.status, color: '#999' }
                return (
                  <tr key={g.id}>
                    <td style={cell}>{g.submitted_at ? new Date(g.submitted_at).toLocaleDateString('fr-FR') : ''}</td>
                    <td style={{ ...cell, fontWeight: 700 }}>{g.ref}</td>
                    <td style={cell}>{n} article{n > 1 ? 's' : ''}</td>
                    <td style={{ ...cell, fontFamily: 'monospace', fontSize: 12.5 }}>{g.transaction_id}</td>
                    <td style={cell}>{pm?.name}</td>
                    <td style={{ ...cell, fontWeight: 700, whiteSpace: 'nowrap' }}>{Number(g.amount_expected).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ ...cell, color: s.color, fontWeight: 700 }}>{s.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const cell: React.CSSProperties = { padding: '13px 16px', fontSize: 13.5, color: '#fff', borderBottom: '1px solid #191919' }
