'use client'
// Cart page: line items, remove, total, go to checkout.

import Link from 'next/link'
import { useCart } from './cart-context'

export default function PanierView({ locale }: { locale: string }) {
  const { cart, total, removeItem } = useCart()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 24px', fontFamily: 'var(--font-display)' }}>
        Mon panier
      </h1>

      {cart.length === 0 ? (
        <div style={{ background: '#121212', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: '#9a9a9a', fontSize: 15, margin: '0 0 20px' }}>Votre panier est vide.</p>
          <Link href={`/${locale}`} style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
            Découvrir les abonnements
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {cart.map((c) => (
              <div key={c.lineId} style={{ background: '#121212', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt="" style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', background: '#0A0A0A' }} />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff' }}>{c.serviceName.slice(0, 2).toUpperCase()}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{c.serviceName}</div>
                  <div style={{ fontSize: 12.5, color: '#9a9a9a' }}>{c.planLabel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{c.price.toLocaleString('fr-FR')} FCFA</div>
                  <button onClick={() => removeItem(c.lineId)} style={{ background: 'transparent', border: 'none', color: '#777', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>Retirer</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#121212', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{total.toLocaleString('fr-FR')} <span style={{ fontSize: 13, opacity: 0.7 }}>FCFA</span></span>
            </div>
            <Link href={`/${locale}/checkout`} style={{ display: 'block', textAlign: 'center', height: 52, lineHeight: '52px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
              Passer la commande
            </Link>
            <Link href={`/${locale}`} style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#9a9a9a', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Continuer mes achats
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
