'use client'
// Auth (login + register) ported from the v2 prototype, wired to Supabase:
// Google OAuth + email/password. Full-bleed split layout, no store chrome.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Logo, Icon, useIsMobile } from '@/components/store/primitives'

const TAGLINES = [
  { h: "Active tes abonnements en moins d'une minute.", p: 'WalanoCast réunit film, musique, IA, gaming et cartes cadeaux. Payé en Franc CFA, livré instantanément.' },
  { h: 'Garantie 12 mois sur chaque pack.', p: 'En cas de panne, on remplace ton accès gratuitement via WhatsApp ou Telegram, sous 5 minutes.' },
  { h: 'Paiement local, support 24/7.', p: 'Wave, MoMo, Orange Money, Visa et PayPal acceptés. Réponse sous 5 minutes.' },
  { h: 'Légal. Garanti. Africain.', p: 'Comptes officiels et codes mutualisés certifiés, optimisés pour l’Afrique francophone.' },
]

const AuthField = ({ label, type = 'text', icon, placeholder, value, onChange, required, rightSlot }: {
  label: string; type?: string; icon?: Parameters<typeof Icon>[0]['name']; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean; rightSlot?: React.ReactNode
}) => {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{label}{required && <span style={{ color: 'var(--accent)' }}>*</span>}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#161616', borderRadius: 10, boxShadow: focused ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px #232323', transition: 'box-shadow 0.15s ease' }}>
        {icon && <div style={{ position: 'absolute', left: 14, color: '#9a9a9a', display: 'flex' }}><Icon name={icon} size={18} /></div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder}
          style={{ width: '100%', height: 50, paddingLeft: icon ? 44 : 14, paddingRight: rightSlot ? 50 : 14, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
        {rightSlot && <div style={{ position: 'absolute', right: 10 }}>{rightSlot}</div>}
      </div>
    </div>
  )
}

function AuthLeftPanel({ idx, onDot }: { idx: number; onDot: (i: number) => void }) {
  const t = TAGLINES[idx]
  return (
    <div style={{ position: 'relative', background: '#e91035', padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -120, top: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', left: -60, bottom: -80, width: 220, height: 220, background: 'rgba(255,255,255,0.05)', transform: 'rotate(18deg)', borderRadius: 32 }} />
      <div style={{ position: 'relative', zIndex: 2 }}><Link href="/" style={{ display: 'inline-flex', textDecoration: 'none' }}><Logo size={26} /></Link></div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
        <h2 style={{ margin: 0, fontSize: 44, lineHeight: 1.05, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{t.h}</h2>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', maxWidth: 460 }}>{t.p}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 36 }}>
          {TAGLINES.map((_, i) => <button key={i} onClick={() => onDot(i)} style={{ width: i === idx ? 28 : 10, height: 4, borderRadius: 2, background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s ease' }} />)}
        </div>
      </div>
    </div>
  )
}

export function AuthPage({ locale, mode: initialMode, next }: { locale: string; mode: 'login' | 'register'; next?: string }) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [mode, setMode] = useState(initialMode)
  const [idx, setIdx] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isLogin = mode === 'login'
  const dest = next || `/${locale}/account`

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TAGLINES.length), 6000)
    return () => clearInterval(id)
  }, [])

  async function handleGoogle() {
    setError(null)
    const supabase = createClient()
    const params = new URLSearchParams({ next: dest })
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${locale}/auth/callback?${params}` },
    })
  }

  async function handleSubmit() {
    setError(null); setNotice(null)
    if (!email || !password) { setError('E-mail et mot de passe requis.'); return }
    if (!isLogin && password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setBusy(true)
    const supabase = createClient()
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(dest)
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(dest)}` },
        })
        if (error) throw error
        if (data.session) { router.push(dest); router.refresh() }
        else setNotice('Compte créé. Vérifie ton e-mail pour confirmer ton inscription.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setBusy(false)
    }
  }

  const form = (
    <div style={{ padding: isMobile ? '40px 24px' : '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>{isLogin ? 'Bienvenue à nouveau !' : 'Crée ton compte'}</h1>
        <p style={{ marginTop: 10, fontSize: 14.5, color: '#9a9a9a' }}>{isLogin ? 'Indique tes informations pour te connecter.' : 'Quelques infos suffisent pour commencer.'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 32 }}>
          {!isLogin && <AuthField label="Nom complet" icon="user" required placeholder="Jean Mballa" value={name} onChange={setName} />}
          <AuthField label="Adresse e-mail" type="email" icon="user" required placeholder="jean@exemple.com" value={email} onChange={setEmail} />
          <AuthField label={isLogin ? 'Mot de passe' : 'Choisis un mot de passe'} type={showPwd ? 'text' : 'password'} icon="shield" required placeholder="••••••••" value={password} onChange={setPassword}
            rightSlot={<button onClick={() => setShowPwd(!showPwd)} aria-label="Afficher / masquer" style={{ width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', color: '#9a9a9a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={showPwd ? 'user' : 'shield'} size={18} /></button>} />
          {!isLogin && <AuthField label="Confirme ton mot de passe" type={showPwd ? 'text' : 'password'} icon="shield" required placeholder="••••••••" value={confirm} onChange={setConfirm} />}
        </div>

        {error && <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(233,16,53,0.12)', color: '#ff8fa3', fontSize: 13 }}>{error}</div>}
        {notice && <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(121,232,75,0.12)', color: '#9ff07a', fontSize: 13 }}>{notice}</div>}

        <button onClick={handleSubmit} disabled={busy} style={{ width: '100%', marginTop: 24, height: 52, borderRadius: 10, border: 'none', background: '#fff', color: '#0f0f0f', fontSize: 15, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.6 : 1 }}>
          {busy ? '…' : isLogin ? 'Se connecter' : 'Créer mon compte'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24, marginBottom: 18, color: '#666', fontSize: 12, fontWeight: 600 }}>
          <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />ou avec<div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
        </div>

        <button onClick={handleGoogle} style={{ width: '100%', height: 50, borderRadius: 10, background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.1 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3a21 21 0 1 0 0 42c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3a21 21 0 0 0-17.7 11.7z" /><path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.3a12 12 0 0 1-7.3 2.5c-5.2 0-9.6-3.3-11.3-8l-6.5 5a21 21 0 0 0 17.8 11.1z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.4l6.3 5.3C42 35.1 45 30 45 24c0-1.2-.1-2.3-.4-3.5z" /></svg>
          Continuer avec Google
        </button>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13.5, color: '#9a9a9a' }}>
          {isLogin ? (
            <>Pas encore de compte ? <button onClick={() => { setMode('register'); setError(null) }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5 }}>Inscris-toi</button></>
          ) : (
            <>Déjà un compte ? <button onClick={() => { setMode('login'); setError(null) }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5 }}>Connecte-toi</button></>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) return <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>{form}</div>

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0f0f0f' }}>
      <AuthLeftPanel idx={idx} onDot={setIdx} />
      {form}
    </div>
  )
}
