'use client'
// Order groups with per-item delivery lines: status, next step, one-time reveal,
// backorder waiting message.

import Link from 'next/link'
import { useState } from 'react'

export type UserLine = {
  id: string
  status: string
  amount: number
  serviceName: string
  logo: string | null
  planLabel: string
  checkoutData: Record<string, string>
  accountEmail: string | null
  hasSecret: boolean
  revealed: boolean
  whatsappLink: string
  instructions: string | null
}
export type UserGroup = {
  id: string
  ref: string
  status: string
  amount: number
  rejectReason: string | null
  createdAt: string
  items: UserLine[]
}

const GROUP_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Paiement en attente', color: '#eab308', bg: '#2a2208' },
  awaiting_validation: { label: 'Vérification en cours', color: '#38bdf8', bg: '#0e2438' },
  paid: { label: 'Payé', color: '#22c55e', bg: '#0a2818' },
  rejected: { label: 'Paiement rejeté', color: '#ff5c72', bg: '#2e0d14' },
  expired: { label: 'Expirée', color: '#777', bg: '#1a1a1a' },
}
const LINE_STATUS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'En attente de paiement', color: '#eab308' },
  awaiting_stock: { label: 'En approvisionnement', color: '#f97316' },
  fulfilling: { label: 'En cours de traitement', color: '#a78bfa' },
  fulfilled: { label: 'Livré', color: '#22c55e' },
  expired: { label: 'Expiré', color: '#777' },
}

export default function GroupsList({ groups, locale }: { groups: UserGroup[]; locale: string }) {
  if (groups.length === 0) {
    return (
      <div style={{ background: '#121212', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9a9a9a', fontSize: 15, margin: '0 0 20px' }}>Aucune commande pour le moment.</p>
        <Link href={`/${locale}`} style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>Découvrir les abonnements</Link>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {groups.map((g) => <GroupCard key={g.id} group={g} locale={locale} />)}
    </div>
  )
}

function GroupCard({ group, locale }: { group: UserGroup; locale: string }) {
  const s = GROUP_STATUS[group.status] ?? { label: group.status, color: '#999', bg: '#1a1a1a' }
  return (
    <div style={{ background: '#121212', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Commande {group.ref}</span>
          <span style={{ fontSize: 12, color: '#777', marginLeft: 8 }}>{new Date(group.createdAt).toLocaleDateString('fr-FR')} · {group.amount.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <span style={{ padding: '5px 12px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{s.label}</span>
      </div>

      {(group.status === 'pending_payment' || group.status === 'rejected') && (
        <div style={{ margin: '10px 0 4px' }}>
          {group.rejectReason && <p style={{ fontSize: 13, color: '#ff5c72', margin: '0 0 10px' }}>Motif : {group.rejectReason}</p>}
          <Link href={`/${locale}/checkout?group=${group.id}`} style={{ display: 'inline-block', padding: '11px 20px', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
            {group.status === 'rejected' ? 'Soumettre le bon ID de transaction' : 'Finaliser le paiement'}
          </Link>
        </div>
      )}

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {group.items.map((line) => <LineCard key={line.id} line={line} />)}
      </div>
    </div>
  )
}

function LineCard({ line }: { line: UserLine }) {
  const st = LINE_STATUS[line.status] ?? { label: line.status, color: '#999' }
  const [secret, setSecret] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function reveal() {
    setBusy(true); setError(null)
    const res = await fetch(`/api/orders/${line.id}/reveal`, { method: 'POST' })
    const j = await res.json().catch(() => null)
    setBusy(false)
    if (!res.ok) { setError(j?.error ?? 'Erreur.'); return }
    setSecret(j.secret)
  }

  return (
    <div style={{ background: '#0A0A0A', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {line.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={line.logo} alt="" style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', background: '#161616' }} />
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 9, background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 13 }}>{line.serviceName.slice(0, 2).toUpperCase()}</div>
          )}
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff' }}>{line.serviceName} <span style={{ color: '#9a9a9a', fontWeight: 600, fontSize: 12.5 }}>· {line.planLabel}</span></div>
            <div style={{ fontSize: 12, color: st.color, fontWeight: 700, marginTop: 2 }}>{st.label}</div>
          </div>
        </div>
      </div>

      {line.status === 'awaiting_stock' && (
        <p style={{ fontSize: 13, color: '#cfcfcf', margin: '12px 0 0' }}>
          Nous approvisionnons votre abonnement. Vous serez livré et notifié dès réception.
          {line.whatsappLink && <> Besoin d’aide ? <a href={line.whatsappLink} style={{ color: 'var(--accent)', fontWeight: 700 }}>WhatsApp</a>.</>}
        </p>
      )}
      {line.status === 'fulfilling' && (
        <p style={{ fontSize: 13, color: '#cfcfcf', margin: '12px 0 0' }}>
          Paiement confirmé, votre commande est en préparation.
          {line.whatsappLink && <> <a href={line.whatsappLink} style={{ color: 'var(--accent)', fontWeight: 700 }}>WhatsApp</a>.</>}
        </p>
      )}

      {line.status === 'fulfilled' && (
        <div style={{ marginTop: 12 }}>
          {line.accountEmail && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', marginBottom: 4 }}>Compte à utiliser</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{line.accountEmail}</div>
              {line.checkoutData.profile_name && (
                <div style={{ fontSize: 13, color: '#cfcfcf', marginTop: 4 }}>
                  Profil : <b>{line.checkoutData.profile_name}</b>{line.checkoutData.profile_pin ? <> · PIN : <b>{line.checkoutData.profile_pin}</b></> : null}
                </div>
              )}
            </div>
          )}

          {line.hasSecret && !line.revealed && !secret && (
            <>
              <button onClick={reveal} disabled={busy} style={{ padding: '11px 20px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {busy ? '…' : 'Afficher mon code / mes identifiants'}
              </button>
              <p style={{ fontSize: 12, color: '#eab308', margin: '10px 0 0' }}>⚠ Affiché une seule fois. Soyez prêt à le copier.</p>
            </>
          )}
          {secret && (
            <div style={{ padding: '14px 16px', background: '#161616', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#eab308', marginBottom: 8 }}>⚠ Affiché une seule fois. Copiez-le maintenant</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{secret}</div>
              <button onClick={() => { navigator.clipboard.writeText(secret); setCopied(true) }} style={{ marginTop: 10, padding: '9px 18px', borderRadius: 8, border: 'none', background: copied ? '#0a2818' : '#1e1e1e', color: copied ? '#22c55e' : '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{copied ? '✓ Copié' : 'Copier'}</button>
            </div>
          )}
          {line.hasSecret && line.revealed && !secret && (
            <p style={{ fontSize: 13, color: '#9a9a9a', margin: 0 }}>Code déjà affiché. Un problème ? {line.whatsappLink ? <a href={line.whatsappLink} style={{ color: 'var(--accent)', fontWeight: 700 }}>Contactez-nous sur WhatsApp</a> : 'contactez le support'}.</p>
          )}
          {error && <p style={{ fontSize: 13, color: '#ff5c72', marginTop: 10 }}>{error}</p>}

          {line.instructions && (
            <p style={{ fontSize: 13.5, color: '#cfcfcf', lineHeight: 1.7, margin: '14px 0 0', whiteSpace: 'pre-wrap' }}>
              {line.instructions.split(/(https?:\/\/\S+)/g).map((part, i) =>
                /^https?:\/\//.test(part)
                  ? <a key={i} href={part} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>{part.includes('wa.me') ? 'WhatsApp' : part}</a>
                  : part)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
