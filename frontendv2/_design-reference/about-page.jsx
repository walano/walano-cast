// WalanoCast — About page
// Hero portrait + intro, then story + tags. Adapted to brand context.

const { useState: _abUseState } = React;

const StatCard = ({ value, label }) => (
  <div style={{
    padding: '24px 28px', background: '#121212', borderRadius: 14,
  }}>
    <div style={{
      fontSize: 36, fontWeight: 900, color: '#fff',
      fontFamily: 'var(--font-display)',
    }}>{value}</div>
    <div style={{ marginTop: 6, fontSize: 13, color: '#9a9a9a', lineHeight: 1.4 }}>{label}</div>
  </div>
);

const Pill = ({ label }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '8px 14px', background: '#161616', borderRadius: 999,
    fontSize: 12, fontWeight: 700, color: '#cfcfcf',
    whiteSpace: 'nowrap',
  }}>{label}</div>
);

const BrandPortrait = () => (
  // Placeholder portrait area — soft red glow + WalanoCast monogram
  <div style={{
    position: 'relative', width: 260, height: 320, borderRadius: 14, overflow: 'hidden',
    background: '#0f0f0f',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(80% 70% at 50% 35%, rgba(233,16,53,0.45) 0%, transparent 70%),
                   linear-gradient(160deg, #1a0710 0%, #0a0508 100%)`,
    }} />
    <div style={{
      position: 'absolute', inset: '14% 18%',
      borderRadius: 8, overflow: 'hidden',
      background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 60%),
                   linear-gradient(180deg, #1d0612 0%, #0a0306 100%)`,
    }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        <path d="M30 60l16 110 26-88 30 88 32-88 16 88 22-110" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="166" cy="48" r="14" fill="#e91035" />
      </svg>
    </div>
    {/* soft scan glow */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, transparent 55%, rgba(233,16,53,0.18) 100%)',
    }} />
  </div>
);

const AboutPage = () => {
  return (
    <div data-screen-label="04 About" style={{
      maxWidth: 1480, margin: '0 auto', padding: '40px 28px 80px',
    }}>
      {/* Hero card */}
      <section style={{
        background: '#121212', borderRadius: 24,
        padding: '64px 72px', position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="aboutgrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" stroke="#fff" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aboutgrid)" />
        </svg>

        <div style={{
          position: 'relative', display: 'grid', gridTemplateColumns: '260px 1fr',
          gap: 56, alignItems: 'center',
        }}>
          <BrandPortrait />
          <div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12,
            }}>À PROPOS DE NOUS</div>
            <h1 style={{
              margin: 0, fontSize: 64, lineHeight: 1, fontWeight: 900, color: '#fff',
              fontFamily: 'var(--font-display)',
            }}>Bonjour !</h1>
            <p style={{
              marginTop: 22, fontSize: 17, lineHeight: 1.65, color: '#cfcfcf',
              maxWidth: 580,
            }}>
              Nous sommes WalanoCast, la marketplace africaine des abonnements numériques.
              Notre objectif : rendre Netflix, Spotify, ChatGPT, Xbox et les cartes cadeaux
              accessibles partout en Afrique francophone, en Franc CFA, livrés en moins
              d’une minute.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          marginTop: 64,
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
        }}>
          <StatCard value="48 000+" label="Comptes activés depuis 2023" />
          <StatCard value="9" label="Pays d’Afrique francophone couverts" />
          <StatCard value="60 sec" label="Délai moyen d’activation" />
          <StatCard value="4,8 / 5" label="Note moyenne sur +12 400 avis" />
        </div>
      </section>

      {/* Story + values */}
      <section style={{
        marginTop: 32,
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48,
        padding: '20px 8px',
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 36, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>Notre histoire</h2>
          <p style={{
            marginTop: 18, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf',
          }}>
            WalanoCast est né à Yaoundé en 2023 d’un constat simple : payer un abonnement
            Spotify ou Netflix depuis l’Afrique centrale relevait du parcours du combattant.
            Carte bancaire compliquée, prix en dollars, comptes bloqués pour cause de région.
          </p>
          <p style={{
            marginTop: 14, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf',
          }}>
            Trois ans plus tard, nous opérons à Yaoundé, Libreville, Brazzaville et N’Djamena,
            avec une équipe support locale joignable en français 24/7 sur WhatsApp, et un
            catalogue de 200+ abonnements numériques officiels.
          </p>
          <p style={{
            marginTop: 14, fontSize: 15, lineHeight: 1.7, color: '#cfcfcf',
          }}>
            Tous nos packs sont garantis 12 mois, livrés en moins d’une minute et payables
            en Franc CFA via Wave, Orange Money, MTN MoMo, Visa, Mastercard ou PayPal.
          </p>
        </div>
        <div>
          <h2 style={{
            margin: 0, fontSize: 36, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>Ce qu’on fait</h2>
          <div style={{
            marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 8,
          }}>
            {[
              'Abonnements streaming', 'Comptes IA', 'Crédits gaming',
              'Cartes cadeaux', 'Recharges téléphoniques', 'Profils famille',
              'Activation instantanée', 'Garantie 12 mois', 'Paiement Franc CFA',
              'Support WhatsApp 24/7', 'Comptes mutualisés certifiés', 'Codes officiels',
              'Multi-régions', 'Sans carte bancaire requise',
            ].map((x) => <Pill key={x} label={x} />)}
          </div>
        </div>
      </section>

      {/* CTA card */}
      <section style={{
        marginTop: 56, position: 'relative', overflow: 'hidden',
        borderRadius: 18,
        background: `radial-gradient(80% 120% at 90% 50%, rgba(233,16,53,0.5), transparent 60%),
                     linear-gradient(135deg, #1a0710 0%, #2a0916 100%)`,
        padding: '52px 56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32,
      }}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', opacity: 0.7, marginBottom: 12 }}>
            REJOINS LA COMMUNAUTÉ
          </div>
          <h2 style={{
            margin: 0, fontSize: 36, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-display)', lineHeight: 1.1,
          }}>
            Prêt à activer ton premier pack ?
          </h2>
          <p style={{ marginTop: 14, fontSize: 14.5, color: 'rgba(255,255,255,0.75)' }}>
            Crée ton compte WalanoCast en 30 secondes et accède aux prix membres Cast+.
          </p>
        </div>
        <a href="#/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 52, padding: '0 28px', borderRadius: 10,
          background: '#fff', color: '#0f0f0f',
          fontSize: 15, fontWeight: 700, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          Créer mon compte <Icon name="chevronRight" size={16} />
        </a>
      </section>
    </div>
  );
};

Object.assign(window, { AboutPage });
