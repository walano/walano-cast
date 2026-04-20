'use client'
// Keys / invite links stock: per-service counts + bulk loading.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, textarea, label, th, td, Btn } from '@/components/admin/ui'

type ServiceRow = { id: string; name: string; inventory_kind: string }

export default function ItemsInventory({ services, stock }: {
  services: ServiceRow[]
  stock: Record<string, Record<string, number>>
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [payloads, setPayloads] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}
      {notice && <div style={{ ...card, borderColor: '#14532d', color: '#22c55e', fontSize: 13 }}>{notice}</div>}

      <section style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Stock par service</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Service</th><th style={th}>Disponible</th><th style={th}>Réservé</th>
              <th style={th}>Livré</th>
            </tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.name}</td>
                  <td style={{ ...td, fontWeight: 800, color: (stock[s.id]?.available ?? 0) > 0 ? '#22c55e' : '#ff5c72' }}>
                    {stock[s.id]?.available ?? 0}
                  </td>
                  <td style={td}>{stock[s.id]?.reserved ?? 0}</td>
                  <td style={td}>{stock[s.id]?.delivered ?? 0}</td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td style={td} colSpan={4}>Aucun service en mode « item » — créez un service dans une catégorie à livraison automatique (clés / comptes partagés).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Charger des clés / liens</h2>
        <p style={{ color: '#9a9a9a', fontSize: 12, marginBottom: 14 }}>
          Un élément par ligne. Chiffré à l’enregistrement — jamais stocké en clair, affiché une seule fois au client.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <div><span style={label}>Service</span>
            <select style={{ ...input, appearance: 'auto', maxWidth: 320 }} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></div>
          <div><span style={label}>Éléments (clés, liens d’invitation, identifiants…)</span>
            <textarea style={{ ...textarea, fontFamily: 'monospace', fontSize: 12, minHeight: 140 }}
              placeholder={'NETF-XXXX-YYYY-ZZZZ\nNETF-AAAA-BBBB-CCCC'}
              value={payloads} onChange={(e) => setPayloads(e.target.value)} /></div>
          <div>
            <Btn kind="primary" disabled={busy || !serviceId || !payloads.trim()} onClick={async () => {
              setBusy(true); setError(null); setNotice(null)
              const lines = payloads.split('\n').map((l) => l.trim()).filter(Boolean)
              const res = await fetch('/api/admin/inventory/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: serviceId, payloads: lines }),
              })
              const j = await res.json().catch(() => null)
              if (!res.ok) setError(j?.error ?? 'Erreur.')
              else {
                setPayloads('')
                setNotice(`${j?.loaded ?? lines.length} élément(s) chargé(s) et chiffré(s).`)
                router.refresh()
              }
              setBusy(false)
            }}>Charger</Btn>
          </div>
        </div>
      </section>
    </div>
  )
}
