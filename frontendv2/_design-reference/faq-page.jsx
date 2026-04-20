// WalanoCast — FAQ / Help page
// Hero search + category cards + accordion + contact CTA.

const { useState: _fUseState } = React;

const FAQ_CATEGORIES = [
  { id: 'start',    icon: 'flash',     label: 'Démarrer' },
  { id: 'pay',      icon: 'shield',    label: 'Paiements & garantie' },
  { id: 'account',  icon: 'user',      label: 'Activation & comptes' },
  { id: 'cards',    icon: 'gift',      label: 'Cartes & recharges' },
];

const FAQ_DATA = {
  start: [
    { q: 'Comment passer ma première commande sur WalanoCast ?', a: 'Choisis un produit dans le catalogue, sélectionne la durée du pack, clique sur "Acheter maintenant", paye avec ton moyen préféré et reçois ton code par e-mail en moins d’une minute. Un guide d’activation est joint à l’e-mail.' },
    { q: 'Dois-je obligatoirement créer un compte ?', a: 'Non, tu peux acheter en invité. Mais un compte WalanoCast te permet de retrouver tous tes codes, profiter des prix Cast+ et activer la garantie 12 mois en un clic.' },
    { q: 'Dans quels pays WalanoCast est-il disponible ?', a: 'Nous sommes officiellement présents au Cameroun, Gabon, Congo, Tchad, RCA, Sénégal, Côte d’Ivoire, Mali et Burkina Faso. Les paiements en Franc CFA et le support local en français y sont garantis.' },
    { q: 'Comment fonctionne le programme Cast+ ?', a: 'Cast+ est notre abonnement à 2 500 FCFA par mois qui donne accès aux prix membres (jusqu’à -25%), à la livraison prioritaire et à la garantie étendue 24 mois. Annulable à tout moment.' },
  ],
  pay: [
    { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Wave, Orange Money, MTN MoMo, Moov Money, Visa, Mastercard, American Express et PayPal. Tous les prix sont affichés en Franc CFA (XAF).' },
    { q: 'Mon paiement Mobile Money a échoué, que faire ?', a: 'Vérifie d’abord ton solde. Si l’opération a été débitée mais que la commande n’est pas validée, contacte-nous sur WhatsApp avec ton ID de transaction. Le remboursement est automatique sous 24h.' },
    { q: 'Comment fonctionne la garantie 12 mois ?', a: 'Si ton accès est coupé, suspendu ou ne fonctionne plus avant la fin du pack, on te remplace gratuitement le compte. Réponse sous 5 minutes via WhatsApp ou Telegram, 24/7.' },
    { q: 'Puis-je obtenir un remboursement ?', a: 'Oui, pour toute commande non livrée ou non activable dans les 24h, sans condition. Pour les comptes activés et utilisés, on privilégie le remplacement plutôt que le remboursement.' },
  ],
  account: [
    { q: 'Combien de temps prend l’activation d’un compte ?', a: 'En moyenne 45 secondes pour les comptes mutualisés et instantanée pour les codes officiels. Tu reçois un e-mail dès la validation du paiement.' },
    { q: 'Puis-je changer le mot de passe du compte mutualisé ?', a: 'Non, les mots de passe sont gérés par WalanoCast pour garantir un accès stable à tous les utilisateurs du compte. Toute modification entraîne une suspension automatique.' },
    { q: 'Sur combien d’appareils puis-je utiliser mon compte ?', a: 'Cela dépend de la plateforme et du plan. Les détails (nombre de profils, écrans simultanés) sont précisés sur chaque fiche produit, dans la section "Détails du produit".' },
    { q: 'Que faire si mon compte est suspendu ?', a: 'Ouvre une conversation WhatsApp depuis ton tableau de bord et un agent te remplace ton accès sous 5 minutes en moyenne. La garantie couvre toute la durée de ton pack.' },
  ],
  cards: [
    { q: 'Les cartes cadeaux ont-elles une date d’expiration ?', a: 'Non, sauf indication contraire sur la fiche produit. Le solde reste utilisable tant que le compte concerné est actif.' },
    { q: 'Comment offrir une carte cadeau ?', a: 'À la commande, choisis l’option "Offrir". Tu reçois un PDF habillé à transférer à ton destinataire avec un message personnalisé.' },
    { q: 'Puis-je utiliser une carte multi-régions ?', a: 'Toutes nos cartes sont compatibles monde entier, sauf les recharges Mobile Money qui restent locales. La région d’activation est précisée sur chaque fiche.' },
    { q: 'Les recharges de jeux sont-elles instantanées ?', a: 'Oui, les V-Coins, ZGold et ValuePoints sont créditées en moins de 60 secondes après paiement validé.' },
  ],
};

const FaqCategoryCard = ({ cat, active, onClick }) => {
  const [hover, setHover] = _fUseState(false);
  return (
    <button
      onClick={() => onClick(cat.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '24px 22px',
        background: active ? 'rgba(233,16,53,0.08)' : (hover ? '#181818' : '#121212'),
        borderRadius: 12,
        boxShadow: active ? 'inset 0 0 0 2px var(--accent)' : 'inset 0 0 0 1px transparent',
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14,
        transition: 'background 0.15s ease, box-shadow 0.15s ease',
        border: 'none',
      }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: active ? 'var(--accent)' : '#1a1a1a',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={cat.icon} size={20} />
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', textAlign: 'left' }}>
        {cat.label}
      </div>
    </button>
  );
};

const FaqRow = ({ item, idx, expanded, onToggle }) => (
  <div style={{
    background: expanded ? 'rgba(233,16,53,0.06)' : '#121212',
    borderRadius: 12,
    boxShadow: expanded ? 'inset 0 0 0 1.5px var(--accent)' : 'none',
    transition: 'background 0.15s ease, box-shadow 0.15s ease',
  }}>
    <button
      onClick={() => onToggle(idx)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 22px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
      }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        boxShadow: `inset 0 0 0 1.5px ${expanded ? 'var(--accent)' : '#3a3a3a'}`,
        background: expanded ? 'var(--accent)' : 'transparent',
        flexShrink: 0,
      }} />
      <span style={{
        flex: 1, fontSize: 15, fontWeight: 700,
        color: expanded ? 'var(--accent)' : '#fff',
      }}>{item.q}</span>
      <span style={{
        width: 28, height: 28, color: expanded ? 'var(--accent)' : '#9a9a9a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s ease',
        transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    </button>
    {expanded && (
      <div style={{
        padding: '0 22px 22px 54px',
        fontSize: 14, lineHeight: 1.65, color: '#cfcfcf',
      }}>{item.a}</div>
    )}
  </div>
);

const ContactCard = () => (
  <div style={{
    background: '#1a0710',
    boxShadow: 'inset 0 0 0 1px rgba(233,16,53,0.25)',
    borderRadius: 16,
    padding: '32px 28px',
  }}>
    <div style={{
      fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center',
      fontFamily: 'var(--font-display)',
    }}>
      Tu as toujours une question ?
    </div>
    <div style={{
      marginTop: 12, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
      textAlign: 'center', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
    }}>
      Si tu ne trouves pas ta réponse, envoie-nous ta demande et notre équipe te répond
      en moins de 5 minutes.
    </div>
    <div style={{
      marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
    }}>
      <a href="https://wa.me/237600000000" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '20px 16px', background: '#121212', borderRadius: 12,
        textDecoration: 'none',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>+237 600 000 000</div>
        <div style={{ fontSize: 11.5, color: '#9a9a9a' }}>WhatsApp · 24/7</div>
      </a>
      <a href="mailto:support@walanocast.com" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '20px 16px', background: '#121212', borderRadius: 12,
        textDecoration: 'none',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>support@walanocast.com</div>
        <div style={{ fontSize: 11.5, color: '#9a9a9a' }}>Réponse sous 5 minutes</div>
      </a>
    </div>
  </div>
);

const FaqPage = () => {
  const [activeCat, setActiveCat] = _fUseState('pay');
  const [expanded, setExpanded] = _fUseState(0);
  const [search, setSearch] = _fUseState('');
  const [submitHover, setSubmitHover] = _fUseState(false);

  const items = FAQ_DATA[activeCat] || [];

  return (
    <div data-screen-label="05 FAQ" style={{
      maxWidth: 1480, margin: '0 auto', padding: '40px 28px 80px',
    }}>
      {/* Hero */}
      <section style={{
        background: '#121212', borderRadius: 24,
        padding: '72px 28px 56px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="faqgrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" stroke="#fff" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faqgrid)" />
        </svg>
        <div style={{
          position: 'absolute', right: -100, top: -100, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(233,16,53,0.18)', filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 14,
          }}>CENTRE D’AIDE WALANOCAST</div>
          <h1 style={{
            margin: 0, fontSize: 52, lineHeight: 1.05, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)', maxWidth: 760,
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            Bonjour, comment pouvons-nous t’aider ?
          </h1>

          {/* search bar */}
          <div style={{
            marginTop: 36, maxWidth: 620, margin: '36px auto 0',
            position: 'relative', display: 'flex',
          }}>
            <div style={{
              position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
              color: '#9a9a9a', pointerEvents: 'none', display: 'flex',
            }}>
              <Icon name="search" size={18} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pose ta question…"
              style={{
                flex: 1, height: 56, paddingLeft: 48, paddingRight: 140,
                borderRadius: 12, border: 'none', background: '#fff', color: '#0f0f0f',
                fontSize: 15, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
              style={{
                position: 'absolute', right: 6, top: 6, height: 44, padding: '0 22px',
                borderRadius: 8, border: 'none',
                background: submitHover ? '#fff' : 'var(--accent)',
                color: submitHover ? '#0f0f0f' : '#fff',
                boxShadow: submitHover ? 'inset 0 0 0 1.5px #0f0f0f' : 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.18s ease, color 0.18s ease',
              }}>Rechercher</button>
          </div>

          <div style={{
            marginTop: 28, fontSize: 13.5, color: '#9a9a9a',
          }}>Ou choisis une catégorie pour trouver une réponse rapide</div>

          {/* category cards */}
          <div style={{
            marginTop: 22, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto',
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14,
          }}>
            {FAQ_CATEGORIES.map((c) => (
              <FaqCategoryCard key={c.id} cat={c} active={c.id === activeCat} onClick={setActiveCat} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ accordion + contact card */}
      <section style={{
        marginTop: 64,
      }}>
        <h2 style={{
          margin: '0 0 32px', fontSize: 40, fontWeight: 900, color: '#fff',
          fontFamily: 'var(--font-display)', textAlign: 'center',
        }}>
          Questions fréquentes
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32,
          alignItems: 'start',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it, i) => (
              <FaqRow key={i} item={it} idx={i} expanded={i === expanded} onToggle={(j) => setExpanded(j === expanded ? -1 : j)} />
            ))}
          </div>
          <div style={{ position: 'sticky', top: 100 }}>
            <ContactCard />
          </div>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { FaqPage });
