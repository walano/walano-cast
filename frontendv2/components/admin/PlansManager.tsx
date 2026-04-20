'use client'
// Plans (durées + prix XAF) per service.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, label, th, td, Btn } from '@/components/admin/ui'
import { type Plan, type Service, saveCatalog } from '@/components/admin/catalog-shared'

export default function PlansManager({ plans, services }: { plans: Plan[]; services: Service[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Partial<Plan> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try { await fn(); router.refresh() } catch (e) { setError((e as Error).message) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <Btn kind="primary" onClick={() => setEditing({})}>+ Nouvelle offre</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Service</th><th style={th}>Offre</th><th style={th}>Durée</th>
              <th style={th}>Prix</th><th style={th}>Active</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{services.find((s) => s.id === p.service_id)?.name ?? '?'}</td>
                  <td style={td}>{p.label}</td>
                  <td style={td}>{p.duration_days} j</td>
                  <td style={{ ...td, fontWeight: 700 }}>{Number(p.price_amount).toLocaleString('fr-FR')} {p.price_currency}</td>
                  <td style={td}>{p.is_active ? 'Oui' : 'Non'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><Btn onClick={() => setEditing(p)}>Modifier</Btn></td>
                </tr>
              ))}
              {plans.length === 0 && <tr><td style={td} colSpan={6}>Aucune offre — créez d’abord un service, puis ses offres.</td></tr>}
            </tbody>
          </table>
        </div>
        {editing && <PlanForm plan={editing} services={services} run={run} close={() => setEditing(null)} />}
      </section>
    </div>
  )
}

function PlanForm({ plan, services, run, close }: {
  plan: Partial<Plan>; services: Service[]
  run: (fn: () => Promise<unknown>) => Promise<void>
  close: () => void
}) {
  const isNew = !plan.id
  const [f, setF] = useState({
    service_id: plan.service_id ?? services[0]?.id ?? '',
    label: plan.label ?? '', duration_days: plan.duration_days ?? 30,
    price_amount: plan.price_amount ?? '', details: plan.details ?? '',
    is_active: plan.is_active ?? true,
  })

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #2a2a2a', borderRadius: 10 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>{isNew ? 'Nouvelle offre' : 'Modifier l’offre'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><span style={label}>Service</span>
          <select style={{ ...input, appearance: 'auto' }} value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })}>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></div>
        <div><span style={label}>Libellé (ex: 1 mois)</span>
          <input style={input} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></div>
        <div><span style={label}>Durée (jours)</span>
          <input style={input} type="number" value={f.duration_days} onChange={(e) => setF({ ...f, duration_days: Number(e.target.value) })} /></div>
        <div><span style={label}>Prix (XAF)</span>
          <input style={input} type="number" value={f.price_amount} onChange={(e) => setF({ ...f, price_amount: e.target.value })} /></div>
        <div style={{ gridColumn: '1 / -1' }}><span style={label}>Détails (ex: 4K, 5 écrans)</span>
          <input style={input} value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></div>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, margin: '12px 0' }}>
        <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
        Active
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="primary" onClick={() => run(async () => {
          if (!f.label || !f.price_amount) throw new Error('Libellé et prix requis.')
          await saveCatalog('plans', isNew ? { ...f, price_currency: 'XAF' } : { id: plan.id, ...f }, isNew ? 'POST' : 'PATCH')
          close()
        })}>Enregistrer</Btn>
        <Btn kind="ghost" onClick={close}>Annuler</Btn>
      </div>
    </div>
  )
}
