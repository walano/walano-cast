'use client'
// Home: hero, category nav (client-side filter), product grids grouped by
// category with editorial banners, then the trust bar. Data comes from the
// server page (Supabase catalogue mapped to v2 cards).

import { useMemo, useState } from 'react'
import { Hero, TrustBar, CategoryNav, ProductGrid, SectionTitle, Banner, type CatOption } from './sections'
import { useIsMobile } from './primitives'
import type { CardProduct } from '@/lib/v2-adapter'

export function HomeContent({ cards, cats, locale }: { cards: CardProduct[]; cats: CatOption[]; locale: string }) {
  const isMobile = useIsMobile()
  const [active, setActive] = useState('tout')
  const sliceCount = isMobile ? 4 : 5

  const navCats: CatOption[] = [{ id: 'tout', label: 'Tout', icon: 'grid' }, ...cats]

  const byCat = useMemo(() => {
    const m = new Map<string, CardProduct[]>()
    for (const c of cards) {
      if (!m.has(c.cat)) m.set(c.cat, [])
      m.get(c.cat)!.push(c)
    }
    return m
  }, [cards])

  const filtered = active === 'tout' ? cards : cards.filter((c) => c.cat === active)

  return (
    <div>
      <Hero />
      <CategoryNav cats={navCats} active={active} onChange={setActive} />

      <main style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '0 16px 32px' : '0 28px 40px' }}>
        {active === 'tout' ? (
          <>
            {cats.map((cat, i) => {
              const items = (byCat.get(cat.id) ?? []).slice(0, sliceCount)
              if (items.length === 0) return null
              return (
                <div key={cat.id}>
                  <SectionTitle title={cat.label} />
                  <ProductGrid products={items} locale={locale} />
                  {i === 0 && (
                    <Banner
                      tag="GARANTIE WALANOCAST"
                      title="Garantie 12 mois sur tout le catalogue"
                      sub="En cas de panne, ton accès est remplacé en moins de 5 minutes via WhatsApp ou Telegram. Sans condition."
                      cta="En savoir plus"
                      palette={['#250812', '#460b1a', '#e91035']}
                    />
                  )}
                  {i === 1 && (
                    <Banner
                      tag="GUIDE WALANO"
                      title="Pourquoi payer 4× moins cher ?"
                      sub="Tous nos packs sont des comptes mutualisés ou des codes officiels légaux, garantis 12 mois, support 24/7."
                      cta="En savoir plus"
                      palette={['#040c20', '#082045', '#3b82f6']}
                    />
                  )}
                </div>
              )
            })}
            {cards.length === 0 && (
              <div style={{ padding: 80, textAlign: 'center', color: '#888', border: '1px dashed #222', borderRadius: 12, marginTop: 24 }}>
                Catalogue indisponible pour le moment. Réessayez dans un instant.
              </div>
            )}
          </>
        ) : (
          <>
            <SectionTitle title={navCats.find((c) => c.id === active)?.label ?? ''} more="" />
            {filtered.length > 0 ? (
              <ProductGrid products={filtered} locale={locale} />
            ) : (
              <div style={{ padding: 80, textAlign: 'center', color: '#888', border: '1px dashed #222', borderRadius: 12 }}>
                Aucun produit dans cette catégorie.
              </div>
            )}
          </>
        )}
      </main>

      <TrustBar />
    </div>
  )
}
