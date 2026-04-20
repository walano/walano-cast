'use client'
// Profile form: display name + WhatsApp phone (updates public.profiles,
// column-level grants allow only these two fields).

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const input: React.CSSProperties = {
  width: '100%', height: 46, padding: '0 14px', borderRadius: 10, border: '1px solid #2a2a2a',
  background: '#0a0a0a', color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#9a9a9a', marginBottom: 8 }

export default function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function save() {
    setBusy(true); setMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() || null, phone: phone.trim() || null })
      .eq('id', user.id)
    setBusy(false)
    setMsg(error ? { ok: false, text: 'Erreur. Réessayez.' } : { ok: true, text: 'Profil mis à jour !' })
    if (!error) setTimeout(() => setMsg(null), 2500)
  }

  return (
    <div style={{ background: '#121212', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <span style={label}>Nom affiché</span>
          <input style={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </div>
        <div>
          <span style={label}>Téléphone (WhatsApp) : pour vous joindre au sujet de vos commandes</span>
          <input style={input} type="tel" placeholder="+241 77 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={save} disabled={busy} style={{
            height: 46, padding: '0 26px', borderRadius: 10, border: 'none', background: 'var(--accent)',
            color: '#fff', fontSize: 14, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit',
            opacity: busy ? 0.6 : 1,
          }}>
            {busy ? '…' : 'Enregistrer'}
          </button>
          {msg && <span style={{ fontSize: 13, color: msg.ok ? '#22c55e' : '#ff5c72', fontWeight: 600 }}>{msg.text}</span>}
        </div>
      </div>
    </div>
  )
}
