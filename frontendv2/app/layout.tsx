import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "WalanoCast — Marketplace d'abonnements numériques",
  description: 'Netflix, Spotify, ChatGPT, gaming et cartes cadeaux — livraison instantanée, paiement en Franc CFA.',
  openGraph: {
    title: 'WalanoCast',
    siteName: 'WalanoCast',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body style={{ minHeight: '100%', background: '#0f0f0f', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
