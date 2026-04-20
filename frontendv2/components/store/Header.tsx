'use client'
// Top red bar: logo, live search (Supabase catalog), wishlist + auth.
// Cart was removed (single-product flow, see cart-context).

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Icon, Logo, ProductArt, useIsMobile, pillBtnStyle } from './primitives'
import { useCart } from './cart-context'
import { createClient } from '@/lib/supabase/client'
import { AccountMenu } from './AccountMenu'
import { type CardProduct } from '@/lib/v2-adapter'

const IconBtn = ({ name, badge, onClick, rotate = 0 }: { name: Parameters<typeof Icon>[0]['name']; badge?: number; onClick?: () => void; rotate?: number }) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', width: 38, height: 38, borderRadius: 8, border: 'none',
        background: 'transparent', color: '#fff', opacity: hover ? 0.7 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'opacity 0.12s ease, transform 0.2s ease', transform: `rotate(${rotate}deg)`,
      }}>
      <Icon name={name} size={20} />
      {badge != null && badge > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16,
          padding: '0 4px', borderRadius: 8, background: '#0f0f0f', color: '#fff',
          fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--accent)',
        }}>{badge}</span>
      )}
    </button>
  )
}

const CAT_LABELS: Record<string, string> = {
  film: 'Film & séries', musique: 'Musique', ia: 'IA', gaming: 'Gaming', cartes: 'Cartes cadeaux', autres: 'Abonnements',
}

export function Header({ locale, userLoggedIn }: { locale: string; userLoggedIn: boolean }) {
  const { wishlist, count } = useCart()
  const [focused, setFocused] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CardProduct[]>([])
  const isMobile = useIsMobile()

  // Live search against the real catalogue (debounced).
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('services')
          .select('id, name, slug, description, logo_url, cover_url, categories ( slug ), plans ( price_amount, is_active )')
          .eq('is_active', true)
          .ilike('name', `%${query.trim()}%`)
          .limit(6)
        setResults((data ?? []).map((s, i) => {
          const activePlans = ((s.plans as { price_amount: string; is_active: boolean }[]) ?? []).filter((p) => p.is_active)
          const cheapest = activePlans.reduce<number | null>(
            (min, p) => (min === null || Number(p.price_amount) < min ? Number(p.price_amount) : min), null)
          const words = s.name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/)
          return {
            id: s.id,
            cat: (s.categories as unknown as { slug: string } | null)?.slug ?? 'autres',
            initials: words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : (s.name.slice(0, 2) || '??').toUpperCase(),
            platform: s.name,
            name: '',
            price: cheapest ?? 0,
            old: null, discount: null, idx: i,
            icon: s.logo_url, banner: s.cover_url, description: s.description,
            planId: null, planLabel: null,
          }
        }))
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => { if (query) setSearchOpen(true) }, [query])

  const onResultClick = () => { setQuery(''); if (isMobile) setSearchOpen(false) }
  const accountHref = userLoggedIn ? `/${locale}/account` : `/${locale}/auth`

  const Results = results.length > 0 && (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
      background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 10, padding: 6,
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 60, maxHeight: 380, overflowY: 'auto',
    }}>
      {results.map((r) => (
        <Link key={r.id} href={`/${locale}/product/${r.id}`} onClick={onResultClick} className="om-search-result"
          style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 12, padding: '10px', borderRadius: 8, textDecoration: 'none', color: '#fff', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 52, aspectRatio: '4 / 3', borderRadius: 6, overflow: 'hidden' }}>
            <ProductArt initials={r.initials} category={r.cat} idx={r.idx} icon={r.icon} banner={r.banner} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.platform} {r.name}</div>
            <div style={{ fontSize: 11.5, color: '#9a9a9a', marginTop: 2 }}>{CAT_LABELS[r.cat] ?? r.cat}</div>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
            {r.price.toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>FCFA</span>
          </div>
        </Link>
      ))}
    </div>
  )

  const searchBar = (
    <div style={{ position: 'relative', maxWidth: isMobile ? '100%' : 720, width: '100%', justifySelf: 'center' }}>
      <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8a8a8a', pointerEvents: 'none' }}>
        <Icon name="search" size={18} />
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isMobile ? 'Rechercher…' : 'Rechercher des abonnements, codes, recharges…'}
        style={{
          width: '100%', height: isMobile ? 40 : 44, paddingLeft: 44, paddingRight: 44,
          borderRadius: 8, border: 'none', background: '#fff', color: '#0f0f0f', fontSize: 14, fontFamily: 'inherit',
          outline: focused ? '3px solid rgba(255,255,255,0.45)' : 'none', transition: 'outline 0.15s ease',
        }}
      />
      {query && (
        <button onClick={() => setQuery('')} aria-label="Effacer" style={{
          position: 'absolute', right: 6, top: isMobile ? 4 : 6, height: 32, width: 32, borderRadius: 6, border: 'none',
          background: 'transparent', color: '#0f0f0f', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      )}
      {Results}
    </div>
  )

  if (isMobile) {
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--accent)', borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}><Logo size={22} /></Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBtn name={searchOpen ? 'plus' : 'search'} onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setQuery('') }} rotate={searchOpen ? 45 : 0} />
              {userLoggedIn
                ? <AccountMenu locale={locale}><IconBtn name="user" /></AccountMenu>
                : <Link href={accountHref}><IconBtn name="user" /></Link>}
              <Link href={`/${locale}/panier`}><IconBtn name="cart" badge={count} /></Link>
            </div>
          </div>
          <div style={{ maxHeight: searchOpen ? 56 : 0, overflow: searchOpen ? 'visible' : 'hidden', transition: 'max-height 0.25s ease, margin-top 0.25s ease', marginTop: searchOpen ? 10 : 0 }}>
            {searchBar}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--accent)', borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '14px 28px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
        <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}><Logo size={26} /></Link>
        {searchBar}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={pillBtnStyle}><Icon name="globe" size={16} /><span style={{ fontWeight: 600, fontSize: 13 }}>FR · XAF</span></button>
          <IconBtn name="heart" badge={wishlist.size} />
          <Link href={`/${locale}/panier`}><IconBtn name="cart" badge={count} /></Link>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.25)', margin: '0 4px' }} />
          {userLoggedIn ? (
            <AccountMenu locale={locale}>
              <span style={{ ...pillBtnStyle, padding: '8px 14px', gap: 8 }}>
                <Icon name="user" size={16} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Mon compte</span>
                <Icon name="chevronDown" size={14} />
              </span>
            </AccountMenu>
          ) : (
            <Link href={accountHref} style={{ ...pillBtnStyle, padding: '8px 14px', gap: 8, textDecoration: 'none' }}>
              <Icon name="user" size={16} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Connexion · <span style={{ opacity: 0.85 }}>Inscription</span></span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
