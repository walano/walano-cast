'use client'
// Site footer ported from the v2 prototype. Links are locale-aware.

import Link from 'next/link'
import { Logo } from './primitives'
import { useIsMobile } from './primitives'

export function Footer({ locale }: { locale: string }) {
  const isMobile = useIsMobile()
  const groups: { t: string; l: [string, string][] }[] = [
    { t: 'WalanoCast', l: [['À propos', `/${locale}/about`], ['Carrières', '#'], ['Presse', '#'], ['Affiliation', '#']] },
    { t: 'Support', l: [["Centre d'aide", `/${locale}/faq`], ['Statut', '#'], ['Nous contacter', `/${locale}/faq`], ['Garantie', `/${locale}/faq`]] },
    { t: 'Acheter', l: [['Cartes cadeaux', `/${locale}`], ['Abonnements', `/${locale}`], ['Recharges', `/${locale}`], ['Gaming', `/${locale}`]] },
    { t: 'Communauté', l: [['Discord', '#'], ['Telegram', '#'], ['Twitter', '#'], ['Instagram', '#']] },
  ]
  return (
    <footer style={{ marginTop: isMobile ? 48 : 80, borderTop: '1px solid #1f1f1f', background: '#0a0a0a' }}>
      <div style={{
        maxWidth: 1480, margin: '0 auto', padding: isMobile ? '32px 16px 16px' : '40px 28px 20px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr 1fr', gap: isMobile ? 24 : 32,
      }}>
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <Logo size={24} />
          <p style={{ fontSize: 13, color: '#888', marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>
            La marketplace africaine des abonnements numériques. Activation instantanée, paiement local.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            {['Orange Money', 'MTN MoMo', 'Wave', 'PayPal', 'Visa', 'Mastercard'].map((m) => (
              <span key={m} style={{ padding: '4px 0', fontSize: 12, fontWeight: 600, color: '#bbb' }}>{m}</span>
            ))}
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.t}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 14 }}>{g.t}</div>
            {g.l.map(([label, href]) => (
              <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: '#999', textDecoration: 'none', padding: '5px 0' }}>{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        borderTop: '1px solid #1a1a1a', maxWidth: 1480, margin: '0 auto', padding: isMobile ? '14px 16px' : '16px 28px',
        display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 6, fontSize: 12, color: '#666',
      }}>
        <span>© 2026 WalanoCast · Tous droits réservés</span>
        <span style={{ display: 'inline-flex', gap: 18 }}>
          <Link href={`/${locale}/legal`} style={{ color: '#888', textDecoration: 'none' }}>Confidentialité</Link>
          <Link href={`/${locale}/legal`} style={{ color: '#888', textDecoration: 'none' }}>Conditions</Link>
          <Link href={`/${locale}/faq`} style={{ color: '#888', textDecoration: 'none' }}>Aide</Link>
        </span>
      </div>
    </footer>
  )
}
