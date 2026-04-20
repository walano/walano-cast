// WalanoCast main UI components
// Loaded after React + Babel. Exports all components to window for index.html.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Responsive helper
// ─────────────────────────────────────────────────────────────────────────────
const useIsMobile = (bp = 760) => {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const onR = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [bp]);
  return m;
};

// ─────────────────────────────────────────────────────────────────────────────
// Icons (minimal stroke set, 24px)
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, stroke = 1.75 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
    cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M3 4h2l2.5 12h12L22 8H6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    film: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 9h18M3 15h18M8 4v16M16 4v16" /></>,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    ai: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 9h6v6H9z" /><path d="M3 9v6M21 9v6M9 3h6M9 21h6" /></>,
    gamepad: <><path d="M6 12h4M8 10v4" /><circle cx="15" cy="11" r="0.8" fill="currentColor" /><circle cx="17" cy="13" r="0.8" fill="currentColor" /><rect x="2" y="7" width="20" height="11" rx="4" /></>,
    gift: <><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M3 12h18M12 8v13M8 8a2.5 2.5 0 0 1 0-5c2 0 4 5 4 5s2-5 4-5a2.5 2.5 0 0 1 0 5" /></>,
    chevronRight: <path d="m9 6 6 6-6 6" />,
    chevronLeft: <path d="m15 6-6 6 6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 5 5 9-12" />,
    flash: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
    shield: <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />,
    star: <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z" />,
    headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 18a2 2 0 0 1-2 2h-1v-6h3v4zM3 18a2 2 0 0 0 2 2h1v-6H3v4z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Logo original WalanoCast mark (W with red broadcast wave)
// ─────────────────────────────────────────────────────────────────────────────
const Logo = ({ size = 28, mono = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size + 4} height={size + 4} viewBox="0 0 32 32" fill="none">
      <path d="M4 8l3 16 5-12 4 12 5-12 3 12 4-16" stroke={mono ? '#fff' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="6" r="3" fill={mono ? '#fff' : '#0f0f0f'} />
    </svg>
    <span style={{ fontWeight: 900, fontSize: size * 0.78, color: '#fff', fontFamily: 'var(--font-display)' }}>
      Walano<span style={{ opacity: 0.85 }}>Cast</span>
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Header red bar, logo, search, icons, auth
// ─────────────────────────────────────────────────────────────────────────────
const Header = ({ cartCount, wishCount, query, setQuery, searchResults = [], onCart, onWish, accent }) => {
  const [focused, setFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-open mobile bar if user lands with a pre-filled query
  useEffect(() => { if (query) setSearchOpen(true); }, [query]);

  const closeMobileSearch = () => { setSearchOpen(false); setQuery(''); };

  const onResultClick = () => {
    setQuery('');
    if (isMobile) setSearchOpen(false);
  };

  const Results = searchResults.length > 0 && (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
      background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 10,
      padding: 6,
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 60,
      maxHeight: 380, overflowY: 'auto',
    }}>
      {searchResults.map((r) => (
        <a key={r.id} href={`#/product/${r.id}`} onClick={onResultClick}
          className="om-search-result"
          style={{
          display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 12,
          padding: '10px 10px', borderRadius: 8,
          textDecoration: 'none', color: '#fff', alignItems: 'center',
        }}>
          <div style={{
            position: 'relative', width: 52, aspectRatio: '4 / 3',
            borderRadius: 6, overflow: 'hidden',
          }}>
            <ProductArt initials={r.initials} category={r.cat} idx={r.idx} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 700, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{r.platform} {r.name}</div>
            <div style={{ fontSize: 11.5, color: '#9a9a9a', marginTop: 2 }}>
              {{ film: 'Film & séries', musique: 'Musique', ia: 'IA', gaming: 'Gaming', cartes: 'Cartes cadeaux' }[r.cat]}
            </div>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
            {r.price.toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>FCFA</span>
          </div>
        </a>
      ))}
    </div>
  );

  const searchBar = (
    <div style={{
      position: 'relative', maxWidth: isMobile ? '100%' : 720, width: '100%',
      justifySelf: 'center',
    }}>
      <div style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        color: '#8a8a8a', pointerEvents: 'none',
      }}>
        <Icon name="search" size={18} />
      </div>
      <input
        autoFocus={isMobile && searchOpen}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isMobile ? 'Rechercher…' : 'Rechercher des abonnements, codes, recharges…'}
        style={{
          width: '100%', height: isMobile ? 40 : 44,
          paddingLeft: 44, paddingRight: 44,
          borderRadius: 8, border: 'none', background: '#fff', color: '#0f0f0f',
          fontSize: 14, fontFamily: 'inherit',
          outline: focused ? '3px solid rgba(255,255,255,0.45)' : 'none',
          transition: 'outline 0.15s ease',
        }}
      />
      {query ? (
        <button
          onClick={() => setQuery('')}
          aria-label="Effacer"
          style={{
            position: 'absolute', right: 6, top: isMobile ? 4 : 6,
            height: 32, width: 32, borderRadius: 6, border: 'none',
            background: 'transparent', color: '#0f0f0f', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
      ) : (
        <button style={{
          position: 'absolute', right: 6, top: isMobile ? 4 : 6,
          height: 32, width: 32,
          borderRadius: 6, border: 'none', background: 'transparent', color: '#0f0f0f',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-label="Rechercher"><Icon name="search" size={20} /></button>
      )}
      {Results}
    </div>
  );

  if (isMobile) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, background: accent,
        borderBottom: '1px solid rgba(0,0,0,0.15)',
      }}>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="#/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Logo size={22} />
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBtn
                name={searchOpen ? 'plus' : 'search'}
                onClick={() => searchOpen ? closeMobileSearch() : setSearchOpen(true)}
                rotate={searchOpen ? 45 : 0}
              />
              <IconBtn name="user" onClick={() => { window.location.hash = '#/login'; }} />
              <IconBtn name="heart" badge={wishCount} onClick={onWish} />
              <IconBtn name="cart" badge={cartCount} onClick={onCart} />
            </div>
          </div>
          <div style={{
            maxHeight: searchOpen ? 56 : 0,
            overflow: searchOpen ? 'visible' : 'hidden',
            transition: 'max-height 0.25s ease, margin-top 0.25s ease',
            marginTop: searchOpen ? 10 : 0,
          }}>
            {searchBar}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, background: accent,
      borderBottom: '1px solid rgba(0,0,0,0.15)',
    }}>
      <div style={{
        maxWidth: 1480, margin: '0 auto', padding: '14px 28px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
      }}>
        <a href="#/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo size={26} />
        </a>

        {searchBar}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={pillBtnStyle}>
            <Icon name="globe" size={16} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>FR · XAF</span>
          </button>
          <IconBtn name="heart" badge={wishCount} onClick={onWish} />
          <IconBtn name="cart" badge={cartCount} onClick={onCart} />
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.25)', margin: '0 4px' }} />
          <a href="#/login" style={{ ...pillBtnStyle, padding: '8px 14px', gap: 8, textDecoration: 'none' }}>
            <Icon name="user" size={16} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Connexion · <span style={{ opacity: 0.85 }}>Inscription</span></span>
          </a>
        </div>
      </div>
    </header>
  );
};

const pillBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 10px',
  borderRadius: 8, border: 'none', background: 'transparent', color: '#fff',
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 0.12s ease',
};

const IconBtn = ({ name, badge, onClick, rotate = 0 }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', width: 38, height: 38, borderRadius: 8, border: 'none',
        background: 'transparent',
        color: hover ? 'var(--accent-on-bar, #fff)' : '#fff',
        opacity: hover ? 0.7 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'opacity 0.12s ease, transform 0.2s ease',
        transform: `rotate(${rotate}deg)`,
      }}>
      <Icon name={name} size={20} />
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16,
          padding: '0 4px', borderRadius: 8, background: '#0f0f0f', color: '#fff',
          fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--accent)',
        }}>{badge}</span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hero main feature + side promos
// ─────────────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    eyebrow: 'NOUVEAU · DISPONIBLE DÈS MAINTENANT',
    title: 'CinéVault 4K',
    subtitle: 'Un an de films sans pub. Activation en 2 min.',
    price: '12 500',
    old: '18 000',
    cta: 'Acheter maintenant',
    art: 'cinevault',
  },
  {
    eyebrow: 'CASHBACK 25%',
    title: 'Pack Studio AI',
    subtitle: 'Génère, traduis, code. Crédits illimités 30 jours.',
    price: '8 900',
    old: '11 500',
    cta: 'Activer le pack',
    art: 'studioai',
  },
  {
    eyebrow: 'EXCLUSIVITÉ WALANO',
    title: 'Sonic Pass Family',
    subtitle: 'Jusqu’à 6 profils. Musique sans publicité.',
    price: '6 200',
    old: '9 000',
    cta: 'Découvrir l’offre',
    art: 'sonic',
  },
];

const HeroArt = ({ kind, big = false }) => {
  // Big colorful product-shot placeholder. NOT real brand art.
  const palettes = {
    cinevault: ['#1a0508', '#2a0510', '#e91035', '#ff7a8e'],
    studioai:  ['#04121a', '#08203a', '#3b82f6', '#a5d8ff'],
    sonic:     ['#0a0612', '#1e0a2a', '#a855f7', '#fcd34d'],
  };
  const p = palettes[kind] || palettes.cinevault;
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `radial-gradient(110% 80% at 75% 30%, ${p[2]}33 0%, transparent 55%),
                   radial-gradient(70% 80% at 20% 90%, ${p[3]}22 0%, transparent 60%),
                   linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 60%, ${p[0]} 100%)`,
    }}>
      {/* abstract shapes */}
      <div style={{
        position: 'absolute', right: '-8%', top: '15%', width: big ? 380 : 200, height: big ? 380 : 200,
        borderRadius: '50%', background: p[2], filter: 'blur(2px)', opacity: 0.85,
        boxShadow: `0 0 120px ${p[2]}`,
      }} />
      <div style={{
        position: 'absolute', right: big ? '12%' : '4%', top: big ? '8%' : '2%',
        width: big ? 140 : 80, height: big ? 140 : 80, borderRadius: '50%',
        background: p[3], opacity: 0.9,
      }} />
      <div style={{
        position: 'absolute', left: '-5%', bottom: '-10%', width: big ? 280 : 160, height: big ? 280 : 160,
        background: p[2], opacity: 0.15, transform: 'rotate(20deg)', borderRadius: 40,
      }} />
      {/* grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        <defs>
          <pattern id={`g-${kind}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" stroke="#fff" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${kind})`} />
      </svg>
      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.4) 40%, transparent 70%)',
      }} />
    </div>
  );
};

const Hero = ({ slides, onPrev, onNext, idx, total, onDot }) => {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: 0, margin: 0 }}>
      <div style={{
        position: 'relative', borderRadius: 0, overflow: 'hidden',
        background: '#0a0a0a', height: isMobile ? 420 : 440,
      }}>
        {/* Sliding track */}
        <div style={{
          display: 'flex', height: '100%', width: '100%',
          transform: `translateX(-${idx * 100}%)`,
          transition: 'transform 700ms cubic-bezier(0.65, 0, 0.35, 1)',
          willChange: 'transform',
        }}>
          {slides.map((s, i) => (
            <HeroSlide key={i} slide={s} isMobile={isMobile} />
          ))}
        </div>

        {/* dots */}
        <div style={{
          position: 'absolute', bottom: 18, right: isMobile ? 16 : 24, display: 'flex', gap: 6,
          zIndex: 2,
        }}>
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => onDot(i)} style={{
              width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
              background: i === idx ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', padding: 0,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroSlide = ({ slide, isMobile }) => {
  const [ctaHover, setCtaHover] = useState(false);
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', flexShrink: 0,
      overflow: 'hidden',
    }}>
      <HeroArt kind={slide.art} big />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          width: '100%', maxWidth: 1480, margin: '0 auto',
          padding: isMobile ? '24px 20px 50px' : '44px 56px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            color: 'var(--accent)',
            fontSize: isMobile ? 11 : 12, fontWeight: 700,
            marginBottom: isMobile ? 12 : 18,
          }}>{slide.eyebrow}</div>
          <h1 style={{
            margin: 0, fontSize: isMobile ? 38 : 64, lineHeight: 0.95, fontWeight: 900,
            color: '#fff', fontFamily: 'var(--font-display)',
          }}>{slide.title}</h1>
          <p style={{
            margin: isMobile ? '10px 0 18px' : '14px 0 24px',
            fontSize: isMobile ? 14.5 : 18, color: '#c8c8c8', maxWidth: 480,
          }}>
            {slide.subtitle}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20,
            flexWrap: 'wrap',
          }}>
            <button
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              style={{
              height: isMobile ? 46 : 52, padding: isMobile ? '0 22px' : '0 28px',
              borderRadius: 10, border: 'none',
              background: ctaHover ? '#fff' : 'var(--accent)',
              color: ctaHover ? '#0f0f0f' : '#fff',
              fontSize: isMobile ? 14 : 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: ctaHover ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(233,16,53,0.35)',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}>{slide.cta}</button>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff' }}>
                {slide.price} <span style={{ fontSize: isMobile ? 13 : 16, opacity: 0.7 }}>FCFA</span>
              </span>
              <span style={{ fontSize: isMobile ? 13 : 15, color: '#888', textDecoration: 'line-through' }}>{slide.old}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const heroArrow = (side) => ({
  position: 'absolute', top: '50%', [side]: 20, transform: 'translateY(-50%)',
  width: 44, height: 44, borderRadius: '50%', border: 'none',
  background: 'transparent', color: '#fff',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 0.7, transition: 'opacity 0.15s ease',
});

// ─────────────────────────────────────────────────────────────────────────────
// Trust bar (under hero)
// ─────────────────────────────────────────────────────────────────────────────
const TrustBar = () => {
  const isMobile = useIsMobile();
  const items = [
    { icon: 'flash', label: 'Livraison instantanée', sub: 'Codes en moins de 60 sec' },
    { icon: 'shield', label: 'Paiement 100% sécurisé', sub: 'Wave, MoMo, Orange, Visa' },
    { icon: 'star', label: '+12 400 avis vérifiés', sub: 'Note moyenne 4,8 / 5' },
    { icon: 'headphones', label: 'Support 24/7', sub: 'Réponse en moins de 5 min' },
  ];
  return (
    <section style={{
      maxWidth: 1480, margin: '0 auto',
      padding: isMobile ? '40px 16px 12px' : '60px 28px 20px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
        gap: 0,
        borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f',
      }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: isMobile ? '16px 12px' : '22px 22px',
            borderRight: !isMobile && i < items.length - 1 ? '1px solid transparent' : 'none',
          }}>
            <div style={{
              color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={it.icon} size={isMobile ? 20 : 24} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 700, color: '#fff' }}>{it.label}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#9a9a9a', marginTop: 2 }}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Category nav (icons row)
// ─────────────────────────────────────────────────────────────────────────────
const CATS = [
  { id: 'tout', label: 'Tout', icon: 'grid' },
  { id: 'instant', label: 'Livraison instantanée', icon: 'flash' },
  { id: 'film', label: 'Film / séries', icon: 'film' },
  { id: 'musique', label: 'Musique', icon: 'music' },
  { id: 'ia', label: 'Intelligence artificielle', icon: 'ai' },
  { id: 'gaming', label: 'Gaming', icon: 'gamepad' },
  { id: 'cartes', label: 'Cartes cadeaux', icon: 'gift' },
];

const CategoryNav = ({ active, onChange }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{
    maxWidth: 1480, margin: '0 auto',
    padding: isMobile ? '20px 0 14px' : '36px 28px 22px',
  }}>
    <div style={{
      display: 'flex',
      gap: isMobile ? 14 : 32,
      justifyContent: isMobile ? 'flex-start' : 'center',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
      overflowX: isMobile ? 'auto' : 'visible',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      padding: isMobile ? '0 16px' : 0,
    }}>
      {CATS.map((c) => {
        const isActive = active === c.id;
        return (
          <button key={c.id} onClick={() => onChange(c.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            minWidth: isMobile ? 76 : 96,
            flexShrink: 0,
            border: 'none', background: 'transparent',
            color: isActive ? '#fff' : '#cfcfcf', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'color 0.15s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#cfcfcf'; }}
          >
            <div style={{ color: isActive ? 'var(--accent)' : 'inherit', transition: 'color 0.15s ease' }}>
              <Icon name={c.icon} size={isMobile ? 24 : 28} />
            </div>
            <span style={{ fontSize: isMobile ? 11.5 : 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</span>
            {isActive && (
              <div style={{
                position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 2, background: 'var(--accent)', borderRadius: 2,
              }} />
            )}
          </button>
        );
      })}
    </div>
  </section>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// Product card art
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = {
  film:    [['#250812', '#460b1a', '#e91035'], ['#1a0f24', '#2d1a3e', '#7c3aed'], ['#0a1820', '#103040', '#06b6d4'], ['#1a1208', '#3a2a10', '#f59e0b']],
  musique: [['#1a0822', '#330d4a', '#a855f7'], ['#082018', '#0e3a2d', '#10b981'], ['#220818', '#440f30', '#ec4899']],
  ia:      [['#040c20', '#082045', '#3b82f6'], ['#08201c', '#0e4038', '#14b8a6'], ['#1c1408', '#382a0e', '#eab308']],
  gaming:  [['#1a0a08', '#3a140e', '#f97316'], ['#08161a', '#0e3038', '#06b6d4']],
  cartes:  [['#0a1a1f', '#103040', '#06b6d4'], ['#1f1408', '#3a2410', '#f59e0b']],
};

const ProductArt = ({ initials, category, idx }) => {
  const arr = PALETTES[category] || PALETTES.film;
  const p = arr[idx % arr.length];
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(120% 80% at 80% 20%, ${p[2]}55 0%, transparent 60%),
                   linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 100%)`,
    }}>
      <div style={{
        position: 'absolute', right: -30, bottom: -30, width: 140, height: 140,
        borderRadius: '50%', background: p[2], opacity: 0.35, filter: 'blur(2px)',
      }} />
      <div style={{
        position: 'absolute', left: 14, top: 14, padding: '4px 8px',
        borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff',
        fontSize: 10, fontWeight: 700,
      }}>{category.toUpperCase()}</div>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, fontWeight: 900, color: '#fff',
        textShadow: '0 4px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)', opacity: 0.92,
      }}>{initials}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Product card
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({ p, onAdd, onWish, wished }) => {
  const [hover, setHover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  return (
    <a
      href={`#/product/${p.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', borderRadius: 12, overflow: 'hidden',
        background: '#121212', border: 'none',
        transition: 'all 0.18s ease',
        transform: hover ? 'translateY(-3px)' : 'none',
        boxShadow: hover ? '0 16px 30px rgba(0,0,0,0.5)' : 'none',
        display: 'flex', flexDirection: 'column',
        textDecoration: 'none', color: 'inherit',
      }}>
      {/* art */}
      <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
        <ProductArt initials={p.initials} category={p.cat} idx={p.idx} />
        {p.discount && (
          <div style={{
            position: 'absolute', top: 12, right: 12, padding: '4px 8px',
            borderRadius: 4, background: '#79e84b', color: '#0a1a04', fontSize: 11, fontWeight: 800,
          }}>-{p.discount}%</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWish(p.id); }}
          style={{
            position: 'absolute', top: 12, right: p.discount ? 58 : 12,
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(0,0,0,0.55)', color: wished ? 'var(--accent)' : '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hover || wished ? 1 : 0, transition: 'opacity 0.15s ease',
          }}>
          <Icon name="heart" size={16} stroke={wished ? 0 : 1.75} />
          {wished && <div style={{ position: 'absolute', inset: 8, color: 'var(--accent)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
          </div>}
        </button>
      </div>

      {/* body */}
      <div style={{ padding: '14px 14px 0', flex: 1, background: '#121212', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 10, minHeight: 36 }}>
          {p.platform} {p.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
          {p.old && (
            <span style={{ fontSize: 12, color: '#7a7a7a', textDecoration: 'line-through', fontWeight: 500 }}>
              {p.old.toLocaleString('fr-FR')} FCFA
            </span>
          )}
          <span style={{ fontSize: 19, fontWeight: 800, color: '#fff' }}>
            {p.price.toLocaleString('fr-FR')} <span style={{ fontSize: 12, fontWeight: 600 }}>FCFA</span>
          </span>
        </div>
      </div>

      {/* red footer */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(p); }}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 14px',
        background: btnHover ? '#fff' : 'var(--accent)',
        color: btnHover ? '#0f0f0f' : '#fff',
        border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
        transition: 'background 0.15s ease, color 0.15s ease',
      }}>
        <Icon name="cart" size={16} />
        <span>Ajouter au panier</span>
      </button>
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Product Grid section
// ─────────────────────────────────────────────────────────────────────────────
const SectionTitle = ({ title, sub, more = 'Tout voir' }) => {
  const isMobile = useIsMobile();
  return (
  <div style={{
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    margin: isMobile ? '28px 0 14px' : '40px 0 18px',
    gap: 16,
  }}>
    <div style={{ minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      {sub && <div style={{ marginTop: 6, fontSize: isMobile ? 12.5 : 14, color: '#9a9a9a' }}>{sub}</div>}
    </div>
    <a href="#" style={{
      display: 'flex', alignItems: 'center', gap: 6, fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600,
      color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
    }}>{more} <Icon name="chevronRight" size={14} /></a>
  </div>
);
};

const ProductGrid = ({ products, onAdd, onWish, wishlist }) => {
  const isMobile = useIsMobile();
  return (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
    gap: isMobile ? 12 : 16,
  }}>
    {products.map((p) => (
      <ProductCard key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wishlist.has(p.id)} />
    ))}
  </div>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// Editorial banner (between grids)
// ─────────────────────────────────────────────────────────────────────────────
const Banner = ({ tag, title, sub, cta, palette = ['#1a0a24', '#3a1456', '#a855f7'] }) => {
  const [hover, setHover] = useState(false);
  const isMobile = useIsMobile();
  return (
  <div style={{
    position: 'relative', borderRadius: 14, overflow: 'hidden',
    background: `radial-gradient(80% 120% at 90% 50%, ${palette[2]}55, transparent 60%),
                 linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
    margin: isMobile ? '40px 0 20px' : '64px 0 24px',
  }}>
    <div style={{
      position: 'absolute', right: -40, top: -40,
      width: isMobile ? 160 : 220, height: isMobile ? 160 : 220,
      borderRadius: '50%', background: palette[2], opacity: 0.35,
    }} />
    <div style={{
      position: 'relative',
      padding: isMobile ? '36px 24px' : '64px 48px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', opacity: 0.7, marginBottom: 14 }}>{tag}</div>
      <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#fff', maxWidth: 600, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{title}</div>
      <div style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.75)', marginTop: 14, maxWidth: 540 }}>{sub}</div>
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          marginTop: isMobile ? 22 : 28, alignSelf: 'flex-start',
          height: isMobile ? 42 : 46, padding: isMobile ? '0 18px' : '0 22px', borderRadius: 8,
          border: 'none',
          background: hover ? 'var(--accent)' : '#fff',
          color: hover ? '#fff' : '#0f0f0f',
          fontSize: isMobile ? 13.5 : 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.18s ease, color 0.18s ease',
        }}>{cta}</button>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart drawer
// ─────────────────────────────────────────────────────────────────────────────
const CartDrawer = ({ open, items, onClose, onRemove }) => {
  const total = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const [checkHover, setCheckHover] = useState(false);
  const isMobile = useIsMobile();
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 420, maxWidth: '100vw',
        zIndex: 101,
        background: '#0f0f0f', borderLeft: '1px solid #1f1f1f',
        transform: `translateX(${open ? '0' : '100%'})`, transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #1f1f1f',
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Mon panier</div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: '#1a1a1a', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {items.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
              <Icon name="cart" size={40} />
              <div style={{ marginTop: 12, fontSize: 14 }}>Votre panier est vide.</div>
            </div>
          )}
          {items.map((it) => (
            <div key={it.p.id} style={{
              display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12,
              padding: 12, borderRadius: 10, background: '#161616', marginBottom: 8,
              alignItems: 'center',
            }}>
              <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden' }}>
                <ProductArt initials={it.p.initials} category={it.p.cat} idx={it.p.idx} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{it.p.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{it.p.platform} · Qté {it.qty}</div>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>
                  {(it.p.price * it.qty).toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <button onClick={() => onRemove(it.p.id)} style={{
                width: 28, height: 28, borderRadius: 6, border: 'none',
                background: '#222', color: '#aaa', cursor: 'pointer',
              }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: '#aaa', fontSize: 14 }}>Total</span>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <button
            onMouseEnter={() => setCheckHover(true)}
            onMouseLeave={() => setCheckHover(false)}
            style={{
            width: '100%', height: 50, borderRadius: 10, border: 'none',
            background: checkHover ? '#fff' : 'var(--accent)',
            color: checkHover ? '#0f0f0f' : '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.18s ease, color 0.18s ease',
          }}>Passer au paiement</button>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
const Footer = () => {
  const isMobile = useIsMobile();
  return (
  <footer style={{ marginTop: isMobile ? 48 : 80, borderTop: '1px solid #1f1f1f', background: '#0a0a0a' }}>
    <div style={{
      maxWidth: 1480, margin: '0 auto',
      padding: isMobile ? '32px 16px 16px' : '40px 28px 20px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr 1fr',
      gap: isMobile ? 24 : 32,
    }}>
      <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
        <Logo size={24} />
        <p style={{ fontSize: 13, color: '#888', marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>
          La marketplace africaine des abonnements numériques. Activation instantanée,
          paiement local.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          {['Orange Money', 'MTN MoMo', 'Wave', 'PayPal', 'Visa', 'Mastercard'].map((m) => (
            <span key={m} style={{
              padding: '4px 0', fontSize: 12, fontWeight: 600, color: '#bbb',
            }}>{m}</span>
          ))}
        </div>
      </div>
      {[
        { t: 'WalanoCast', l: [['À propos', '#/about'], ['Carrières', '#'], ['Presse', '#'], ['Affiliation', '#']] },
        { t: 'Support', l: [['Centre d’aide', '#/faq'], ['Statut', '#'], ['Nous contacter', '#/faq'], ['Garantie', '#/faq']] },
        { t: 'Acheter', l: [['Cartes cadeaux', '#/'], ['Abonnements', '#/'], ['Recharges', '#/'], ['Gaming', '#/']] },
        { t: 'Communauté', l: [['Discord', '#'], ['Telegram', '#'], ['Twitter', '#'], ['Instagram', '#']] },
      ].map((g) => (
        <div key={g.t}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 14}}>{g.t}</div>
          {g.l.map(([label, href]) => (
            <a key={label} href={href} style={{ display: 'block', fontSize: 13, color: '#999', textDecoration: 'none', padding: '5px 0' }}>{label}</a>
          ))}
        </div>
      ))}
    </div>
    <div style={{
      borderTop: '1px solid #1a1a1a', maxWidth: 1480, margin: '0 auto',
      padding: isMobile ? '14px 16px' : '16px 28px',
      display: 'flex', justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row', gap: 6,
      fontSize: 12, color: '#666',
    }}>
      <span>© 2026 WalanoCast · Tous droits réservés</span>
      <span style={{ display: 'inline-flex', gap: 18 }}>
        <a href="#/privacy" style={{ color: '#888', textDecoration: 'none' }}>Confidentialité</a>
        <a href="#/privacy" style={{ color: '#888', textDecoration: 'none' }}>Conditions</a>
        <a href="#/faq" style={{ color: '#888', textDecoration: 'none' }}>Aide</a>
      </span>
    </div>
  </footer>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
Object.assign(window, {
  useIsMobile,
  Icon, Logo, Header, Hero, HeroSlide, HeroArt, TrustBar, CategoryNav, ProductArt,
  ProductCard, ProductGrid, SectionTitle, Banner, CartDrawer, Footer,
  HERO_SLIDES, CATS,
});
