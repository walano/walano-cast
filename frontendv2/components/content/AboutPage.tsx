'use client'
// About page ported from the v2 prototype (about-page.jsx).

import Link from 'next/link'
import { Icon, useIsMobile } from '@/components/store/primitives'

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div style={{ padding: '24px 28px', background: '#121212', borderRadius: 14 }}>
    <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{value}</div>
    <div style={{ marginTop: 6, fontSize: 13, color: '#9a9a9a', lineHeight: 1.4 }}>{label}</div>
  </div>
)

const Pill = ({ label }: { label: string }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', background: '#161616', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#cfcfcf', whiteSpace: 'nowrap' }}>{label}</div>
)

const BrandPortrait = () => (
  <div style={{ position: 'relative', width: 260, height: 320, borderRadius: 14, overflow: 'hidden', background: '#0f0f0f' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 70% at 50% 35%, rgba(233,16,53,0.45) 0%, transparent 70%), linear-gradient(160deg, #1a0710 0%, #0a0508 100%)' }} />
    <div style={{ position: 'absolute', inset: '14% 18%', borderRadius: 8, overflow: 'hidden', background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 60%), linear-gradient(180deg, #1d0612 0%, #0a0306 100%)' }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        <path d="M30 60l16 110 26-88 30 88 32-88 16 88 22-110" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="166" cy="48" r="14" fill="#e91035" />
      </svg>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent 55%, rgba(233,16,53,0.18) 100%)' }} />
  </div>
)

export function AboutPage({ locale }: { locale: string }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '40px 28px 80px' }}>
      <section style={{ background: '#121212', borderRadius: 24, padding: isMobile ? '36px 24px' : '64px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: isMobile ? 32 : 56, alignItems: 'center', justifyItems: isMobile ? 'center' : 'start' }}>
          <BrandPortrait />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>À PROPOS DE NOUS</div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 40 : 64, lineHeight: 1, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>Bonjour !</h1>
            <p style={{ marginTop: 22, fontSize: isMobile ? 15 : 17, lineHeight: 1.65, color: '#cfcfcf', maxWidth: 580 }}>
              Nous sommes WalanoCast, la marketplace africaine des abonnements numériques. Notre objectif : rendre Netflix, Spotify, ChatGPT, Xbox et les cartes cadeaux accessibles partout en Afrique francophone, en Franc CFA, livrés en moins d&apos;une minute.
            </p>
          </div>
        </div>
        <div style={{ marginTop: isMobile ? 36 : 64, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 16 }}>
          <StatCard value="48 000+" label="Comptes activés depuis 2023" />
          <StatCard value="9" label="Pays d'Afrique francophone couverts" />
          <StatCard value="60 sec" label="Délai moyen d'activation" />
          <StatCard value="4,8 / 5" label="Note moyenne sur +12 400 avis" />
        </div>
      </section>

      <section style={{ marginTop: 32, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: 48, padding: '20px 8px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>Notre histoire</h2>
          <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf' }}>WalanoCast est né à Yaoundé en 2023 d&apos;un constat simple : payer un abonnement Spotify ou Netflix depuis l&apos;Afrique centrale relevait du parcours du combattant.</p>
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf' }}>Trois ans plus tard, nous opérons à Yaoundé, Libreville, Brazzaville et N&apos;Djamena, avec une équipe support locale joignable en français 24/7 sur WhatsApp.</p>
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf' }}>Tous nos packs sont garantis 12 mois, livrés en moins d&apos;une minute et payables en Franc CFA via Wave, Orange Money, MTN MoMo, Visa, Mastercard ou PayPal.</p>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>Ce qu&apos;on fait</h2>
          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Abonnements streaming', 'Comptes IA', 'Crédits gaming', 'Cartes cadeaux', 'Recharges téléphoniques', 'Profils famille', 'Activation instantanée', 'Garantie 12 mois', 'Paiement Franc CFA', 'Support WhatsApp 24/7', 'Comptes mutualisés certifiés', 'Codes officiels', 'Multi-régions'].map((x) => <Pill key={x} label={x} />)}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 56, position: 'relative', overflow: 'hidden', borderRadius: 18, background: 'radial-gradient(80% 120% at 90% 50%, rgba(233,16,53,0.5), transparent 60%), linear-gradient(135deg, #1a0710 0%, #2a0916 100%)', padding: isMobile ? '36px 24px' : '52px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', opacity: 0.7, marginBottom: 12 }}>REJOINS LA COMMUNAUTÉ</div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>Prêt à activer ton premier pack ?</h2>
          <p style={{ marginTop: 14, fontSize: 14.5, color: 'rgba(255,255,255,0.75)' }}>Crée ton compte WalanoCast en 30 secondes et profite de la garantie 12 mois sur chaque achat.</p>
        </div>
        <Link href={`/${locale}/auth`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 52, padding: '0 28px', borderRadius: 10, background: '#fff', color: '#0f0f0f', fontSize: 15, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Créer mon compte
        </Link>
      </section>
    </div>
  )
}
