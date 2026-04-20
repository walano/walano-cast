// WalanoCast — Policy / Legal page
// Left sidebar TOC + right long-form content.

const { useState: _pUseState } = React;

const POLICY_SECTIONS = [
  { id: 'terms',       label: 'Conditions générales' },
  { id: 'privacy',     label: 'Politique de confidentialité' },
  { id: 'cookies',     label: 'Notice cookies' },
  { id: 'coupons',     label: 'Conditions des codes promo' },
  { id: 'cards',       label: 'Conditions des cartes cadeaux' },
  { id: 'affiliate',   label: 'Programme d’affiliation' },
  { id: 'affiliate-p', label: 'Confidentialité affiliation' },
  { id: 'vendor',      label: 'Conditions vendeurs' },
  { id: 'bulk',        label: 'Conditions revendeurs' },
  { id: 'cashback',    label: 'Conditions cashback' },
  { id: 'castplus',    label: 'Cast+ · conditions du programme' },
  { id: 'renew',       label: 'Renouvellement automatique' },
  { id: 'gifts',       label: 'Conditions cartes mystères' },
  { id: 'walapay',     label: 'WalaPay · conditions' },
  { id: 'walapay-p',   label: 'WalaPay · confidentialité' },
];

const POLICY_CONTENT = {
  privacy: {
    title: 'Politique de confidentialité',
    version: 'Version 2.1, dernière mise à jour 2026-04-12',
    blocks: [
      {
        type: 'p',
        text: 'Dans la présente Politique de confidentialité, nous, WalanoCast SARL, société immatriculée au RCCM de Yaoundé sous le numéro CM-YAO-01-2023-B12-04891, dont le siège social est situé à Bastos, Yaoundé (Cameroun), expliquons comment nous traitons tes données personnelles lorsque tu utilises notre site web (www.walanocast.com), notre application mobile et nos services. L’ensemble des traitements est effectué conformément à la loi camerounaise n° 2010/012 du 21 décembre 2010 et au RGPD pour les utilisateurs résidant dans l’Union européenne.',
      },
      { type: 'p', text: 'Nous te demandons ton consentement explicite à notre utilisation des cookies dès ta première visite sur la plateforme, conformément aux dispositions de la présente politique.' },
      { type: 'p', text: 'Notre plateforme intègre des contrôles de confidentialité qui te permettent de décider de la manière dont nous traitons tes données personnelles. Tu peux à tout moment refuser de recevoir des communications marketing directes via ton tableau de bord.' },
      { type: 'p', text: 'Tu trouveras dans cette notice les réponses aux questions suivantes :' },
      {
        type: 'list',
        items: [
          'comment nous utilisons tes données ;',
          'à qui nous transmettons tes données ;',
          'combien de temps nous conservons tes données ;',
          'quelle est notre politique marketing ;',
          'quels sont tes droits relatifs à tes données ;',
          'comment nous utilisons les cookies ;',
          'les autres points que tu dois prendre en compte.',
        ],
      },
      { type: 'p', text: 'En cas de question ou de demande d’exercice de l’un des droits prévus, tu peux nous contacter via la section "Contact" du site ou directement par e-mail à privacy@walanocast.com.' },
      { type: 'p', text: 'Si la présente politique est traduite dans une autre langue et qu’il existe des différences entre la version française et la traduction, la version française fait foi, sauf indication contraire.' },
      { type: 'p', text: 'Pour les utilisateurs de notre application mobile, la politique de confidentialité spécifique à l’application s’applique également.' },
      { type: 'h', text: 'Principes généraux de protection des données et confidentialité' },
      { type: 'p', text: 'WalanoCast traite toutes les données personnelles dans le respect des principes généraux suivants :' },
      {
        type: 'list',
        items: [
          'de manière licite, loyale et transparente à l’égard de la personne concernée (licéité, loyauté et transparence) ;',
          'pour des finalités déterminées, explicites et légitimes (limitation des finalités) ;',
          'de manière adéquate, pertinente et limitée à ce qui est nécessaire (minimisation des données) ;',
          'exactes et tenues à jour (exactitude) ;',
          'conservées sous une forme permettant l’identification pendant une durée n’excédant pas celle nécessaire (limitation de la conservation) ;',
          'traitées de façon à garantir une sécurité appropriée des données (intégrité et confidentialité).',
        ],
      },
      { type: 'h', text: 'Données que nous collectons' },
      { type: 'p', text: 'Lorsque tu crées un compte, nous collectons ton nom complet, ton adresse e-mail, ton numéro de téléphone et ton pays de résidence. Lors d’un achat, nous collectons les informations relatives au moyen de paiement utilisé (numéro masqué, dernière transaction, opérateur Mobile Money) ainsi que l’historique de tes commandes.' },
      { type: 'p', text: 'Nous ne stockons jamais les codes PIN Mobile Money ni les numéros complets de carte bancaire. Ces informations sont chiffrées de bout en bout par notre prestataire de paiement certifié PCI-DSS niveau 1.' },
    ],
  },
  terms: {
    title: 'Conditions générales de vente et d’utilisation',
    version: 'Version 3.0, dernière mise à jour 2026-03-01',
    blocks: [
      { type: 'p', text: 'Les présentes conditions générales s’appliquent à toute commande passée sur le site WalanoCast (www.walanocast.com) ainsi qu’à toute utilisation de l’application mobile WalanoCast. Toute commande implique l’adhésion sans réserve aux présentes conditions.' },
      { type: 'p', text: 'WalanoCast est exploité par WalanoCast SARL, société à responsabilité limitée immatriculée au RCCM de Yaoundé sous le numéro CM-YAO-01-2023-B12-04891. Le service client est joignable du lundi au dimanche, 24h/24, par WhatsApp au +237 600 000 000, par Telegram et par e-mail à support@walanocast.com.' },
      { type: 'h', text: 'Article 1 · Objet' },
      { type: 'p', text: 'WalanoCast est une marketplace de produits numériques (abonnements streaming, comptes IA, crédits gaming, cartes cadeaux, recharges) destinée aux particuliers résidant dans la zone CEMAC, UEMOA et plus largement en Afrique francophone. Les produits sont vendus sous forme de codes, comptes mutualisés ou comptes premium personnels selon la fiche produit.' },
      { type: 'h', text: 'Article 2 · Prix et paiement' },
      { type: 'p', text: 'Tous les prix sont affichés en Franc CFA (XAF) et incluent les taxes applicables. Le paiement s’effectue exclusivement par Wave, Orange Money, MTN MoMo, Moov Money, Visa, Mastercard, American Express ou PayPal. Aucune commande n’est traitée tant que le paiement n’a pas été validé par notre prestataire.' },
      { type: 'h', text: 'Article 3 · Garantie et remplacement' },
      { type: 'p', text: 'Chaque pack vendu est assorti d’une garantie de 12 mois (24 mois pour les membres Cast+). En cas de défaillance, d’interruption ou de suspension du compte ou du code livré pour des raisons indépendantes de l’utilisateur, WalanoCast s’engage à remplacer le produit dans un délai de 5 minutes via WhatsApp ou Telegram.' },
    ],
  },
};

// Default fallback for other sections
const DEFAULT_CONTENT = {
  title: 'Document en cours de mise à jour',
  version: 'Cette section est en cours de rédaction.',
  blocks: [
    { type: 'p', text: 'Notre équipe juridique finalise cette section. Si tu as besoin d’une information précise dès maintenant, écris-nous à privacy@walanocast.com.' },
    { type: 'p', text: 'En attendant, consulte les sections "Conditions générales" et "Politique de confidentialité" qui couvrent l’essentiel des règles applicables.' },
  ],
};

const PolicyPage = () => {
  const [activeId, setActiveId] = _pUseState('privacy');
  const data = POLICY_CONTENT[activeId] || DEFAULT_CONTENT;

  return (
    <div data-screen-label="06 Policy" style={{
      maxWidth: 1480, margin: '0 auto', padding: '40px 28px 80px',
    }}>
      {/* Page header */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 18,
        background: `radial-gradient(60% 120% at 95% 50%, rgba(233,16,53,0.35), transparent 60%),
                     linear-gradient(135deg, #1a0710 0%, #0f0f0f 70%)`,
        padding: '52px 56px',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12,
        }}>CENTRE LÉGAL · WALANOCAST</div>
        <h1 style={{
          margin: 0, fontSize: 48, lineHeight: 1.05, fontWeight: 900, color: '#fff',
          fontFamily: 'var(--font-display)', maxWidth: 760,
        }}>
          Tous nos documents juridiques au même endroit.
        </h1>
        <p style={{
          marginTop: 18, fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)',
          maxWidth: 640,
        }}>
          Conditions générales, confidentialité, cookies, garantie, conditions Cast+
          et conditions des programmes partenaires. Mis à jour régulièrement.
        </p>
      </section>

      {/* Body grid: sidebar + content */}
      <section style={{
        marginTop: 32,
        display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32,
        alignItems: 'start',
      }}>
        {/* Sidebar */}
        <aside style={{
          position: 'sticky', top: 100,
          background: '#121212', borderRadius: 14, padding: 10,
          maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
        }}>
          {POLICY_SECTIONS.map((s) => {
            const active = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 16px',
                  background: active ? 'rgba(233,16,53,0.10)' : 'transparent',
                  color: active ? 'var(--accent)' : '#cfcfcf',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 700 : 500,
                  fontFamily: 'inherit',
                  transition: 'background 0.12s ease, color 0.12s ease',
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#181818'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <div style={{
          background: '#121212', borderRadius: 14,
          padding: '40px 56px',
        }}>
          <div style={{
            fontSize: 12.5, color: '#9a9a9a', marginBottom: 8, fontWeight: 600,
          }}>{data.version}</div>
          <h2 style={{
            margin: 0, fontSize: 32, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>{data.title}</h2>

          <div style={{ marginTop: 28 }}>
            {data.blocks.map((b, i) => {
              if (b.type === 'h') {
                return (
                  <h3 key={i} style={{
                    margin: '36px 0 14px', fontSize: 18, fontWeight: 800, color: '#fff',
                    fontFamily: 'var(--font-display)',
                  }}>{b.text}</h3>
                );
              }
              if (b.type === 'list') {
                return (
                  <ol key={i} style={{
                    margin: '12px 0 18px', padding: '0 0 0 22px',
                    fontSize: 14.5, lineHeight: 1.8, color: '#cfcfcf',
                  }}>
                    {b.items.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{it}</li>)}
                  </ol>
                );
              }
              return (
                <p key={i} style={{
                  margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.75, color: '#cfcfcf',
                }}>{b.text}</p>
              );
            })}
          </div>

          {/* Contact footer */}
          <div style={{
            marginTop: 48, paddingTop: 28, borderTop: '1px solid #1f1f1f',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 13, color: '#9a9a9a' }}>
              Une question sur ce document ?{' '}
              <a href="mailto:legal@walanocast.com" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                legal@walanocast.com
              </a>
            </div>
            <a href="#/faq" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13.5, color: '#fff', fontWeight: 700, textDecoration: 'none',
            }}>
              Voir la FAQ <Icon name="chevronRight" size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { PolicyPage });
