'use client'
// FAQ / help center ported from the v2 prototype (faq-page.jsx).

import { useState } from 'react'
import { Icon, useIsMobile } from '@/components/store/primitives'

const FAQ_CATEGORIES: { id: string; icon: Parameters<typeof Icon>[0]['name']; label: string }[] = [
  { id: 'start', icon: 'flash', label: 'Démarrer' },
  { id: 'pay', icon: 'shield', label: 'Paiements & garantie' },
  { id: 'account', icon: 'user', label: 'Activation & comptes' },
  { id: 'cards', icon: 'gift', label: 'Cartes & recharges' },
]

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  start: [
    { q: 'Comment passer ma première commande sur WalanoCast ?', a: 'Choisis un produit, sélectionne la durée du pack, clique sur "Acheter maintenant", paye avec ton moyen préféré et reçois ton code par e-mail en moins d’une minute.' },
    { q: 'Dois-je obligatoirement créer un compte ?', a: 'Un compte WalanoCast te permet de retrouver tes codes et d’activer la garantie 12 mois en un clic.' },
    { q: 'Dans quels pays WalanoCast est-il disponible ?', a: 'Cameroun, Gabon, Congo, Tchad, RCA, Sénégal, Côte d’Ivoire, Mali et Burkina Faso. Paiements en Franc CFA et support local en français garantis.' },
  ],
  pay: [
    { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Wave, Orange Money, MTN MoMo, Moov Money, Visa, Mastercard, American Express et PayPal. Tous les prix sont en Franc CFA (XAF).' },
    { q: 'Mon paiement Mobile Money a échoué, que faire ?', a: 'Vérifie ton solde. Si débité sans validation, contacte-nous sur WhatsApp avec ton ID de transaction. Remboursement automatique sous 24h.' },
    { q: 'Comment fonctionne la garantie 12 mois ?', a: 'Si ton accès est coupé avant la fin du pack, on te remplace gratuitement le compte. Réponse sous 5 minutes via WhatsApp ou Telegram, 24/7.' },
    { q: 'Puis-je obtenir un remboursement ?', a: 'Oui, pour toute commande non livrée ou non activable dans les 24h, sans condition.' },
  ],
  account: [
    { q: 'Combien de temps prend l’activation d’un compte ?', a: 'En moyenne 45 secondes pour les comptes mutualisés, instantanée pour les codes officiels.' },
    { q: 'Puis-je changer le mot de passe du compte mutualisé ?', a: 'Non, les mots de passe sont gérés par WalanoCast pour garantir un accès stable à tous les utilisateurs.' },
    { q: 'Sur combien d’appareils puis-je utiliser mon compte ?', a: 'Cela dépend de la plateforme et du plan. Les détails figurent sur chaque fiche produit.' },
    { q: 'Que faire si mon compte est suspendu ?', a: 'Ouvre une conversation WhatsApp depuis ton tableau de bord, un agent te remplace ton accès sous 5 minutes en moyenne.' },
  ],
  cards: [
    { q: 'Les cartes cadeaux ont-elles une date d’expiration ?', a: 'Non, sauf indication contraire sur la fiche produit.' },
    { q: 'Comment offrir une carte cadeau ?', a: 'À la commande, choisis l’option "Offrir". Tu reçois un PDF habillé à transférer à ton destinataire.' },
    { q: 'Puis-je utiliser une carte multi-régions ?', a: 'Toutes nos cartes sont compatibles monde entier, sauf les recharges Mobile Money qui restent locales.' },
    { q: 'Les recharges de jeux sont-elles instantanées ?', a: 'Oui, les V-Coins, ZGold et ValuePoints sont créditées en moins de 60 secondes après paiement.' },
  ],
}

const FaqRow = ({ item, expanded, onToggle }: { item: { q: string; a: string }; expanded: boolean; onToggle: () => void }) => (
  <div style={{ background: expanded ? 'rgba(233,16,53,0.06)' : '#121212', borderRadius: 12, boxShadow: expanded ? 'inset 0 0 0 1.5px var(--accent)' : 'none', transition: 'background 0.15s ease, box-shadow 0.15s ease' }}>
    <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', boxShadow: `inset 0 0 0 1.5px ${expanded ? 'var(--accent)' : '#3a3a3a'}`, background: expanded ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: expanded ? 'var(--accent)' : '#fff' }}>{item.q}</span>
      <span style={{ width: 28, height: 28, color: expanded ? 'var(--accent)' : '#9a9a9a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease', transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
        <Icon name="plus" size={18} stroke={2} />
      </span>
    </button>
    {expanded && <div style={{ padding: '0 22px 22px 54px', fontSize: 14, lineHeight: 1.65, color: '#cfcfcf' }}>{item.a}</div>}
  </div>
)

const ContactCard = () => (
  <div>
    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', fontFamily: 'var(--font-display)' }}>Tu as toujours une question ?</div>
    <div style={{ marginTop: 12, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, textAlign: 'center', maxWidth: 420, margin: '12px auto 0' }}>Si tu ne trouves pas ta réponse, écris-nous et notre équipe te répond en moins de 5 minutes.</div>
    <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
      <a href="https://wa.me/237600000000" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 16px', background: '#121212', borderRadius: 12, textDecoration: 'none' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="headphones" size={18} /></div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>+237 600 000 000</div>
        <div style={{ fontSize: 11.5, color: '#9a9a9a' }}>WhatsApp · 24/7</div>
      </a>
      <a href="mailto:support@walanocast.com" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 16px', background: '#121212', borderRadius: 12, textDecoration: 'none' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={18} /></div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>support@walanocast.com</div>
        <div style={{ fontSize: 11.5, color: '#9a9a9a' }}>Réponse sous 5 minutes</div>
      </a>
    </div>
  </div>
)

export function FaqPage() {
  const isMobile = useIsMobile()
  const [activeCat, setActiveCat] = useState('pay')
  const [expanded, setExpanded] = useState(0)
  const [search, setSearch] = useState('')
  const [submitHover, setSubmitHover] = useState(false)

  const q = search.trim().toLowerCase()
  const items = q
    ? Object.values(FAQ_DATA).flat().filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))
    : FAQ_DATA[activeCat] || []
  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '40px 28px 80px' }}>
      <section style={{ background: '#121212', borderRadius: 24, padding: isMobile ? '40px 20px' : '72px 28px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 14 }}>CENTRE D&apos;AIDE WALANOCAST</div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 32 : 52, lineHeight: 1.05, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>Bonjour, comment pouvons-nous t&apos;aider ?</h1>

          <div style={{ marginTop: 36, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto', position: 'relative', display: 'flex' }}>
            <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#9a9a9a', pointerEvents: 'none', display: 'flex' }}>
              <Icon name="search" size={18} />
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pose ta question…"
              style={{ flex: 1, height: 56, paddingLeft: 48, paddingRight: isMobile ? 16 : 140, borderRadius: 12, border: 'none', background: '#fff', color: '#0f0f0f', fontSize: 15, fontFamily: 'inherit', outline: 'none' }} />
            {!isMobile && (
              <button onMouseEnter={() => setSubmitHover(true)} onMouseLeave={() => setSubmitHover(false)}
                style={{ position: 'absolute', right: 6, top: 6, height: 44, padding: '0 22px', borderRadius: 8, border: 'none', background: submitHover ? '#fff' : 'var(--accent)', color: submitHover ? '#0f0f0f' : '#fff', boxShadow: submitHover ? 'inset 0 0 0 1.5px #0f0f0f' : 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.18s ease, color 0.18s ease' }}>Rechercher</button>
            )}
          </div>

          <div style={{ marginTop: 28, fontSize: 13.5, color: '#9a9a9a' }}>{q ? `Résultats pour « ${search} »` : 'Choisis une catégorie pour trouver une réponse rapide'}</div>
          <div style={{ marginTop: 22, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14 }}>
            {FAQ_CATEGORIES.map((c) => {
              const active = c.id === activeCat
              return (
                <button key={c.id} onClick={() => { setActiveCat(c.id); setExpanded(0) }} style={{ padding: '24px 22px', background: active ? 'rgba(233,16,53,0.08)' : '#121212', borderRadius: 12, boxShadow: active ? 'inset 0 0 0 2px var(--accent)' : 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, border: 'none' }}>
                  <div style={{ color: active ? 'var(--accent)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={26} /></div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{c.label}</div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ marginTop: isMobile ? 40 : 64 }}>
        <h2 style={{ margin: '0 0 32px', fontSize: isMobile ? 28 : 40, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', textAlign: 'center' }}>Questions fréquentes</h2>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length > 0
            ? items.map((it, i) => <FaqRow key={i} item={it} expanded={i === expanded} onToggle={() => setExpanded(i === expanded ? -1 : i)} />)
            : <div style={{ padding: 40, textAlign: 'center', color: '#666', fontSize: 14, background: '#121212', borderRadius: 12 }}>Aucune réponse trouvée. Reformule ta question ou contacte-nous ci-dessous.</div>}
        </div>

        <div style={{ marginTop: isMobile ? 40 : 56 }}><ContactCard /></div>
      </section>
    </div>
  )
}
