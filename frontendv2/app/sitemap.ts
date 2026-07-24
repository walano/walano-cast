import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://walanocast.vercel.app'
const LOCALES = ['fr', 'en']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/about', '/faq', '/legal', '/account']
  const staticRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.7,
    })),
  )

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    // Cookie-less context: plain anon client (public catalog is RLS-readable).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON!,
    )
    const { data: services } = await supabase
      .from('services').select('slug, updated_at').eq('is_active', true).limit(200)
    productRoutes = LOCALES.flatMap((locale) =>
      (services ?? []).map((s) => ({
        url: `${BASE_URL}/${locale}/product/${s.slug}`,
        lastModified: new Date(s.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    )
  } catch {
    // Sitemap without products beats a broken sitemap.
  }

  return [...staticRoutes, ...productRoutes]
}
