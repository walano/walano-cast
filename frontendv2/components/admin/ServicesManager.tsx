'use client'
// Services (Netflix, Spotify, …): create/edit, category, logos, ordering.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { card, input, textarea, label, th, td, Btn } from '@/components/admin/ui'
import { type Category, type Service, saveCatalog, slugify } from '@/components/admin/catalog-shared'

export default function ServicesManager({ services, categories }: {
  services: Service[]; categories: Category[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<Partial<Service> | null>(null)
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
          <Btn kind="primary" onClick={() => setEditing({})}>+ Nouveau service</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Nom</th><th style={th}>Catégorie</th><th style={th}>Actif</th><th style={th}>Ordre</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.name}<div style={{ color: '#777', fontSize: 11 }}>{s.slug}</div></td>
                  <td style={td}>{categories.find((c) => c.id === s.category_id)?.name ?? '?'}</td>
                  <td style={td}>{s.is_active ? 'Oui' : 'Non'}</td>
                  <td style={td}>{s.sort_order}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><Btn onClick={() => setEditing(s)}>Modifier</Btn></td>
                </tr>
              ))}
              {services.length === 0 && <tr><td style={td} colSpan={5}>Aucun service — créez le premier.</td></tr>}
            </tbody>
          </table>
        </div>
        {editing && (
          <ServiceForm service={editing} categories={categories} run={run} close={() => setEditing(null)} />
        )}
      </section>
    </div>
  )
}

function ServiceForm({ service, categories, run, close }: {
  service: Partial<Service>; categories: Category[]
  run: (fn: () => Promise<unknown>) => Promise<void>
  close: () => void
}) {
  const isNew = !service.id
  const [f, setF] = useState({
    name: service.name ?? '', slug: service.slug ?? '',
    category_id: service.category_id ?? categories[0]?.id ?? '',
    description: service.description ?? '', logo_url: service.logo_url ?? '',
    cover_url: service.cover_url ?? '', sort_order: service.sort_order ?? 0,
    is_active: service.is_active ?? true,
    fields_override: service.checkout_fields_override
      ? JSON.stringify(service.checkout_fields_override, null, 2)
      : '',
  })

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #2a2a2a', borderRadius: 10 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>{isNew ? 'Nouveau service' : `Modifier — ${service.name}`}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><span style={label}>Nom</span>
          <input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug })} /></div>
        <div><span style={label}>Slug</span>
          <input style={input} value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></div>
        <div><span style={label}>Catégorie</span>
          <select style={{ ...input, appearance: 'auto' }} value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><span style={label}>Ordre d’affichage</span>
          <input style={input} type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></div>
        <div style={{ gridColumn: '1 / -1' }}><span style={label}>Description</span>
          <textarea style={textarea} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div><span style={label}>Logo (URL — carré)</span>
          <input style={input} value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} /></div>
        <div><span style={label}>Cover (URL — bannière large)</span>
          <input style={input} value={f.cover_url} onChange={(e) => setF({ ...f, cover_url: e.target.value })} /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={label}>
            {'Champs checkout spécifiques (JSON, optionnel — remplace ceux de la catégorie ; ex PIN 5 chiffres : [{"key":"profile_name","label":"Nom du profil","type":"text","max":30,"required":true},{"key":"profile_pin","label":"Code PIN","type":"pin","digits":5,"required":true}])'}
          </span>
          <textarea style={{ ...textarea, fontFamily: 'monospace', fontSize: 12 }}
            placeholder="Vide = hérite de la catégorie"
            value={f.fields_override}
            onChange={(e) => setF({ ...f, fields_override: e.target.value })} />
        </div>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, margin: '12px 0' }}>
        <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
        Actif
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind="primary" onClick={() => run(async () => {
          if (!f.name || !f.slug) throw new Error('Nom et slug requis.')
          let override: unknown = null
          if (f.fields_override.trim()) {
            try { override = JSON.parse(f.fields_override) } catch { throw new Error('JSON des champs checkout invalide.') }
            if (!Array.isArray(override)) throw new Error('Les champs checkout doivent être un tableau JSON.')
          }
          const { fields_override: _drop, ...rest } = f
          void _drop
          const body = { ...rest, checkout_fields_override: override }
          await saveCatalog('services', isNew ? body : { id: service.id, ...body }, isNew ? 'POST' : 'PATCH')
          close()
        })}>Enregistrer</Btn>
        <Btn kind="ghost" onClick={close}>Annuler</Btn>
      </div>
    </div>
  )
}
