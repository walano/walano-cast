// WalanoCast — Product detail page
// Loads after components.jsx. Reads ProductArt, Icon, ProductCard, etc. from window.

const { useState: _useState, useEffect: _useEffect, useMemo: _useMemo } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────────────────────
const CAT_LABEL = {
  film: 'Film & séries', musique: 'Musique', ia: 'Intelligence artificielle',
  gaming: 'Gaming', cartes: 'Cartes cadeaux',
};
const BreadCrumb = ({ product }) => (
  <nav style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '24px 0 8px',
    fontSize: 13, color: '#888',
  }}>
    {[
      { label: 'Accueil', href: '#/' },
      { label: 'Catégories', href: '#/' },
      { label: CAT_LABEL[product.cat] || 'Catégorie', href: '#/' },
      { label: product.platform, href: `#/product/${product.id}` },
    ].map((c, i, arr) => (
      <React.Fragment key={i}>
        {i > 0 && <Icon name="chevronRight" size={12} />}
        <a href={c.href} style={{
          color: i === arr.length - 1 ? '#fff' : '#888',
          textDecoration: 'none', fontWeight: i === arr.length - 1 ? 600 : 500,
        }}>{c.label}</a>
      </React.Fragment>
    ))}
  </nav>
);

// ─────────────────────────────────────────────────────────────────────────────
// Info chips (under title) — icon + label/sub
// ─────────────────────────────────────────────────────────────────────────────
const InfoChip = ({ icon, label, sub }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0',
  }}>
    <div style={{ color: 'var(--accent)', flexShrink: 0, paddingTop: 2 }}>
      <Icon name={icon} size={22} />
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{label}</div>
      <div style={{ fontSize: 12.5, color: '#9a9a9a', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Plan selector grid
// ─────────────────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, selected, onSelect, soldOut }) => {
  const [hover, setHover] = _useState(false);
  const active = selected;
  return (
    <button
      disabled={soldOut}
      onClick={() => onSelect(plan.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', textAlign: 'left',
        padding: '18px 18px', borderRadius: 10,
        background: active ? 'rgba(233,16,53,0.10)' : (hover && !soldOut ? '#181818' : '#121212'),
        boxShadow: active ? 'inset 0 0 0 2px var(--accent)' : 'none',
        cursor: soldOut ? 'not-allowed' : 'pointer',
        opacity: soldOut ? 0.4 : 1,
        fontFamily: 'inherit', color: '#fff',
        transition: 'background 0.15s ease',
        border: 'none',
      }}>
      {plan.bestValue && !soldOut && (
        <div style={{
          position: 'absolute', top: -10, right: 14, padding: '3px 10px',
          background: '#79e84b', color: '#0a1a04', fontSize: 10, fontWeight: 800, borderRadius: 4,
        }}>MEILLEURE OFFRE</div>
      )}
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{plan.label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 8 }}>
        {plan.price.toLocaleString('fr-FR')} <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>FCFA</span>
      </div>
      <div style={{ fontSize: 11.5, color: '#9a9a9a', marginTop: 2 }}>
        {soldOut ? 'Bientôt disponible' : `${plan.perMonth.toLocaleString('fr-FR')} FCFA / mois`}
      </div>
      {active && (
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-12" />
          </svg>
        </div>
      )}
    </button>
  );
};

const PlanGrid = ({ plans, selected, onSelect }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))',
    gap: 10, marginTop: 14,
  }}>
    {plans.map((p) => (
      <PlanCard key={p.id} plan={p} selected={p.id === selected} onSelect={onSelect} soldOut={p.soldOut} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sticky purchase sidebar
// ─────────────────────────────────────────────────────────────────────────────
const PurchaseSidebar = ({ product, plan, qty, setQty, onAdd, wished, onWish }) => {
  const [addHover, setAddHover] = _useState(false);
  const [buyHover, setBuyHover] = _useState(false);
  const isMobile = useIsMobile();
  const total = plan.price * qty;
  return (
    <aside style={isMobile ? {
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
      background: '#0f0f0f', borderTop: '1px solid #1f1f1f',
      maxHeight: '72vh', overflowY: 'auto',
      boxShadow: '0 -10px 28px rgba(0,0,0,0.55)',
    } : {
      position: 'sticky', top: 100, alignSelf: 'start',
    }}>
      <div style={{
        padding: isMobile ? '14px 16px 16px' : '8px 0 0',
        background: 'transparent',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--accent)',
          marginBottom: isMobile ? 4 : 8,
        }}>
          OFFRE WALANOCAST
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          marginBottom: 4,
        }}>
          <span style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: '#fff' }}>
            {total.toLocaleString('fr-FR')} <span style={{ fontSize: isMobile ? 14 : 18, opacity: 0.7, fontWeight: 700 }}>FCFA</span>
          </span>
        </div>
        <div style={{
          fontSize: 12.5, color: '#9a9a9a',
          marginBottom: isMobile ? 12 : 24,
        }}>
          Prix membre Cast+ <span style={{ color: 'var(--accent)', fontWeight: 700 }}>économise 10%</span>
        </div>

        <div style={{
          padding: isMobile ? '10px 14px' : '14px 16px',
          background: '#161616', borderRadius: 10,
          marginBottom: isMobile ? 10 : 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12" /></svg>
          </div>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#9a9a9a' }}>Sélectionné :</span>{' '}
            <span style={{ color: '#fff', fontWeight: 700 }}>{plan.label}</span>
          </div>
        </div>

        {/* Quantity */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 0',
          marginBottom: isMobile ? 10 : 14,
        }}>
          <span style={{ fontSize: 13, color: '#9a9a9a', fontWeight: 600 }}>Quantité</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn}>−</button>
            <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{qty}</span>
            <button onClick={() => setQty(Math.min(10, qty + 1))} style={qtyBtn}>+</button>
          </div>
        </div>

        {/* Buy row: Acheter maintenant + cart icon square */}
        <div style={{ display: 'flex', gap: 10, marginBottom: isMobile ? 10 : 12 }}>
          <button
            onMouseEnter={() => setBuyHover(true)}
            onMouseLeave={() => setBuyHover(false)}
            style={{
              flex: 1, height: isMobile ? 48 : 52, borderRadius: 10, border: 'none',
              background: buyHover ? 'var(--accent)' : '#fff',
              color: buyHover ? '#fff' : '#0f0f0f',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}>
            Acheter maintenant
          </button>
          <button
            onClick={onAdd}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
            aria-label="Ajouter au panier"
            style={{
              width: isMobile ? 48 : 52, height: isMobile ? 48 : 52, borderRadius: 10, border: 'none',
              background: addHover ? '#fff' : 'var(--accent)',
              color: addHover ? '#0f0f0f' : '#fff',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s ease, color 0.18s ease',
              flexShrink: 0,
            }}>
            <Icon name="cart" size={20} />
          </button>
        </div>

        {/* PayPal button (full width, normal size) */}
        <button
          style={{
            width: '100%', height: isMobile ? 44 : 46, borderRadius: 10, border: 'none',
            background: '#ffc439', color: '#003087',
            fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2,
            letterSpacing: 0, fontStyle: 'italic',
          }}>
          <span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#009cde' }}>Pal</span>
        </button>

        <button
          onClick={onWish}
          style={{
            width: '100%', marginTop: isMobile ? 8 : 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: isMobile ? '6px 0' : '10px 0', background: 'transparent', border: 'none',
            color: wished ? 'var(--accent)' : '#bdbdbd',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          }}>
          <Icon name="heart" size={15} stroke={wished ? 0 : 1.75} />
          {wished ? 'Ajouté aux favoris' : 'Ajouter aux favoris'}
        </button>

        {/* Safe checkout — desktop only */}
        {!isMobile && (
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #1f1f1f' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Paiement sécurisé
            </div>
            <div style={{ fontSize: 12, color: '#9a9a9a', marginBottom: 14 }}>
              Toutes nos transactions sont chiffrées de bout en bout.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Wave', 'Orange', 'MoMo', 'Visa', 'Mastercard', 'PayPal'].map((m) => (
                <span key={m} style={{
                  fontSize: 11, fontWeight: 700, color: '#bdbdbd',
                  padding: '6px 10px', background: '#161616', borderRadius: 6,
                }}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

const qtyBtn = {
  width: 32, height: 32, borderRadius: 8, border: 'none',
  background: '#1a1a1a', color: '#fff', fontSize: 18, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─────────────────────────────────────────────────────────────────────────────
// Description block (with Read more)
// ─────────────────────────────────────────────────────────────────────────────
const DESC = {
  film: (p) => ({
    intro: `${p.platform} c’est l’accès à un catalogue complet de films, séries et documentaires en qualité jusqu’à 4K HDR. Tu reçois un compte officiel, livré en moins d’une minute, garanti pendant toute la durée du pack.`,
    sections: [
      { h: 'Pour toute la famille', t: 'Profils séparés, contrôle parental, recommandations personnalisées. Jusqu’à 4 écrans simultanés selon le plan choisi.' },
      { h: 'Activation guidée', t: 'À l’achat, tu reçois immédiatement par e-mail tes identifiants et un guide d’activation pas-à-pas (3 minutes maximum).' },
      { h: 'Garantie 12 mois', t: 'En cas de panne, notre équipe te remplace ton accès gratuitement. Réponse sous 5 minutes via WhatsApp ou Telegram.' },
    ],
  }),
  musique: (p) => ({
    intro: `Avec ${p.platform}, écoute des dizaines de millions de morceaux sans publicité, en qualité jusqu’au Lossless. Téléchargement hors-ligne illimité, profils Family jusqu’à 6 personnes.`,
    sections: [
      { h: 'Sans publicité', t: 'Streaming continu, sans coupure. Saute, mets en pause et avance autant que tu veux.' },
      { h: 'Mode hors-ligne', t: 'Télécharge tes albums préférés et écoute-les sans connexion, où que tu sois.' },
      { h: 'Activation immédiate', t: 'Compte livré en moins de 60 secondes après ton paiement. Guide d’installation inclus.' },
    ],
  }),
  ia: (p) => ({
    intro: `${p.platform} t’ouvre l’accès aux modèles les plus récents, sans plafond de crédits et avec un débit prioritaire. Compte officiel régionalisé pour l’Afrique francophone.`,
    sections: [
      { h: 'Crédits illimités', t: 'Génère, traduis, code et résume sans compter. Aucun quota mensuel restrictif.' },
      { h: 'Accès complet', t: 'Tous les modèles avancés (génération d’images, voix, code) déverrouillés dès l’activation.' },
      { h: 'Garantie 12 mois', t: 'Si ton accès est suspendu pour un motif extérieur, on te remplace gratuitement le compte.' },
    ],
  }),
  gaming: (p) => ({
    intro: `${p.platform} te donne accès à un catalogue de plus de 100 jeux et à des avantages exclusifs (réductions, crédits, jeux en avant-première). Activation par code officiel.`,
    sections: [
      { h: 'Catalogue complet', t: 'Accès aux blockbusters le jour de leur sortie et à la rétrocompatibilité des classiques.' },
      { h: 'Multi-supports', t: 'Joue sur console, PC ou cloud. Tes sauvegardes te suivent partout.' },
      { h: 'Code officiel', t: 'Tu reçois un code à activer toi-même dans ton compte personnel. 100% légal et sécurisé.' },
    ],
  }),
  cartes: (p) => ({
    intro: `Cette carte ${p.platform} se recharge directement dans ton compte ou s’offre à un proche. Code envoyé par e-mail dès le paiement validé.`,
    sections: [
      { h: 'Utilisation libre', t: 'Le solde se débloque immédiatement et reste valable sans date d’expiration.' },
      { h: 'Idéal pour offrir', t: 'Code envoyé en PDF habillé : tu n’as qu’à le transférer à ton destinataire.' },
      { h: 'Compatible monde entier', t: 'Carte multi-régions, utilisable depuis n’importe quel compte officiel.' },
    ],
  }),
};

const DescriptionBlock = ({ product }) => {
  const [open, setOpen] = _useState(false);
  const isMobile = useIsMobile();
  const data = (DESC[product.cat] || DESC.film)(product);
  const visibleSections = open ? data.sections : data.sections.slice(0, 1);
  return (
    <section style={{ marginTop: isMobile ? 40 : 64 }}>
      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
        Description du produit
      </h2>
      <div style={{ background: '#121212', borderRadius: 12, padding: isMobile ? '24px 20px' : '40px 48px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 18 }}>
          {product.platform} · {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Stars rating={4.6} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>4,6</span>
          <span style={{ fontSize: 13, color: '#9a9a9a' }}>· basé sur 1 248 avis vérifiés</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: '#cfcfcf', margin: 0 }}>{data.intro}</p>
        <div style={{ marginTop: 28 }}>
          {visibleSections.map((s, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{s.h}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#cfcfcf', margin: 0 }}>{s.t}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--accent)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              padding: '8px 0',
            }}>
            {open ? 'Voir moins' : 'Lire la suite'}
          </button>
        </div>
      </div>
    </section>
  );
};

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4;
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = i === full && half;
        return (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`g${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#333" />
              </linearGradient>
            </defs>
            <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z"
              fill={filled ? '#fbbf24' : isHalf ? `url(#g${i})` : '#2a2a2a'} />
          </svg>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Specs table
// ─────────────────────────────────────────────────────────────────────────────
const SpecsTable = ({ product }) => {
  const isMobile = useIsMobile();
  const rows = [
    ['Catégorie',     CAT_LABEL[product.cat] || product.cat],
    ['Plateforme',    product.platform],
    ['Type',          product.cat === 'cartes' ? 'Code numérique' : 'Compte premium'],
    ['Activation',    'Compte mutualisé certifié'],
    ['Livraison',     'Instantanée par e-mail (60 secondes)'],
    ['Garantie',      '12 mois, remplacement gratuit en cas de panne'],
    ['Devise',        'Franc CFA (XAF)'],
  ];
  return (
    <section style={{ marginTop: isMobile ? 28 : 32 }}>
      <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
        Détails du produit
      </h2>
      <div style={{ background: '#121212', borderRadius: 12, padding: isMobile ? '12px 20px' : '32px 48px' }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
            gap: isMobile ? 4 : 24,
            padding: isMobile ? '14px 0' : '14px 0',
            borderBottom: i < rows.length - 1 ? '1px solid #1a1a1a' : 'none',
          }}>
            <div style={{ fontSize: 13.5, color: '#9a9a9a', fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Top section: hero image + title + info chips + plan grid
// ─────────────────────────────────────────────────────────────────────────────
const ProductTopSection = ({ product, plan, setPlan, plans }) => {
  const isMobile = useIsMobile();
  return (
  <section>
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '480px 1fr',
      gap: isMobile ? 20 : 40,
      marginTop: 16,
    }}>
      {/* Left: big product art */}
      <div style={{
        position: 'relative', aspectRatio: '4 / 3', borderRadius: 14, overflow: 'hidden',
      }}>
        <ProductArt initials={product.initials} category={product.cat} idx={product.idx} />
      </div>

      {/* Right: title, info chips */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
          {product.platform}
        </div>
        <h1 style={{
          margin: 0, fontSize: isMobile ? 26 : 36, lineHeight: 1.15, fontWeight: 900, color: '#fff',
          fontFamily: 'var(--font-display)',
        }}>{product.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <Stars rating={4.6} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>4,6</span>
          <span style={{ fontSize: 13, color: '#9a9a9a' }}>· 1 248 avis vérifiés</span>
        </div>

        <div style={{
          marginTop: isMobile ? 22 : 28,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '14px 0' : '18px 28px',
        }}>
          <InfoChip icon="flash"      label="Livraison instantanée" sub="Code reçu en moins de 60 secondes par e-mail." />
          <InfoChip icon="shield"     label="Garantie 12 mois"      sub="Remplacement gratuit en cas de défaillance." />
          <InfoChip icon="star"       label="+1 248 avis vérifiés"     sub="Note moyenne 4,6 · commentaires authentiques." />
          <InfoChip icon="headphones" label="Support 24/7"          sub="Équipe WalanoCast joignable sur WhatsApp." />
        </div>
      </div>
    </div>
  </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan picker section
// ─────────────────────────────────────────────────────────────────────────────
const PlanSection = ({ plan, setPlan, plans }) => (
  <section style={{ marginTop: 48 }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Durée du pack</div>
      <PlanGrid plans={plans} selected={plan} onSelect={setPlan} />
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Related products
// ─────────────────────────────────────────────────────────────────────────────
const RelatedProducts = ({ products, onAdd, onWish, wishlist }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{ marginTop: isMobile ? 40 : 64 }}>
    <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', margin: '0 0 18px' }}>
      Tu pourrais aussi aimer
    </h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
      gap: isMobile ? 12 : 16,
    }}>
      {products.slice(0, 5).map((p) => (
        <ProductCard key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wishlist.has(p.id)} />
      ))}
    </div>
  </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductPage component
// ─────────────────────────────────────────────────────────────────────────────
const ProductPage = ({ product, allProducts, onAdd, onWish, wishlist }) => {
  const [planId, setPlanId] = _useState('12m');
  const [qty, setQty] = _useState(1);
  const isMobile = useIsMobile();

  // Scroll to top when product changes
  _useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  const plans = _useMemo(() => {
    const base = product.price;
    const list = [
      { id: '1m',  label: '1 mois',  price: Math.round(base * 0.35), perMonth: Math.round(base * 0.35) },
      { id: '3m',  label: '3 mois',  price: Math.round(base * 0.85), perMonth: Math.round(base * 0.85 / 3) },
      { id: '6m',  label: '6 mois',  price: Math.round(base * 1.5),  perMonth: Math.round(base * 1.5 / 6) },
      { id: '12m', label: '12 mois', price: base,                     perMonth: Math.round(base / 12), bestValue: true },
      { id: '24m', label: '24 mois', price: Math.round(base * 1.75),  perMonth: Math.round(base * 1.75 / 24) },
      { id: '36m', label: '36 mois', price: Math.round(base * 2.4),   perMonth: Math.round(base * 2.4 / 36), soldOut: true },
    ];
    return list;
  }, [product]);

  const selectedPlan = plans.find((p) => p.id === planId) || plans[0];

  const sameCat = allProducts.filter((p) => p.cat === product.cat && p.id !== product.id);
  const others   = allProducts.filter((p) => p.cat !== product.cat && p.id !== product.id);
  const related  = [...sameCat, ...others].slice(0, 5);

  const handleAdd = () => {
    onAdd({ ...product, price: selectedPlan.price, name: `${product.name} · ${selectedPlan.label}` }, qty);
  };

  return (
    <div data-screen-label="02 Product Detail" style={{
      maxWidth: 1480, margin: '0 auto',
      padding: isMobile ? '0 16px 360px' : '0 28px 40px',
    }}>
      <BreadCrumb product={product} />

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 16 }}>
          <ProductTopSection
            product={product}
            plan={planId} setPlan={setPlanId} plans={plans}
          />
          <PlanSection
            plan={planId} setPlan={setPlanId} plans={plans}
          />
          <DescriptionBlock product={product} />
          <SpecsTable product={product} />
          {related.length > 0 && (
            <RelatedProducts products={related} onAdd={onAdd} onWish={onWish} wishlist={wishlist} />
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 380px', gap: 56, marginTop: 16,
        }}>
          <div>
            <ProductTopSection
              product={product}
              plan={planId} setPlan={setPlanId} plans={plans}
            />
            <PlanSection
              plan={planId} setPlan={setPlanId} plans={plans}
            />
            <DescriptionBlock product={product} />
            <SpecsTable product={product} />
          </div>
          <PurchaseSidebar
            product={product}
            plan={selectedPlan}
            qty={qty} setQty={setQty}
            onAdd={handleAdd}
            wished={wishlist.has(product.id)}
            onWish={() => onWish(product.id)}
          />
        </div>
      )}

      {!isMobile && related.length > 0 && (
        <RelatedProducts products={related} onAdd={onAdd} onWish={onWish} wishlist={wishlist} />
      )}

      {/* Mobile sticky-bottom payment bar */}
      {isMobile && (
        <PurchaseSidebar
          product={product}
          plan={selectedPlan}
          qty={qty} setQty={setQty}
          onAdd={handleAdd}
          wished={wishlist.has(product.id)}
          onWish={() => onWish(product.id)}
        />
      )}
    </div>
  );
};

Object.assign(window, { ProductPage });
