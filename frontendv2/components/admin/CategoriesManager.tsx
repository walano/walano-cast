'use client'
// Categories: edit name, description, post-payment instructions, checkout
// fields (JSON). delivery_type/inventory_kind lock once orders exist
// (enforced server-side).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, textarea, label, th, td, Btn } from '@/components/admin/ui'
import { type Category, saveCatalog } from '@/components/admin/catalog-shared'

export default function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try { await fn(); router.refresh() } catch (e) { setError((e as Error).message) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ ...card, borderColor: '#4a1520', color: '#ff5c72', fontSize: 13 }}>{error}</div>}
      <section style={card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Nom</th><th style={th}>Livraison</th><th style={th}>Stock</th>
              <th style={th}>Champs checkout</th><th style={th}>Active</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{c.name}<div style={{ color: '#777', fontSize: 11 }}>{c.slug}</div></td>
                  <td style={td}>{c.delivery_type === 'auto_inventory' ? 'Automatique' : 'Manuelle'}</td>
                  <td style={td}>{c.inventory_kind}</td>
                  <td style={td}>{Array.isArray(c.checkout_fields) ? c.checkout_fields.length : 0} champ(s)</td>
                  <td style={td}>{c.is_active ? 'Oui' : 'Non'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <Btn onClick={() => setEditing(c)}>Modifier</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editing && <CategoryForm category={editing} run={run} close={() => setEditing(null)} />}
      </section>
    </div>
  )
}

function CategoryForm({ category, run, close }: {
  category: Category
  run: (fn: () => Promise<unknown>) => Promise<void>
  close: () => void
}) {
  const [f, setF] = useState({
    name: category.name,
    description: category.description ?? '',
    post_payment_instructions: category.post_payment_instructions ?? '',
    checkout_fields: JSON.stringify(category.checkout_fields ?? [], null, 2),
    is_active: category.is_active,
  })

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #2a2a2a', borderRadius: 10 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Modifier — {category.name}</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <div><span style={label}>Nom</span>
          <input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><span style={label}>Description (visible client)</span>
          <textarea style={textarea} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div><span style={label}>Instructions après paiement — placeholders : {'{{order_ref}}'}, {'{{whatsapp_link}}'}, champs checkout</span>
          <textarea style={textarea} value={f.post_payment_instructions} onChange={(e) => setF({ ...f, post_payment_instructions: e.target.value })} /></div>
        <div><span style={label}>Champs checkout (JSON — key, label, type: text/email/pin/phone, required, max/digits)</span>
          <textarea style={{ ...textarea, fontFamily: 'monospace', fontSize: 12 }} value={f.checkout_fields}
            onChange={(e) => setF({ ...f, checkout_fields: e.target.value })} /></div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Active
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn kind="primary" onClick={() => run(async () => {
            let fields: unknown
            try { fields = JSON.parse(f.checkout_fields) } catch { throw new Error('JSON des champs checkout invalide.') }
            await saveCatalog('categories', {
              id: category.id, name: f.name, description: f.description,
              post_payment_instructions: f.post_payment_instructions,
              checkout_fields: fields, is_active: f.is_active,
            }, 'PATCH')
            close()
          })}>Enregistrer</Btn>
          <Btn kind="ghost" onClick={close}>Annuler</Btn>
        </div>
      </div>
    </div>
  )
}
