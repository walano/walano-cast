import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://walanocast.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/fr/', '/en/', '/fr/services/', '/en/services/'],
        disallow: ['/fr/management/', '/en/management/', '/fr/admin/', '/en/admin/', '/fr/account/', '/en/account/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
