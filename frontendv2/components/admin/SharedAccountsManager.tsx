'use client'
// Shared accounts (Profil mode): list with slot usage + add form.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, label, th, td, Btn } from '@/components/admin/ui'

type ServiceRow = { id: string; name: string; inventory_kind: string }
type AccountRow = {
  id: string; service_id: string; account_email: string; capacity: number
  status: string; expires_at: string | null; slots: Record<string, number>
}

export default function SharedAccountsManager({ services, accounts }: {
  services: ServiceRow[]
  accounts: AccountRow[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [f, setF] = useState({ service_id: services[0]?.id ?? '', account_email: '', capacity: 5, expires_at: '' })
  const [busy, setBusy] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}
      {notice && <div style={{ ...card, borderColor: '#14532d', color: '#22c55e', fontSize: 13 }}>{notice}</div>}

      <section style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Comptes</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Compte</th><th style={th}>Service</th><th style={th}>Slots libres</th>
              <th style={th}>Actifs</th><th style={th}>Statut</th><th style={th}>Expire</th>
            </tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{a.account_email}</td>
                  <td style={td}>{services.find((s) => s.id === a.service_id)?.name ?? '?'}</td>
                  <td style={{ ...td, fontWeight: 800, color: (a.slots.free ?? 0) > 0 ? '#22c55e' : '#ff5c72' }}>
                    {a.slots.free ?? 0} / {a.capacity}
                  </td>
                  <td style={td}>{a.slots.active ?? 0}</td>
                  <td style={td}>{a.status}</td>
                  <td style={td}>{a.expires_at ?? '—'}</td>
                </tr>
              ))}
              {accounts.length === 0 && <tr><td style={td} colSpan={6}>Aucun compte partagé.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>+ Ajouter un compte partagé</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div><span style={label}>Service</span>
            <select style={{ ...input, appearance: 'auto' }} value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></div>
          <div><span style={label}>Email du compte</span>
            <input style={input} value={f.account_email} onChange={(e) => setF({ ...f, account_email: e.target.value })} /></div>
          <div><span style={label}>Capacité (profils)</span>
            <input style={input} type="number" min={1} max={20} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} /></div>
          <div><span style={label}>Expiration (optionnel)</span>
            <input style={input} type="date" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Btn kind="primary" disabled={busy || !f.service_id || !f.account_email} onClick={async () => {
            setBusy(true); setError(null); setNotice(null)
            const res = await fetch('/api/admin/inventory/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: f.service_id, account_email: f.account_email,
                capacity: f.capacity, expires_at: f.expires_at || null,
              }),
            })
            const j = await res.json().catch(() => null)
            if (!res.ok) setError(j?.error ?? 'Erreur.')
            else {
              setF({ ...f, account_email: '' })
              setNotice('Compte ajouté, slots créés.')
              router.refresh()
            }
            setBusy(false)
          }}>Ajouter</Btn>
        </div>
        {services.length === 0 && (
          <p style={{ color: '#9a9a9a', fontSize: 12, marginTop: 10 }}>
            Aucun service en mode « slot » — créez d’abord un service dans la catégorie Profil.
          </p>
        )}
      </section>
    </div>
  )
}
