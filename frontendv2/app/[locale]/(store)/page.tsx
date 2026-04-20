import type { Metadata } from 'next'
import { fetchCatalog, servicesToCardProducts } from '@/lib/catalog'
import { HomeContent } from '@/components/store/HomeContent'
import type { CatOption } from '@/components/store/sections'

export const metadata: Metadata = {
  title: 'WalanoCast | Abonnements numériques à prix réduits',
  description: 'Netflix, Spotify, ChatGPT, gaming et cartes cadeaux, payés en Franc CFA partout en Afrique francophone.',
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const { services, cats } = await fetchCatalog()
  const cards = servicesToCardProducts(services)

  // Only show category tabs that actually have visible services.
  const usedCats = new Set(cards.map((c) => c.cat))
  const catOptions: CatOption[] = cats
    .filter((c) => usedCats.has(c.id))
    .map((c) => ({ id: c.id, label: c.label, icon: c.icon as CatOption['icon'], iconUrl: c.iconUrl }))

  return <HomeContent cards={cards} cats={catOptions} locale={locale} />
}
