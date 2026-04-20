import type { Metadata } from 'next'
import { FaqPage } from '@/components/content/FaqPage'

export const metadata: Metadata = { title: "Centre d'aide | WalanoCast" }

export default function Faq() {
  return <FaqPage />
}
