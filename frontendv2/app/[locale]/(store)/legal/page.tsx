import type { Metadata } from 'next'
import { PolicyPage } from '@/components/content/PolicyPage'

export const metadata: Metadata = { title: 'Centre légal | WalanoCast' }

export default async function Legal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <PolicyPage locale={locale} />
}
