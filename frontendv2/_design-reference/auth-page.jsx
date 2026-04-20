// WalanoCast — Auth page (login + register), full-bleed split layout
// Loads after components.jsx. Reads Logo, Icon, useIsMobile from window.

const { useState: _aUseState, useEffect: _aUseEffect } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────
const AuthField = ({ label, type = 'text', icon, placeholder, value, onChange, required, rightSlot }) => {
  const [focused, setFocused] = _aUseState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
        {label}{required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        background: '#161616', borderRadius: 10,
        boxShadow: focused ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px #232323',
        transition: 'box-shadow 0.15s ease',
      }}>
        {icon && (
          <div style={{ position: 'absolute', left: 14, color: '#9a9a9a', display: 'flex' }}>
            <Icon name={icon} size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%', height: 50,
            paddingLeft: icon ? 44 : 14, paddingRight: rightSlot ? 50 : 14,
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14, fontFamily: 'inherit',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 10 }}>{rightSlot}</div>
        )}
      </div>
    </div>
  );
};

const Checkbox = ({ label, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'transparent', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', padding: 0, color: '#cfcfcf', fontSize: 13,
    }}>
    <span style={{
      width: 16, height: 16, borderRadius: 4,
      background: checked ? 'var(--accent)' : '#0f0f0f',
      boxShadow: 'inset 0 0 0 1.5px #2d2d2d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5 9-12" />
        </svg>
      )}
    </span>
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Left panel — red, with rotating taglines
// ─────────────────────────────────────────────────────────────────────────────
const AUTH_TAGLINES = [
  {
    h: 'Active tes abonnements en moins d’une minute.',
    p: 'WalanoCast réunit film, musique, IA, gaming et cartes cadeaux dans un seul panier. Payé en Franc CFA, livré instantanément.',
  },
  {
    h: 'Économise jusqu’à 4× avec Cast+.',
    p: 'Profite des prix membres, livraison prioritaire et garantie 12 mois sur tout le catalogue.',
  },
  {
    h: 'Paiement local, support 24/7.',
    p: 'Wave, MoMo, Orange Money, Visa et PayPal acceptés. Notre équipe répond sous 5 minutes.',
  },
  {
    h: 'Légal. Garanti. Africain.',
    p: 'Comptes officiels et codes mutualisés certifiés, optimisés pour l’Afrique francophone.',
  },
];

const AuthLeftPanel = ({ idx, onDot }) => {
  const t = AUTH_TAGLINES[idx];
  return (
    <div style={{
      position: 'relative', background: '#e91035',
      padding: '40px 56px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      overflow: 'hidden',
    }}>
      {/* decorative shapes */}
      <div style={{
        position: 'absolute', right: -120, top: -120, width: 380, height: 380,
        borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
      }} />
      <div style={{
        position: 'absolute', right: 80, top: 220, width: 80, height: 80,
        borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{
        position: 'absolute', left: -60, bottom: -80, width: 220, height: 220,
        background: 'rgba(255,255,255,0.05)', transform: 'rotate(18deg)', borderRadius: 32,
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
        <defs>
          <pattern id="authgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" stroke="#fff" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authgrid)" />
      </svg>

      {/* logo */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <a href="#/" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          <Logo size={26} />
        </a>
      </div>

      {/* tagline */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
        <h2 style={{
          margin: 0, fontSize: 44, lineHeight: 1.05, fontWeight: 900, color: '#fff',
          fontFamily: 'var(--font-display)',
        }}>{t.h}</h2>
        <p style={{
          marginTop: 18, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)',
          maxWidth: 460,
        }}>{t.p}</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 36 }}>
          {AUTH_TAGLINES.map((_, i) => (
            <button key={i} onClick={() => onDot(i)} style={{
              width: i === idx ? 28 : 10, height: 4, borderRadius: 2,
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.2s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Right panel — form (login or register)
// ─────────────────────────────────────────────────────────────────────────────
const AuthForm = ({ mode }) => {
  const [email, setEmail] = _aUseState('');
  const [password, setPassword] = _aUseState('');
  const [confirm, setConfirm] = _aUseState('');
  const [name, setName] = _aUseState('');
  const [remember, setRemember] = _aUseState(true);
  const [showPwd, setShowPwd] = _aUseState(false);
  const [loginHover, setLoginHover] = _aUseState(false);
  const [googleHover, setGoogleHover] = _aUseState(false);

  const isLogin = mode === 'login';

  return (
    <div style={{
      padding: '40px 56px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 900, color: '#fff',
          fontFamily: 'var(--font-display)',
        }}>
          {isLogin ? 'Bienvenue à nouveau !' : 'Crée ton compte'}
        </h1>
        <p style={{
          marginTop: 10, fontSize: 14.5, color: '#9a9a9a',
        }}>
          {isLogin
            ? 'Indique tes informations pour te connecter à ton compte.'
            : 'Quelques infos suffisent pour commencer à acheter sur WalanoCast.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 32 }}>
          {!isLogin && (
            <AuthField
              label="Nom complet" type="text" icon="user" required
              placeholder="Jean Mballa"
              value={name} onChange={setName}
            />
          )}
          <AuthField
            label="Adresse e-mail" type="email" icon="user" required
            placeholder="jean@exemple.com"
            value={email} onChange={setEmail}
          />
          <AuthField
            label={isLogin ? 'Mot de passe' : 'Choisis un mot de passe'}
            type={showPwd ? 'text' : 'password'} icon="shield" required
            placeholder="••••••••"
            value={password} onChange={setPassword}
            rightSlot={
              <button onClick={() => setShowPwd(!showPwd)} aria-label="Afficher / masquer"
                style={{
                  width: 34, height: 34, borderRadius: 6, border: 'none',
                  background: 'transparent', color: '#9a9a9a', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {showPwd ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22" />
                  </svg>
                )}
              </button>
            }
          />
          {!isLogin && (
            <AuthField
              label="Confirme ton mot de passe" type={showPwd ? 'text' : 'password'} icon="shield" required
              placeholder="••••••••"
              value={confirm} onChange={setConfirm}
            />
          )}
        </div>

        {isLogin && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 18,
          }}>
            <Checkbox label="Se souvenir de moi" checked={remember} onChange={setRemember} />
            <a href="#/login" style={{
              fontSize: 13, color: '#cfcfcf', textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}>Mot de passe oublié ?</a>
          </div>
        )}

        <button
          onMouseEnter={() => setLoginHover(true)}
          onMouseLeave={() => setLoginHover(false)}
          style={{
            width: '100%', marginTop: 28, height: 52, borderRadius: 10, border: 'none',
            background: loginHover ? 'var(--accent)' : '#fff',
            color: loginHover ? '#fff' : '#0f0f0f',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.18s ease, color 0.18s ease',
          }}>
          {isLogin ? 'Se connecter' : 'Créer mon compte'}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginTop: 24, marginBottom: 18,
          color: '#666', fontSize: 12, fontWeight: 600,
        }}>
          <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
          ou avec
          <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
        </div>

        <button
          onMouseEnter={() => setGoogleHover(true)}
          onMouseLeave={() => setGoogleHover(false)}
          style={{
            width: '100%', height: 50, borderRadius: 10,
            background: googleHover ? '#1a1a1a' : '#0f0f0f',
            color: '#fff',
            border: '1px solid #2a2a2a',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'background 0.15s ease',
          }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.1 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3a21 21 0 1 0 0 42c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3a21 21 0 0 0-17.7 11.7z" />
            <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.3a12 12 0 0 1-7.3 2.5c-5.2 0-9.6-3.3-11.3-8l-6.5 5a21 21 0 0 0 17.8 11.1z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.4l6.3 5.3C42 35.1 45 30 45 24c0-1.2-.1-2.3-.4-3.5z" />
          </svg>
          Continuer avec Google
        </button>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13.5, color: '#9a9a9a' }}>
          {isLogin ? (
            <>Pas encore de compte ? <a href="#/register" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Inscris-toi</a></>
          ) : (
            <>Déjà un compte ? <a href="#/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Connecte-toi</a></>
          )}
        </div>

        <div style={{
          marginTop: 22, textAlign: 'center', fontSize: 12, lineHeight: 1.7, color: '#666',
        }}>
          En {isLogin ? 'te connectant' : "t'inscrivant"}, tu acceptes nos{' '}
          <a href="#/privacy" style={{ color: '#9a9a9a', textDecoration: 'underline', textUnderlineOffset: 3 }}>Conditions d’utilisation</a>{' '}
          et notre{' '}
          <a href="#/privacy" style={{ color: '#9a9a9a', textDecoration: 'underline', textUnderlineOffset: 3 }}>Politique de confidentialité</a>.
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthPage — full bleed split
// ─────────────────────────────────────────────────────────────────────────────
const AuthPage = ({ mode = 'login' }) => {
  const [taglineIdx, setTaglineIdx] = _aUseState(0);

  // Rotate left tagline every 6s
  _aUseEffect(() => {
    const id = setInterval(() => setTaglineIdx((i) => (i + 1) % AUTH_TAGLINES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-screen-label="03 Auth" style={{
      minHeight: '100vh',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: '#0f0f0f',
    }}>
      <AuthLeftPanel idx={taglineIdx} onDot={setTaglineIdx} />
      <AuthForm mode={mode} />
    </div>
  );
};

Object.assign(window, { AuthPage });
