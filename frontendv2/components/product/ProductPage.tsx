'use client'
// Product detail ported from the v2 prototype. Plans come from the Supabase
// catalog. "Acheter maintenant" → /checkout/<service> (mobile money +
// transaction ID flow). Wishlist heart toggles favorite. User rating widget
// mounted below the product.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon, ProductArt, useIsMobile } from '@/components/store/primitives'
import { ProductGrid } from '@/components/store/sections'
import { useCart } from '@/components/store/cart-context'
import { UserRating } from './UserRating'
import type { CardProduct } from '@/lib/v2-adapter'

export type PlanOption = { id: string; label: string; price: number; perMonth: number; bestValue?: boolean; soldOut?: boolean }

const CAT_LABEL: Record<string, string> = {
  film: 'Film & séries', musique: 'Musique', ia: 'Intelligence artificielle', gaming: 'Gaming', cartes: 'Cartes cadeaux', autres: 'Abonnements',
}

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.4
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full
        const isHalf = i === full && half
        return (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24">
            <defs><linearGradient id={`g${i}`} x1="0" x2="1" y1="0" y2="0"><stop offset="50%" stopColor="#fbbf24" /><stop offset="50%" stopColor="#333" /></linearGradient></defs>
            <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z" fill={filled ? '#fbbf24' : isHalf ? `url(#g${i})` : '#2a2a2a'} />
          </svg>
        )
      })}
    </div>
  )
}

const InfoChip = ({ icon, label, sub }: { icon: Parameters<typeof Icon>[0]['name']; label: string; sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0' }}>
    <div style={{ color: 'var(--accent)', flexShrink: 0, paddingTop: 2 }}><Icon name={icon} size={22} /></div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{label}</div>
      <div style={{ fontSize: 12.5, color: '#9a9a9a', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>
    </div>
  </div>
)

const PlanCard = ({ plan, selected, onSelect }: { plan: PlanOption; selected: boolean; onSelect: (id: string) => void }) => {
  const [hover, setHover] = useState(false)
  const soldOut = !!plan.soldOut
  return (
    <button disabled={soldOut} onClick={() => onSelect(plan.id)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative', textAlign: 'left', padding: '18px', borderRadius: 10,
      background: selected ? '#0A0A0A' : (hover && !soldOut ? '#181818' : '#121212'),
      boxShadow: selected ? 'inset 0 0 0 2px var(--accent)' : 'none', cursor: soldOut ? 'not-allowed' : 'pointer',
      opacity: soldOut ? 0.4 : 1, fontFamily: 'inherit', color: '#fff', transition: 'background 0.15s ease', border: 'none',
    }}>
      {plan.bestValue && !soldOut && <div style={{ position: 'absolute', top: -10, right: 14, padding: '3px 10px', background: '#79e84b', color: '#0a1a04', fontSize: 10, fontWeight: 800, borderRadius: 4 }}>MEILLEURE OFFRE</div>}
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{plan.label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 8 }}>{plan.price.toLocaleString('fr-FR')} <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>FCFA</span></div>
      <div style={{ fontSize: 11.5, color: '#9a9a9a', marginTop: 2 }}>{soldOut ? 'Bientôt disponible' : `${plan.perMonth.toLocaleString('fr-FR')} FCFA / mois`}</div>
      {selected && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12" /></svg>
        </div>
      )}
    </button>
  )
}

const PurchaseSidebar = ({ product, plan, locale }: { product: CardProduct; plan: PlanOption; locale: string }) => {
  const { toggleWish, wishlist, addItem } = useCart()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const isMobile = useIsMobile()
  const wished = wishlist.has(product.id)
  const total = plan.price
  // Out of stock is still buyable (backorder) — the user pays and waits.
  const backorder = !!plan.soldOut

  const cartLine = () => ({
    serviceId: product.id, planId: plan.id, serviceName: product.platform,
    planLabel: plan.label, price: plan.price, logo: product.icon, cat: product.cat,
  })
  const buyNow = () => {
    setBusy(true)
    addItem(cartLine(), { silent: true })
    router.push(`/${locale}/checkout`)
  }
  const addToCart = () => addItem(cartLine())

  return (
    <aside style={isMobile ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, background: '#0f0f0f', borderTop: '1px solid #1f1f1f', maxHeight: '72vh', overflowY: 'auto', boxShadow: '0 -10px 28px rgba(0,0,0,0.55)' } : { position: 'sticky', top: 100, alignSelf: 'start' }}>
      <div style={{ padding: isMobile ? '14px 16px 16px' : '8px 0 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: isMobile ? 4 : 8 }}>OFFRE WALANOCAST</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: '#fff' }}>{total.toLocaleString('fr-FR')} <span style={{ fontSize: isMobile ? 14 : 18, opacity: 0.7, fontWeight: 700 }}>FCFA</span></span>
        </div>
        <div style={{ marginBottom: isMobile ? 12 : 24 }} />

        <div style={{ padding: isMobile ? '10px 14px' : '14px 16px', background: '#161616', borderRadius: 10, marginBottom: isMobile ? 10 : 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12" /></svg>
          </div>
          <div style={{ fontSize: 13 }}><span style={{ color: '#9a9a9a' }}>Sélectionné :</span> <span style={{ color: '#fff', fontWeight: 700 }}>{plan.label}</span></div>
        </div>

        {backorder && (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#eab308', marginBottom: 10 }}>
            Disponible sur commande — livré dès réapprovisionnement.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: isMobile ? 10 : 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={buyNow} disabled={busy} style={{
              flex: 1, height: isMobile ? 48 : 52, borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.6 : 1,
            }}>{busy ? '…' : 'Acheter maintenant'}</button>
            <button onClick={() => toggleWish(product.id)} aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'} style={{
              width: isMobile ? 48 : 52, height: isMobile ? 48 : 52, borderRadius: 10, border: 'none',
              background: wished ? 'var(--accent)' : '#fff', color: wished ? '#fff' : '#0f0f0f',
              cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.15s ease, color 0.15s ease',
            }}><Icon name="heart" size={20} stroke={wished ? 0 : 1.75} /></button>
          </div>
          <button onClick={addToCart} disabled={busy} style={{
            width: '100%', height: isMobile ? 46 : 50, borderRadius: 10, border: 'none', background: '#161616', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Ajouter au panier</button>
        </div>

        {!isMobile && (
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #1f1f1f' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Paiement mobile money</div>
            <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 14 }}>Payez avec votre opérateur, collez l’ID de transaction, votre commande est validée par notre équipe.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Orange Money', 'MTN MoMo', 'Wave', 'Airtel Money'].map((m) => (
                <span key={m} style={{ fontSize: 11, fontWeight: 700, color: '#bdbdbd', padding: '6px 10px', background: '#161616', borderRadius: 6 }}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

const DescriptionBlock = ({ product }: { product: CardProduct }) => {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const sections = [
    { h: 'Activation guidée', t: "À l'achat, tu reçois immédiatement par e-mail tes identifiants et un guide d'activation pas-à-pas (3 minutes maximum)." },
    { h: 'Garantie 12 mois', t: 'En cas de panne, notre équipe te remplace ton accès gratuitement. Réponse sous 5 minutes via WhatsApp ou Telegram.' },
    { h: 'Paiement local', t: 'Payable en Franc CFA via Wave, Orange Money, MTN MoMo, Visa, Mastercard ou PayPal.' },
  ]
  const visible = open ? sections : sections.slice(0, 1)
  return (
    <section style={{ marginTop: isMobile ? 40 : 64 }}>
      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Description du produit</h2>
      <div style={{ background: '#121212', borderRadius: 12, padding: isMobile ? '24px 20px' : '40px 48px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 18 }}>{product.platform}{product.name ? ` · ${product.name}` : ''}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Stars rating={4.6} /><span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>4,6</span><span style={{ fontSize: 13, color: '#9a9a9a' }}>· basé sur 1 248 avis vérifiés</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: '#cfcfcf', margin: 0, whiteSpace: 'pre-wrap' }}>
          {product.description?.trim()
            ? product.description
            : `${product.platform} c'est un accès officiel livré en moins d'une minute, garanti pendant toute la durée du pack. Compte mutualisé certifié ou code officiel, optimisé pour l'Afrique francophone.`}
        </p>
        <div style={{ marginTop: 28 }}>
          {visible.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{s.h}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#cfcfcf', margin: 0 }}>{s.t}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setOpen(!open)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '8px 0' }}>{open ? 'Voir moins' : 'Lire la suite'}</button>
        </div>
      </div>
    </section>
  )
}

const SpecsTable = ({ product }: { product: CardProduct }) => {
  const isMobile = useIsMobile()
  const rows: [string, string][] = [
    ['Catégorie', CAT_LABEL[product.cat] ?? product.cat],
    ['Plateforme', product.platform],
    ['Type', product.cat === 'cartes' ? 'Code numérique' : 'Compte premium'],
    ['Activation', 'Compte mutualisé certifié'],
    ['Livraison', 'Instantanée par e-mail (60 secondes)'],
    ['Garantie', '12 mois, remplacement gratuit en cas de panne'],
    ['Devise', 'Franc CFA (XAF)'],
  ]
  return (
    <section style={{ marginTop: isMobile ? 28 : 32 }}>
      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Détails du produit</h2>
      <div style={{ background: '#121212', borderRadius: 12, padding: isMobile ? '12px 20px' : '32px 48px' }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '200px 1fr', gap: isMobile ? 4 : 24, padding: '14px 0', borderBottom: i < rows.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
            <div style={{ fontSize: 13.5, color: '#9a9a9a', fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

const ProductTop = ({ product }: { product: CardProduct }) => {
  const isMobile = useIsMobile()
  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '480px 1fr', gap: isMobile ? 20 : 40, marginTop: 16 }}>
        <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 14, overflow: 'hidden' }}>
          <ProductArt initials={product.initials} category={product.cat} idx={product.idx} icon={product.icon} banner={product.banner} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 36, lineHeight: 1.15, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{product.platform}{product.name ? ` · ${product.name}` : ''}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <Stars rating={4.6} /><span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>4,6</span><span style={{ fontSize: 13, color: '#9a9a9a' }}>· 1 248 avis vérifiés</span>
          </div>
          <div style={{ marginTop: isMobile ? 22 : 28, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px 0' : '18px 28px' }}>
            <InfoChip icon="flash" label="Livraison instantanée" sub="Code reçu en moins de 60 secondes par e-mail." />
            <InfoChip icon="shield" label="Garantie 12 mois" sub="Remplacement gratuit en cas de défaillance." />
            <InfoChip icon="star" label="+1 248 avis vérifiés" sub="Note moyenne 4,6 · commentaires authentiques." />
            <InfoChip icon="headphones" label="Support 24/7" sub="Équipe WalanoCast joignable sur WhatsApp." />
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProductPage({ product, plans, related, locale }: { product: CardProduct; plans: PlanOption[]; related: CardProduct[]; locale: string }) {
  const isMobile = useIsMobile()
  const [planId, setPlanId] = useState(plans.find((p) => p.bestValue)?.id ?? plans[0]?.id ?? '')
  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0]

  const planGrid = (
    <section style={{ marginTop: 48 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Durée du pack</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10, marginTop: 14 }}>
        {plans.map((p) => <PlanCard key={p.id} plan={p} selected={p.id === planId} onSelect={setPlanId} />)}
      </div>
    </section>
  )

  const relatedBlock = related.length > 0 && (
    <section style={{ marginTop: isMobile ? 40 : 64 }}>
      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 18px' }}>Tu pourrais aussi aimer</h2>
      <ProductGrid products={related.slice(0, 5)} locale={locale} />
    </section>
  )

  const left = (
    <div>
      <ProductTop product={product} />
      {plans.length > 1 && planGrid}
      <DescriptionBlock product={product} />
      <SpecsTable product={product} />
      <section style={{ marginTop: isMobile ? 28 : 32 }}>
        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Ton avis</h2>
        <UserRating productId={product.id} locale={locale} />
      </section>
    </div>
  )

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '0 16px 360px' : '0 28px 40px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '24px 0 8px', fontSize: 13, color: '#888' }}>
        <Link href={`/${locale}`} style={{ color: '#888', textDecoration: 'none' }}>Accueil</Link>
        <Icon name="chevronRight" size={12} />
        <span style={{ color: '#888' }}>{CAT_LABEL[product.cat] ?? product.cat}</span>
        <Icon name="chevronRight" size={12} />
        <span style={{ color: '#fff', fontWeight: 600 }}>{product.platform}</span>
      </nav>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
          {left}
          {relatedBlock}
          {selectedPlan && <PurchaseSidebar product={product} plan={selectedPlan} locale={locale} />}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 56, marginTop: 16 }}>
            {left}
            {selectedPlan && <PurchaseSidebar product={product} plan={selectedPlan} locale={locale} />}
          </div>
          {relatedBlock}
        </>
      )}
    </div>
  )
}
