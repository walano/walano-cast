'use client'
// Legal / policy hub ported from the v2 prototype (policy-page.jsx).

import Link from 'next/link'
import { useState } from 'react'
import { Icon, useIsMobile } from '@/components/store/primitives'

const POLICY_SECTIONS = [
  { id: 'terms', label: 'Conditions générales' },
  { id: 'privacy', label: 'Politique de confidentialité' },
  { id: 'cookies', label: 'Notice cookies' },
  { id: 'cards', label: 'Conditions des cartes cadeaux' },
  { id: 'renew', label: 'Renouvellement automatique' },
]

type Block = { type: 'p' | 'h' | 'list'; text?: string; items?: string[] }
type Doc = { title: string; version: string; blocks: Block[] }

const POLICY_CONTENT: Record<string, Doc> = {
  privacy: {
    title: 'Politique de confidentialité',
    version: 'Version 2.1, dernière mise à jour 2026-04-12',
    blocks: [
      { type: 'p', text: 'WalanoCast SARL explique ici comment nous traitons tes données personnelles lorsque tu utilises notre site, notre application et nos services, conformément à la loi camerounaise n° 2010/012 et au RGPD.' },
      { type: 'p', text: 'Nous te demandons ton consentement explicite à l’utilisation des cookies dès ta première visite.' },
      { type: 'h', text: 'Données que nous collectons' },
      { type: 'p', text: 'Lors de la création d’un compte : nom complet, e-mail, téléphone et pays. Lors d’un achat : moyen de paiement (numéro masqué, opérateur) et historique de commandes.' },
      { type: 'p', text: 'Nous ne stockons jamais les codes PIN Mobile Money ni les numéros complets de carte bancaire : ces informations sont chiffrées et protégées.' },
      { type: 'h', text: 'Tes droits' },
      { type: 'list', items: ['accès à tes données', 'rectification', 'effacement', 'opposition au marketing direct', 'portabilité'] },
    ],
  },
  terms: {
    title: 'Conditions générales de vente et d’utilisation',
    version: 'Version 3.0, dernière mise à jour 2026-03-01',
    blocks: [
      { type: 'p', text: 'Les présentes conditions s’appliquent à toute commande passée sur WalanoCast. Toute commande implique l’adhésion sans réserve aux présentes conditions.' },
      { type: 'h', text: 'Article 1 · Objet' },
      { type: 'p', text: 'WalanoCast est une marketplace de produits numériques destinée aux particuliers résidant en Afrique francophone (zones CEMAC et UEMOA).' },
      { type: 'h', text: 'Article 2 · Prix et paiement' },
      { type: 'p', text: 'Tous les prix sont en Franc CFA (XAF), taxes incluses. Paiement par Wave, Orange Money, MTN MoMo, Moov Money, Visa, Mastercard ou PayPal.' },
      { type: 'h', text: 'Article 3 · Garantie et remplacement' },
      { type: 'p', text: 'Chaque pack est garanti 12 mois. En cas de défaillance, WalanoCast remplace le produit sous 5 minutes via WhatsApp ou Telegram.' },
    ],
  },
}

const DEFAULT_DOC: Doc = {
  title: 'Document en cours de mise à jour',
  version: 'Cette section est en cours de rédaction.',
  blocks: [
    { type: 'p', text: 'Notre équipe juridique finalise cette section. Pour une information immédiate : privacy@walanocast.com.' },
    { type: 'p', text: 'En attendant, consulte les "Conditions générales" et la "Politique de confidentialité".' },
  ],
}

export function PolicyPage({ locale }: { locale: string }) {
  const isMobile = useIsMobile()
  const [activeId, setActiveId] = useState('privacy')
  const data = POLICY_CONTENT[activeId] || DEFAULT_DOC
  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '40px 28px 80px' }}>
      <section style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: 'radial-gradient(60% 120% at 95% 50%, rgba(233,16,53,0.35), transparent 60%), linear-gradient(135deg, #1a0710 0%, #0f0f0f 70%)', padding: isMobile ? '36px 24px' : '52px 56px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>CENTRE LÉGAL · WALANOCAST</div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 48, lineHeight: 1.05, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', maxWidth: 760 }}>Tous nos documents juridiques au même endroit.</h1>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', maxWidth: 640 }}>Conditions générales, confidentialité, cookies, garantie et conditions des programmes partenaires. Mis à jour régulièrement.</p>
      </section>

      <section style={{ marginTop: 32, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: 32, alignItems: 'start' }}>
        <aside style={{ position: isMobile ? 'static' : 'sticky', top: 100, background: '#121212', borderRadius: 14, padding: 10 }}>
          {POLICY_SECTIONS.map((s) => {
            const active = s.id === activeId
            return (
              <button key={s.id} onClick={() => setActiveId(s.id)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: active ? 'rgba(233,16,53,0.10)' : 'transparent', color: active ? 'var(--accent)' : '#cfcfcf', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 700 : 500, fontFamily: 'inherit', marginBottom: 2 }}>{s.label}</button>
            )
          })}
        </aside>

        <div style={{ background: '#121212', borderRadius: 14, padding: isMobile ? '28px 22px' : '40px 56px' }}>
          <div style={{ fontSize: 12.5, color: '#9a9a9a', marginBottom: 8, fontWeight: 600 }}>{data.version}</div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{data.title}</h2>
          <div style={{ marginTop: 28 }}>
            {data.blocks.map((b, i) => {
              if (b.type === 'h') return <h3 key={i} style={{ margin: '36px 0 14px', fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{b.text}</h3>
              if (b.type === 'list') return <ol key={i} style={{ margin: '12px 0 18px', padding: '0 0 0 22px', fontSize: 14.5, lineHeight: 1.8, color: '#cfcfcf' }}>{b.items!.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{it}</li>)}</ol>
              return <p key={i} style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.75, color: '#cfcfcf' }}>{b.text}</p>
            })}
          </div>
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>Une question sur ce document ? <a href="mailto:legal@walanocast.com" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>legal@walanocast.com</a></div>
            <Link href={`/${locale}/faq`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Voir la FAQ <Icon name="chevronRight" size={14} /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
