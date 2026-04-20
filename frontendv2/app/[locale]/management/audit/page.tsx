// A9 — append-only audit log viewer. audit_logs is zero-client-access, so
// reads use the service role (page admin-gated first).

import { getAdminSession } from '@/lib/management'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await getAdminSession(locale)

  const admin = createAdminClient()
  const { data: logs } = await admin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Journal d’audit</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Append-only — 200 dernières actions.
      </p>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'Action', 'Entité', 'Détails', 'IP'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#777', textTransform: 'uppercase', borderBottom: '1px solid #1e1e1e', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(logs ?? []).map((l) => (
              <tr key={l.id}>
                <td style={cell}>{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{l.action}</td>
                <td style={cell}>{l.entity_type ?? '—'}</td>
                <td style={{ ...cell, fontFamily: 'monospace', fontSize: 11, maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(l.details)}
                </td>
                <td style={cell}>{l.ip ?? '—'}</td>
              </tr>
            ))}
            {(logs ?? []).length === 0 && <tr><td style={cell} colSpan={5}>Journal vide.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const cell = {
  padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #161616', verticalAlign: 'top',
} as const
