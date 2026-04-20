import type { Currency } from '@/types/database'

export interface GeoResult {
  countryCode: string
  currency: Currency
  gateway: 'ebilling' | 'paystack'
}

const COUNTRY_MAP: Record<string, GeoResult> = {
  GA: { countryCode: 'GA', currency: 'XAF', gateway: 'ebilling' },  // Gabon
  CM: { countryCode: 'CM', currency: 'XAF', gateway: 'ebilling' },  // Cameroon
  CG: { countryCode: 'CG', currency: 'XAF', gateway: 'ebilling' },  // Congo
  GH: { countryCode: 'GH', currency: 'GHS', gateway: 'paystack' },  // Ghana
}

const DEFAULT: GeoResult = { countryCode: 'US', currency: 'USD', gateway: 'paystack' }

export async function detectGeo(ip?: string): Promise<GeoResult> {
  try {
    const url = ip
      ? `${process.env.GEO_IP_API_URL}/${ip}?fields=countryCode`
      : `${process.env.GEO_IP_API_URL}?fields=countryCode`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    return COUNTRY_MAP[data.countryCode] ?? DEFAULT
  } catch {
    return DEFAULT
  }
}
