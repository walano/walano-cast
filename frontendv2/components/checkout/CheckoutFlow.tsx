'use client'
// Basket checkout. Step 1: per-line checkout fields + payment method +
// Commander/PayPal (all under the Récapitulatif on desktop). Step 2: payment
// instructions + transaction ID. Step 3: confirmation. ?group= resumes at 2.

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/components/store/primitives'
import { useCart, type CartItem } from '@/components/store/cart-context'
import type { CheckoutField } from '@/lib/wc/checkout-fields'

export type PlanInfo = {
  planId: string; serviceId: string; serviceName: string; logo: string | null
  planLabel: string; price: number; details: string | null
  available: number; checkoutFields: CheckoutField[]
}
type Method = { id: string; name: string; instructions: string; receiving_account: string; kind: string }
export type ResumeGroup = {
  id: string; ref: string; amount: number; rejectReason: string | null
  method: Method | null
}

const XAF_PER_EUR = 655.957
const toEur = (xaf: number) => (Math.round((xaf / XAF_PER_EUR) * 100) / 100).toFixed(2)

const box: React.CSSProperties = { background: '#121212', borderRadius: 12, padding: 20, marginBottom: 16 }
const input: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: '1px solid #2a2a2a',
  background: '#0A0A0A', color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#9a9a9a', marginBottom: 8 }

export default function CheckoutFlow({ locale, plans, methods, paypalClientId, paypalMeHandle, paypalMethodId, resume }: {
  locale: string
  plans: Record<string, PlanInfo>
  methods: Method[]
  paypalClientId: string | null
  paypalMeHandle: string | null
  paypalMethodId: string | null
  resume: ResumeGroup | null
}) {
  const { cart, removeItem, clearCart } = useCart()
  const router = useRouter()
  const isMobile = useIsMobile(960)

  const [step, setStep] = useState<1 | 2 | 3>(resume ? 2 : 1)
  const [methodId, setMethodId] = useState(methods[0]?.id ?? '')
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paidDirect, setPaidDirect] = useState(false)
  const [txnId, setTxnId] = useState('')

  const [group, setGroup] = useState<{ id: string; ref: string; amount: number; rejectReason?: string | null }>(
    resume ? { id: resume.id, ref: resume.ref, amount: resume.amount, rejectReason: resume.rejectReason } : { id: '', ref: '', amount: 0 },
  )
  const [payMethod, setPayMethod] = useState<Method | null>(resume?.method ?? null)
  const [payVia, setPayVia] = useState<'manual' | 'paypalme'>(
    resume?.method?.kind === 'paypal' ? 'paypalme' : 'manual',
  )

  const meHandle = (paypalMeHandle ?? '').replace(/^https?:\/\//, '').replace(/^paypal\.me\//, '')
  const paypalMeAvailable = !paypalClientId && !!meHandle && !!paypalMethodId

  // resolve cart lines against the authoritative catalog
  const lines = useMemo(() => cart.map((c) => ({ cart: c, info: plans[c.planId] ?? null })), [cart, plans])
  const total = lines.reduce((s, l) => s + (l.info?.price ?? 0), 0)
  const unavailable = lines.some((l) => !l.info)

  const fieldsValid = useMemo(() => lines.every(({ cart: c, info }) => {
    if (!info) return false
    return info.checkoutFields.every((f) => {
      const v = (fieldValues[c.lineId]?.[f.key] ?? '').trim()
      if (!v) return f.required === false
      if (f.type === 'pin') return new RegExp(`^[0-9]{${f.digits ?? 4}}$`).test(v)
      return true
    })
  }), [lines, fieldValues])

  const canOrder = lines.length > 0 && !unavailable && fieldsValid

  function buildItems() {
    return lines.map(({ cart: c }) => ({ plan_id: c.planId, checkout_data: fieldValues[c.lineId] ?? {} }))
  }
  function setField(lineId: string, key: string, value: string) {
    setFieldValues((s) => ({ ...s, [lineId]: { ...s[lineId], [key]: value } }))
  }

  async function createGroup(viaPaypalMe = false) {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: viaPaypalMe ? paypalMethodId : methodId, items: buildItems() }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) { setError(j?.error ?? 'Erreur. Réessayez.'); return }
      setGroup({ id: j.group.id, ref: j.group.ref, amount: Number(j.group.amount_expected) })
      setPayVia(viaPaypalMe ? 'paypalme' : 'manual')
      setPayMethod(viaPaypalMe ? null : (methods.find((m) => m.id === methodId) ?? null))
      clearCart()
      setStep(2)
      window.scrollTo({ top: 0 })
    } catch { setError('Connexion impossible. Vérifiez votre réseau.') }
    finally { setBusy(false) }
  }

  async function submitTxn() {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/groups/${group.id}/submit-txn`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: txnId }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) { setError(j?.error ?? 'Erreur. Réessayez.'); return }
      setStep(3)
      window.scrollTo({ top: 0 })
    } catch { setError('Connexion impossible. Vérifiez votre réseau.') }
    finally { setBusy(false) }
  }

  const showSummary = !isMobile && step !== 3

  // payment method + Commander + PayPal — rendered under the Récapitulatif on
  // desktop, inline at end of step 1 on mobile
  const paymentBlock = step === 1 && (
    <div>
      <div style={{ ...box, marginBottom: 12 }}>
        <span style={labelStyle}>Méthode de paiement</span>
        <div style={{ display: 'grid', gap: 8 }}>
          {methods.map((m) => (
            <button key={m.id} onClick={() => setMethodId(m.id)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: '#0A0A0A', boxShadow: m.id === methodId ? 'inset 0 0 0 2px var(--accent)' : 'inset 0 0 0 1px #242424',
              color: '#fff', fontWeight: 700, fontSize: 14.5,
            }}>{m.name}</button>
          ))}
          {methods.length === 0 && !paypalClientId && !paypalMeAvailable && (
            <div style={{ padding: '14px 16px', borderRadius: 10, background: '#2a2208', color: '#eab308', fontSize: 13, fontWeight: 600 }}>
              Paiement momentanément indisponible.
            </div>
          )}
        </div>
      </div>

      {methods.length > 0 && (
        <button disabled={busy || !canOrder} onClick={() => createGroup(false)} style={{
          width: '100%', height: 50, borderRadius: 10, border: 'none',
          background: canOrder ? 'var(--accent)' : '#2a2a2a', color: canOrder ? '#fff' : '#777',
          fontSize: 15, fontWeight: 800, cursor: busy ? 'wait' : canOrder ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', opacity: busy ? 0.6 : 1, transition: 'background 0.15s ease, color 0.15s ease',
        }}>{busy ? '…' : 'Commander'}</button>
      )}

      {(paypalClientId || paypalMeAvailable) && (
        <div style={{ marginTop: methods.length > 0 ? 10 : 0 }}>
          {methods.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 10px' }}>
              <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
              <span style={{ fontSize: 11, color: '#777', fontWeight: 700 }}>OU AVEC PAYPAL</span>
              <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
            </div>
          )}
          {paypalClientId ? (
            <PayPalButtons
              clientId={paypalClientId} disabled={busy || !canOrder} getItems={buildItems}
              onSuccess={(g) => { setGroup({ id: g.id, ref: g.ref, amount: Number(g.amount_expected) }); setPaidDirect(true); clearCart(); setStep(3); window.scrollTo({ top: 0 }) }}
              onError={(m) => setError(m)}
            />
          ) : (
            <button disabled={busy || !canOrder} onClick={() => createGroup(true)} style={{
              width: '100%', height: 46, borderRadius: 10, border: 'none',
              background: canOrder ? '#ffc439' : '#2a2a2a', color: canOrder ? '#003087' : '#777',
              fontSize: 15, fontWeight: 800, fontStyle: 'italic',
              cursor: busy ? 'wait' : canOrder ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}>{busy ? '…' : <><span>Pay</span><span style={{ color: canOrder ? '#009cde' : '#777' }}>Pal</span></>}</button>
          )}
        </div>
      )}

      {lines.length > 0 && !fieldsValid && !unavailable && (
        <p style={{ fontSize: 12.5, color: '#eab308', marginTop: 10 }}>Remplissez toutes les informations requises.</p>
      )}
      <p style={{ fontSize: 12, color: '#777', marginTop: 12, lineHeight: 1.5 }}>
        Mobile money : commande valable 24 h, validée par notre équipe. PayPal : livraison immédiate.
        Un article en rupture est commandé puis livré dès réapprovisionnement.
      </p>
    </div>
  )

  return (
    <div style={{ maxWidth: showSummary ? 1060 : 640, margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
        {step === 1 ? 'PANIER' : step === 2 ? 'PAIEMENT' : 'COMMANDE ENVOYÉE'}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 20px', fontFamily: 'var(--font-display)' }}>
        {step === 1 ? 'Finaliser ma commande' : step === 2 ? 'Paiement' : 'Merci !'}
      </h1>

      {error && <div style={{ ...box, border: '1px solid #4a1520', color: '#ff5c72', fontSize: 14 }}>{error}</div>}

      <div style={{ display: showSummary ? 'grid' : 'block', gridTemplateColumns: showSummary ? '1fr 340px' : undefined, gap: showSummary ? 36 : undefined, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          {step === 1 && (
            lines.length === 0 ? (
              <div style={{ ...box, textAlign: 'center', padding: '40px 24px' }}>
                <p style={{ color: '#9a9a9a', fontSize: 15, margin: '0 0 20px' }}>Votre panier est vide.</p>
                <Link href={`/${locale}`} style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>Voir les abonnements</Link>
              </div>
            ) : (
              <>
                {lines.map(({ cart: c, info }) => (
                  <LineItem key={c.lineId} cart={c} info={info}
                    values={fieldValues[c.lineId] ?? {}} setField={(k, v) => setField(c.lineId, k, v)}
                    onRemove={() => removeItem(c.lineId)} />
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <button onClick={clearCart} style={{
                    background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 10, color: '#ff5c72',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '9px 16px',
                  }}>Vider le panier</button>
                </div>
                {!showSummary && paymentBlock}
              </>
            )
          )}

          {step === 2 && (
            <>
              {group.rejectReason && (
                <div style={{ ...box, border: '1px solid #4a1520' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#ff5c72', marginBottom: 4 }}>Paiement rejeté</div>
                  <div style={{ fontSize: 13, color: '#cfcfcf' }}>{group.rejectReason}. Soumettez le bon ID de transaction ci-dessous.</div>
                </div>
              )}
              <div style={box}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: '#9a9a9a', fontWeight: 700 }}>Commande {group.ref}</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{group.amount.toLocaleString('fr-FR')} <span style={{ fontSize: 12, opacity: 0.7 }}>FCFA</span></span>
                </div>
                {payVia === 'paypalme' ? (
                  <>
                    <div style={{ padding: '14px 16px', background: '#0A0A0A', borderRadius: 10, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', marginBottom: 4 }}>Montant à payer via PayPal :</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{toEur(group.amount)} €</div>
                      <div style={{ fontSize: 11.5, color: '#777', marginTop: 2 }}>({group.amount.toLocaleString('fr-FR')} FCFA au taux fixe 655,957 FCFA/€)</div>
                    </div>
                    <a href={`https://paypal.me/${meHandle}/${toEur(group.amount)}EUR`} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 10,
                      background: '#ffc439', color: '#003087', fontSize: 16, fontWeight: 800, fontStyle: 'italic', textDecoration: 'none', marginBottom: 14,
                    }}><span>Payer sur Pay</span><span style={{ color: '#009cde' }}>Pal</span></a>
                    <div style={{ fontSize: 14, color: '#cfcfcf', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {`1. Payez exactement ${toEur(group.amount)} €.\n2. Ouvrez l’activité PayPal, copiez l’ID de transaction.\n3. Collez-le ci-dessous.`}
                    </div>
                  </>
                ) : payMethod && (
                  <>
                    <div style={{ padding: '14px 16px', background: '#0A0A0A', borderRadius: 10, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', marginBottom: 4 }}>Payez via {payMethod.name} au :</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{payMethod.receiving_account}</div>
                    </div>
                    <div style={{ fontSize: 14, color: '#cfcfcf', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{payMethod.instructions}</div>
                  </>
                )}
              </div>
              <div style={box}>
                <span style={labelStyle}>ID de la transaction *</span>
                <input style={{ ...input, fontFamily: 'monospace', textTransform: 'uppercase' }}
                  placeholder="ex: MP240723.1234.A56789" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
                <p style={{ fontSize: 12, color: '#777', marginTop: 10, lineHeight: 1.5 }}>
                  Payez exactement <b style={{ color: '#fff' }}>{group.amount.toLocaleString('fr-FR')} FCFA</b>, puis collez l’ID de transaction du SMS de confirmation.
                </p>
              </div>
              <button disabled={busy || txnId.trim().length < 4} onClick={submitTxn} style={{
                width: '100%', height: 52, borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: 15, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.6 : 1,
              }}>{busy ? '…' : 'J’ai payé, envoyer l’ID de transaction'}</button>
            </>
          )}

          {step === 3 && (
            <div style={{ ...box, textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12" /></svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>{paidDirect ? 'Paiement confirmé !' : 'Transaction envoyée !'}</h2>
              <p style={{ fontSize: 14, color: '#9a9a9a', lineHeight: 1.6, margin: '0 0 24px' }}>
                {paidDirect
                  ? <>Commande <b style={{ color: '#fff' }}>{group.ref}</b> payée via PayPal. Retrouvez vos abonnements ci-dessous.</>
                  : <>Commande <b style={{ color: '#fff' }}>{group.ref}</b>. Notre équipe vérifie votre paiement, vous serez notifié.</>}
              </p>
              <Link href={`/${locale}/abonnements`} style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>Voir mes abonnements</Link>
            </div>
          )}
        </div>

        {showSummary && (
          <aside style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: '#121212', borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Récapitulatif</div>
              {step === 1 ? (
                lines.map(({ cart: c, info }) => (
                  <div key={c.lineId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                    <span style={{ color: '#cfcfcf' }}>{c.serviceName}<span style={{ color: '#777' }}> · {c.planLabel}</span></span>
                    <span style={{ color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>{(info?.price ?? 0).toLocaleString('fr-FR')}</span>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9a9a9a', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <span>Commande</span><span style={{ color: '#fff', fontWeight: 700 }}>{group.ref}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0 2px' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{(step === 1 ? total : group.amount).toLocaleString('fr-FR')} <span style={{ fontSize: 12, opacity: 0.7 }}>FCFA</span></span>
              </div>
            </div>
            {step === 1 && <div style={{ marginTop: 16 }}>{paymentBlock}</div>}
          </aside>
        )}
      </div>
    </div>
  )
}

function LineItem({ cart: c, info, values, setField, onRemove }: {
  cart: CartItem; info: PlanInfo | null
  values: Record<string, string>; setField: (k: string, v: string) => void; onRemove: () => void
}) {
  const backorder = info ? info.available <= 0 : false
  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo} alt="" style={{ width: 40, height: 40, borderRadius: 9, objectFit: 'cover', background: '#0A0A0A' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 9, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff' }}>{c.serviceName.slice(0, 2).toUpperCase()}</div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{c.serviceName}</div>
            <div style={{ fontSize: 12.5, color: '#9a9a9a' }}>{info?.planLabel ?? c.planLabel}{info?.details ? ` · ${info.details}` : ''}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{(info?.price ?? c.price).toLocaleString('fr-FR')} FCFA</div>
          <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: '#777', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>Retirer</button>
        </div>
      </div>

      {!info && <div style={{ marginTop: 10, fontSize: 12.5, color: '#ff5c72', fontWeight: 600 }}>Cet article n’est plus disponible. Retirez-le pour continuer.</div>}
      {backorder && <div style={{ marginTop: 10, fontSize: 12, color: '#eab308', fontWeight: 600 }}>Sur commande — livré dès réapprovisionnement.</div>}

      {info && info.checkoutFields.length > 0 && (
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {info.checkoutFields.map((f) => (
            <div key={f.key}>
              <span style={labelStyle}>{f.label}{f.required !== false ? ' *' : ''}</span>
              <input style={input}
                type={f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'}
                inputMode={f.type === 'pin' ? 'numeric' : undefined}
                maxLength={f.type === 'pin' ? (f.digits ?? 4) : (f.max ?? 100)}
                value={values[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PayPal Smart Buttons (business account) ────────────────────────────────
type PayPalGroup = { id: string; ref: string; amount_expected: string }
declare global {
  interface Window {
    paypal?: { Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void } }
  }
}

function PayPalButtons({ clientId, disabled, getItems, onSuccess, onError }: {
  clientId: string; disabled: boolean
  getItems: () => { plan_id: string; checkout_data: Record<string, string> }[]
  onSuccess: (g: PayPalGroup) => void; onError: (msg: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const itemsRef = useRef(getItems)
  itemsRef.current = getItems

  useEffect(() => {
    if (window.paypal) { setReady(true); return }
    if (document.getElementById('wc-paypal-sdk')) return
    const s = document.createElement('script')
    s.id = 'wc-paypal-sdk'
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture&disable-funding=credit,card`
    s.onload = () => setReady(true)
    s.onerror = () => onError('PayPal n’a pas pu se charger.')
    document.body.appendChild(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  useEffect(() => {
    if (!ready || !ref.current || !window.paypal?.Buttons) return
    const el = ref.current
    el.innerHTML = ''
    const buttons = window.paypal.Buttons({
      style: { layout: 'horizontal', color: 'gold', height: 44, tagline: false },
      createOrder: async () => {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsRef.current() }),
        })
        const j = await res.json().catch(() => null)
        if (!res.ok) { onError(j?.error ?? 'PayPal indisponible.'); throw new Error('create failed') }
        return j.paypal_order_id
      },
      onApprove: async (data: { orderID: string }) => {
        const res = await fetch('/api/paypal/capture', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypal_order_id: data.orderID }),
        })
        const j = await res.json().catch(() => null)
        if (!res.ok) { onError(j?.error ?? 'Échec du paiement PayPal.'); return }
        onSuccess(j.group as PayPalGroup)
      },
      onError: () => onError('Paiement PayPal interrompu.'),
    })
    buttons.render(el)
    return () => { try { buttons.close?.() } catch { /* closed */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div ref={ref} />
      {!ready && <div style={{ height: 44, borderRadius: 10, background: '#1a1a1a' }} />}
    </div>
  )
}
