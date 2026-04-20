'use client'
// Admin order board. Three views:
//  - validation: order groups → approve / reject (one payment, many items)
//  - manual: line items needing an external action → complete (+ delivery data)
//  - stock: backorders (awaiting_stock) → retry once stock is loaded

import { useCallback, useEffect, useState } from 'react'
import { card, td, th, Btn, fmtXAF, textarea, input } from '@/components/admin/ui'

type LineItem = {
  id: string
  amount_expected?: string
  checkout_data: Record<string, string>
  delivery_type_snapshot?: string
  plans: { label: string; services: { name: string } | null } | null
  order_groups?: { ref: string } | null
  profiles?: { display_name: string | null; phone: string | null } | null
  status?: string
}
type Group = {
  id: string
  ref: string
  amount_expected: string
  transaction_id: string | null
  submitted_at: string | null
  profiles: { display_name: string | null; phone: string | null } | null
  payment_methods: { name: string } | null
  orders: LineItem[]
}
type QueueData = {
  awaiting_validation: Group[]
  fulfilling: LineItem[]
  awaiting_stock: LineItem[]
}

export type OrdersView = 'validation' | 'manual' | 'stock'

export default function OrdersBoard({ view }: { view: OrdersView }) {
  const [data, setData] = useState<QueueData | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/queue')
    if (res.ok) setData(await res.json())
    else setError('Chargement impossible.')
  }, [])
  useEffect(() => { load() }, [load])

  async function act(id: string, url: string, body?: Record<string, unknown>) {
    setBusy(id); setError(null)
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
    if (!res.ok) { const j = await res.json().catch(() => null); setError(j?.error ?? 'Erreur.') }
    await load(); setBusy(null)
  }

  if (!data) return <p style={{ color: '#9a9a9a' }}>Chargement…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}

      {view === 'validation' && (
        <Section title={`À valider (${data.awaiting_validation.length})`} empty="Aucun paiement en attente de validation.">
          {data.awaiting_validation.map((g) => <GroupRow key={g.id} group={g} busy={busy === g.id} act={act} />)}
        </Section>
      )}

      {view === 'manual' && (
        <Section title={`À traiter manuellement (${data.fulfilling.length})`} empty="Rien à traiter.">
          {data.fulfilling.map((o) => <ManualRow key={o.id} line={o} busy={busy === o.id} act={act} />)}
        </Section>
      )}

      {view === 'stock' && (
        <Section title={`En approvisionnement (${data.awaiting_stock.length})`} empty="Aucune commande en attente de stock.">
          <p style={{ fontSize: 12.5, color: '#9a9a9a', margin: '0 0 12px' }}>
            Ces articles sont payés mais en rupture. Chargez du stock dans « Stock » (livraison automatique), ou relivrez manuellement ici.
          </p>
          {data.awaiting_stock.map((o) => (
            <BackorderRow key={o.id} line={o} busy={busy === o.id} act={act} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children]
  const isEmpty = arr.filter(Boolean).length === 0
  return (
    <section style={card}>
      <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>{title}</h2>
      {isEmpty ? <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{empty}</p> : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
    </section>
  )
}

function GroupRow({ group, busy, act }: { group: Group; busy: boolean; act: (id: string, url: string, body?: Record<string, unknown>) => Promise<void> }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  return (
    <div style={{ border: '1px solid #1e1e1e', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{group.ref}</div>
          <div style={{ fontSize: 12, color: '#9a9a9a' }}>
            {group.profiles?.display_name ?? '—'}{group.profiles?.phone ? ` · ${group.profiles.phone}` : ''} · {group.payment_methods?.name}
          </div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>ID transaction : <span style={{ fontFamily: 'monospace', color: '#cfcfcf' }}>{group.transaction_id}</span></div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>{fmtXAF(group.amount_expected)}</div>
      </div>

      <div style={{ margin: '12px 0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Article</th><th style={th}>Montant</th><th style={th}>Infos client</th></tr></thead>
          <tbody>
            {group.orders.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.plans?.services?.name} <span style={{ color: '#9a9a9a' }}>· {o.plans?.label}</span></td>
                <td style={td}>{fmtXAF(o.amount_expected ?? '0')}</td>
                <td style={td}>{Object.entries(o.checkout_data ?? {}).map(([k, v]) => <div key={k} style={{ fontSize: 12 }}><span style={{ color: '#9a9a9a' }}>{k}: </span>{v}</div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejecting ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <input style={{ ...input, width: 220, height: 34 }} placeholder="Motif du rejet" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Btn kind="danger" disabled={busy || !reason.trim()} onClick={() => act(group.id, `/api/admin/groups/${group.id}/reject`, { reason })}>Confirmer le rejet</Btn>
          <Btn kind="ghost" onClick={() => setRejecting(false)}>Annuler</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn kind="primary" disabled={busy} onClick={() => act(group.id, `/api/admin/groups/${group.id}/approve`)}>Approuver</Btn>
          <Btn kind="danger" disabled={busy} onClick={() => setRejecting(true)}>Rejeter</Btn>
        </div>
      )}
    </div>
  )
}

function ManualRow({ line, busy, act }: { line: LineItem; busy: boolean; act: (id: string, url: string, body?: Record<string, unknown>) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [delivery, setDelivery] = useState('')
  return (
    <div style={{ border: '1px solid #1e1e1e', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{line.plans?.services?.name} <span style={{ color: '#9a9a9a' }}>· {line.plans?.label}</span></div>
          <div style={{ fontSize: 12, color: '#9a9a9a' }}>{line.order_groups?.ref} · {line.profiles?.display_name ?? '—'}{line.profiles?.phone ? ` · ${line.profiles.phone}` : ''}</div>
          <div style={{ marginTop: 6 }}>{Object.entries(line.checkout_data ?? {}).map(([k, v]) => <div key={k} style={{ fontSize: 12 }}><span style={{ color: '#9a9a9a' }}>{k}: </span>{v}</div>)}</div>
        </div>
      </div>
      {open ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
          <textarea style={{ ...textarea, minHeight: 60 }} placeholder={'Données à livrer (optionnel)\nex: email + mot de passe du compte créé'} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn kind="primary" disabled={busy} onClick={() => act(line.id, `/api/admin/orders/${line.id}/complete`, { delivery_data: delivery })}>Marquer livré</Btn>
            <Btn kind="ghost" onClick={() => setOpen(false)}>Annuler</Btn>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#777' }}>Ces données sont chiffrées et affichées une seule fois au client.</p>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}><Btn kind="primary" disabled={busy} onClick={() => setOpen(true)}>Terminer</Btn></div>
      )}
    </div>
  )
}

function BackorderRow({ line, busy, act }: { line: LineItem; busy: boolean; act: (id: string, url: string, body?: Record<string, unknown>) => Promise<void> }) {
  return (
    <div style={{ border: '1px solid #1e1e1e', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 700 }}>{line.plans?.services?.name} <span style={{ color: '#9a9a9a' }}>· {line.plans?.label}</span></div>
        <div style={{ fontSize: 12, color: '#9a9a9a' }}>{line.order_groups?.ref} · {line.profiles?.display_name ?? '—'}</div>
      </div>
      <Btn kind="primary" disabled={busy} onClick={() => act(line.id, `/api/admin/orders/${line.id}/retry-fulfillment`)}>Relivrer</Btn>
    </div>
  )
}
