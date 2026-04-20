'use client'
// Payment methods CRUD (M-Pesa, Orange Money, …) with per-method instructions.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, textarea, label, th, td, Btn } from '@/components/admin/ui'

type Method = {
  id: string; name: string; instructions: string; receiving_account: string
  txn_id_pattern: string | null; is_active: boolean
}

export default function PaymentMethodsManager({ methods }: { methods: Method[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Partial<Method> | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(f: Partial<Method>, isNew: boolean) {
    setError(null)
    const res = await fetch('/api/admin/catalog/payment_methods', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f),
    })
    const j = await res.json().catch(() => null)
    if (!res.ok) { setError(j?.error ?? 'Erreur.'); return }
    setEditing(null)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Méthodes</h2>
          <Btn kind="primary" onClick={() => setEditing({})}>+ Nouvelle méthode</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Nom</th><th style={th}>Compte destinataire</th>
              <th style={th}>Format ID (regex)</th><th style={th}>Active</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{m.name}</td>
                  <td style={td}>{m.receiving_account}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{m.txn_id_pattern ?? '—'}</td>
                  <td style={td}>{m.is_active ? 'Oui' : 'Non'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><Btn onClick={() => setEditing(m)}>Modifier</Btn></td>
                </tr>
              ))}
              {methods.length === 0 && <tr><td style={td} colSpan={5}>Aucune méthode — ajoutez M-Pesa, Orange Money, …</td></tr>}
            </tbody>
          </table>
        </div>
        {editing && <MethodForm method={editing} onSubmit={submit} close={() => setEditing(null)} />}
      </section>
    </div>
  )
}

function MethodForm({ method, onSubmit, close }: {
  method: Partial<Method>
  onSubmit: (f: Partial<Method>, isNew: boolean) => Promise<void>
  close: () => void
}) {
  const isNew = !method.id
  const [f, setF] = useState({
    name: method.name ?? '', receiving_account: method.receiving_account ?? '',
    instructions: method.instructions ?? '', txn_id_pattern: method.txn_id_pattern ?? '',
    is_active: method.is_active ?? true,
  })

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #2a2a2a', borderRadius: 10 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>{isNew ? 'Nouvelle méthode' : `Modifier — ${method.name}`}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><span style={label}>Nom (ex: Orange Money)</span>
          <input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><span style={label}>Compte destinataire (numéro + nom)</span>
          <input style={input} value={f.receiving_account} onChange={(e) => setF({ ...f, receiving_account: e.target.value })} /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={label}>Instructions de paiement (markdown, montré au client au checkout)</span>
          <textarea style={{ ...textarea, minHeight: 120 }} value={f.instructions}
            placeholder={'1. Composez #150#\n2. Envoyez le montant exact au numéro ci-dessus\n3. Copiez l’ID de transaction du SMS de confirmation'}
            onChange={(e) => setF({ ...f, instructions: e.target.value })} /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={label}>{'Format de l’ID de transaction (regex, optionnel — ex: ^[A-Z0-9.]{8,20}$)'}</span>
          <input style={{ ...input, fontFamily: 'monospace' }} value={f.txn_id_pattern}
            onChange={(e) => setF({ ...f, txn_id_pattern: e.target.value })} /></div>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, margin: '12px 0' }}>
        <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
        Active
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="primary" onClick={() => onSubmit(
          isNew
            ? { ...f, txn_id_pattern: f.txn_id_pattern || null }
            : { id: method.id, ...f, txn_id_pattern: f.txn_id_pattern || null },
          isNew,
        )}>Enregistrer</Btn>
        <Btn kind="ghost" onClick={close}>Annuler</Btn>
      </div>
    </div>
  )
}
