import type { Metadata } from 'next'
import { AboutPage } from '@/components/content/AboutPage'

export const metadata: Metadata = { title: 'À propos | WalanoCast' }

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <AboutPage locale={locale} />
}
