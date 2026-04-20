'use client'
// Storefront building blocks ported from the v2 prototype: hero, trust bar,
// category nav, product card/grid, section title, editorial banner.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Icon, ProductArt, useIsMobile } from './primitives'
import { useCart } from './cart-context'
import type { CardProduct } from '@/lib/v2-adapter'

// ── Hero ──────────────────────────────────────────────────────────────────--
type Slide = { eyebrow: string; title: string; subtitle: string; price: string; old: string; cta: string; art: string }

const HeroArt = ({ kind }: { kind: string }) => {
  const palettes: Record<string, string[]> = {
    cinevault: ['#1a0508', '#2a0510', '#e91035', '#ff7a8e'],
    studioai: ['#04121a', '#08203a', '#3b82f6', '#a5d8ff'],
    sonic: ['#0a0612', '#1e0a2a', '#a855f7', '#fcd34d'],
  }
  const p = palettes[kind] || palettes.cinevault
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `radial-gradient(110% 80% at 75% 30%, ${p[2]}33 0%, transparent 55%),
                   radial-gradient(70% 80% at 20% 90%, ${p[3]}22 0%, transparent 60%),
                   linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 60%, ${p[0]} 100%)`,
    }}>
      <div style={{ position: 'absolute', right: '-8%', top: '15%', width: 380, height: 380, borderRadius: '50%', background: p[2], opacity: 0.85 }} />
      <div style={{ position: 'absolute', right: '12%', top: '8%', width: 140, height: 140, borderRadius: '50%', background: p[3], opacity: 0.9 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.4) 40%, transparent 70%)' }} />
    </div>
  )
}

const HeroSlide = ({ slide, isMobile }: { slide: Slide; isMobile: boolean }) => {
  const [ctaHover, setCtaHover] = useState(false)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', flexShrink: 0, overflow: 'hidden' }}>
      <HeroArt kind={slide.art} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ width: '100%', maxWidth: 1480, margin: '0 auto', padding: isMobile ? '24px 20px 50px' : '44px 56px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', color: 'var(--accent)', fontSize: isMobile ? 11 : 12, fontWeight: 700, marginBottom: isMobile ? 12 : 18 }}>{slide.eyebrow}</div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 38 : 64, lineHeight: 0.95, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{slide.title}</h1>
          <p style={{ margin: isMobile ? '10px 0 18px' : '14px 0 24px', fontSize: isMobile ? 14.5 : 18, color: '#c8c8c8', maxWidth: 480 }}>{slide.subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20, flexWrap: 'wrap' }}>
            <button onMouseEnter={() => setCtaHover(true)} onMouseLeave={() => setCtaHover(false)} style={{
              height: isMobile ? 46 : 52, padding: isMobile ? '0 22px' : '0 28px', borderRadius: 10, border: 'none',
              background: ctaHover ? '#fff' : 'var(--accent)', color: ctaHover ? '#0f0f0f' : '#fff',
              fontSize: isMobile ? 14 : 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: ctaHover ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(233,16,53,0.35)', transition: 'background 0.18s ease, color 0.18s ease',
            }}>{slide.cta}</button>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff' }}>{slide.price} <span style={{ fontSize: isMobile ? 13 : 16, opacity: 0.7 }}>FCFA</span></span>
              <span style={{ fontSize: isMobile ? 13 : 15, color: '#888', textDecoration: 'line-through' }}>{slide.old}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const HERO_SLIDES: Slide[] = [
  { eyebrow: 'NOUVEAU · DISPONIBLE DÈS MAINTENANT', title: 'CinéVault 4K', subtitle: 'Un an de films sans pub. Activation en 2 min.', price: '12 500', old: '18 000', cta: 'Acheter maintenant', art: 'cinevault' },
  { eyebrow: 'CASHBACK 25%', title: 'Pack Studio AI', subtitle: 'Génère, traduis, code. Crédits illimités 30 jours.', price: '8 900', old: '11 500', cta: 'Activer le pack', art: 'studioai' },
  { eyebrow: 'EXCLUSIVITÉ WALANO', title: 'Sonic Pass Family', subtitle: "Jusqu'à 6 profils. Musique sans publicité.", price: '6 200', old: '9 000', cta: "Découvrir l'offre", art: 'sonic' },
]

export const Hero = () => {
  const isMobile = useIsMobile()
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(id)
  }, [])
  return (
    <section style={{ padding: 0, margin: 0 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0a', height: isMobile ? 420 : 440 }}>
        <div style={{ display: 'flex', height: '100%', width: '100%', transform: `translateX(-${idx * 100}%)`, transition: 'transform 700ms cubic-bezier(0.65,0,0.35,1)', willChange: 'transform' }}>
          {HERO_SLIDES.map((s, i) => <HeroSlide key={i} slide={s} isMobile={isMobile} />)}
        </div>
        <div style={{ position: 'absolute', bottom: 18, right: isMobile ? 16 : 24, display: 'flex', gap: 6, zIndex: 2 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--accent)' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Trust bar ─────────────────────────────────────────────────────────────--
export const TrustBar = () => {
  const isMobile = useIsMobile()
  const items: { icon: Parameters<typeof Icon>[0]['name']; label: string; sub: string }[] = [
    { icon: 'flash', label: 'Livraison instantanée', sub: 'Codes en moins de 60 sec' },
    { icon: 'shield', label: 'Paiement 100% sécurisé', sub: 'Wave, MoMo, Orange, Visa' },
    { icon: 'star', label: '+12 400 avis vérifiés', sub: 'Note moyenne 4,8 / 5' },
    { icon: 'headphones', label: 'Support 24/7', sub: 'Réponse en moins de 5 min' },
  ]
  return (
    <section style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '40px 16px 12px' : '60px 28px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f' }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '16px 12px' : '22px' }}>
            <div style={{ color: 'var(--accent)', display: 'flex' }}><Icon name={it.icon} size={isMobile ? 20 : 24} /></div>
            <div>
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 700, color: '#fff' }}>{it.label}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#9a9a9a', marginTop: 2 }}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Category nav ──────────────────────────────────────────────────────────--
export type CatOption = {
  id: string
  label: string
  icon: Parameters<typeof Icon>[0]['name']
  iconUrl?: string | null // Admin-uploaded SVG/PNG; wins over the built-in icon.
}

export const CategoryNav = ({ cats, active, onChange }: { cats: CatOption[]; active: string; onChange: (id: string) => void }) => {
  const isMobile = useIsMobile()
  return (
    <section style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '20px 0 14px' : '36px 28px 22px' }}>
      <div className="no-scrollbar" style={{ display: 'flex', gap: isMobile ? 14 : 32, justifyContent: isMobile ? 'flex-start' : 'center', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', padding: isMobile ? '0 16px' : 0 }}>
        {cats.map((c) => {
          const isActive = active === c.id
          return (
            <button key={c.id} onClick={() => onChange(c.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 10px',
              minWidth: isMobile ? 76 : 96, flexShrink: 0, border: 'none', background: 'transparent',
              color: isActive ? '#fff' : '#cfcfcf', cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
            }}>
              <div style={{ color: isActive ? 'var(--accent)' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', width: isMobile ? 24 : 28, height: isMobile ? 24 : 28 }}>
                {c.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.iconUrl} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: isActive ? 'none' : 'grayscale(0.2) brightness(0.95)' }} />
                ) : (
                  <Icon name={c.icon} size={isMobile ? 24 : 28} />
                )}
              </div>
              <span style={{ fontSize: isMobile ? 11.5 : 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</span>
              {isActive && <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, background: 'var(--accent)', borderRadius: 2 }} />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ── Product card ──────────────────────────────────────────────────────────--
export const ProductCard = ({ p, locale }: { p: CardProduct; locale: string }) => {
  const { toggleWish, wishlist, addItem } = useCart()
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [menu, setMenu] = useState(false)
  const [hoverItem, setHoverItem] = useState<'cart' | 'pay' | null>(null)
  const wished = wishlist.has(p.id)

  const cartLine = () => ({
    serviceId: p.id, planId: p.planId!, serviceName: p.platform,
    planLabel: p.planLabel ?? '', price: p.price, logo: p.icon, cat: p.cat,
  })
  const buyNow = () => {
    if (!p.planId) { router.push(`/${locale}/product/${p.id}`); return }
    addItem(cartLine(), { silent: true })
    router.push(`/${locale}/checkout`)
  }
  const addToCart = () => {
    if (!p.planId) { router.push(`/${locale}/product/${p.id}`); return }
    addItem(cartLine())
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#121212',
      transition: 'all 0.18s ease', transform: hover ? 'scale(1.03)' : 'none',
      boxShadow: hover ? '0 16px 30px rgba(0,0,0,0.5)' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      <Link href={`/${locale}/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
          <ProductArt initials={p.initials} category={p.cat} idx={p.idx} icon={p.icon} banner={p.banner} />
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(p.id) }} style={{
            position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(0,0,0,0.55)', color: wished ? 'var(--accent)' : '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hover || wished ? 1 : 0, transition: 'opacity 0.15s ease',
          }}>
            <Icon name="heart" size={16} stroke={wished ? 0 : 1.75} />
          </button>
        </div>
        <div style={{ padding: '14px 14px 0', flex: 1, background: '#121212' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 26, minHeight: 36 }}>{p.platform}{p.name ? ` · ${p.name}` : ''}</div>
        </div>
      </Link>
      <div style={{ position: 'relative', padding: '0 14px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: '#fff' }}>{p.price.toLocaleString('fr-FR')} <span style={{ fontSize: 19, fontWeight: 400 }}>FCFA</span></span>
        <button onClick={() => setMenu((v) => !v)} aria-label="Options d'achat" style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--accent)', color: '#fff',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="cart" size={20} />
        </button>
        {menu && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{
              position: 'absolute', right: 14, bottom: 62, zIndex: 41, minWidth: 200,
              background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 12, padding: 6,
              boxShadow: '0 14px 34px rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <button onClick={() => { setMenu(false); addToCart() }}
                onMouseEnter={() => setHoverItem('cart')} onMouseLeave={() => setHoverItem(null)} style={{
                height: 40, borderRadius: 8, border: 'none', background: hoverItem === 'cart' ? '#2a2a2a' : '#161616', color: '#fff',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', textAlign: 'center', padding: '0 12px',
                transition: 'background 0.15s ease',
              }}>Ajouter au panier</button>
              <button onClick={() => { setMenu(false); buyNow() }}
                onMouseEnter={() => setHoverItem('pay')} onMouseLeave={() => setHoverItem(null)} style={{
                height: 40, borderRadius: 8, border: 'none',
                background: hoverItem === 'pay' ? '#fff' : 'var(--accent)', color: hoverItem === 'pay' ? '#000' : '#fff',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', textAlign: 'center', padding: '0 12px',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}>Acheter Maintenant</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const ProductGrid = ({ products, locale }: { products: CardProduct[]; locale: string }) => {
  const isMobile = useIsMobile()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: isMobile ? 12 : 16 }}>
      {products.map((p) => <ProductCard key={p.id} p={p} locale={locale} />)}
    </div>
  )
}

// ── Section title ─────────────────────────────────────────────────────────--
export const SectionTitle = ({ title, sub, more = 'Tout voir' }: { title: string; sub?: string; more?: string }) => {
  const isMobile = useIsMobile()
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: isMobile ? '28px 0 14px' : '40px 0 18px', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{title}</h2>
        {sub && <div style={{ marginTop: 6, fontSize: isMobile ? 12.5 : 14, color: '#9a9a9a' }}>{sub}</div>}
      </div>
      {more && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>{more} <Icon name="chevronRight" size={14} /></span>}
    </div>
  )
}

// ── Editorial banner ──────────────────────────────────────────────────────--
export const Banner = ({ tag, title, sub, cta, palette = ['#1a0a24', '#3a1456', '#a855f7'] }: { tag: string; title: string; sub: string; cta: string; palette?: string[] }) => {
  const [hover, setHover] = useState(false)
  const isMobile = useIsMobile()
  return (
    <div style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      background: `radial-gradient(80% 120% at 90% 50%, ${palette[2]}55, transparent 60%), linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
      margin: isMobile ? '40px 0 20px' : '64px 0 24px',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: isMobile ? 160 : 220, height: isMobile ? 160 : 220, borderRadius: '50%', background: palette[2], opacity: 0.35 }} />
      <div style={{ position: 'relative', padding: isMobile ? '36px 24px' : '64px 48px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', opacity: 0.7, marginBottom: 14 }}>{tag}</div>
        <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#fff', maxWidth: 600, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.75)', marginTop: 14, maxWidth: 540 }}>{sub}</div>
        <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
          marginTop: isMobile ? 22 : 28, alignSelf: 'flex-start', height: isMobile ? 42 : 46, padding: isMobile ? '0 18px' : '0 22px', borderRadius: 8, border: 'none',
          background: hover ? 'var(--accent)' : '#fff', color: hover ? '#fff' : '#0f0f0f', fontSize: isMobile ? 13.5 : 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.18s ease, color 0.18s ease',
        }}>{cta}</button>
      </div>
    </div>
  )
}
