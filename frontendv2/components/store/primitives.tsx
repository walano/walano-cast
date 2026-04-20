'use client'
// Shared design primitives ported from the v2 prototype (components.jsx).
// Icons, brand mark, responsive hook and the gradient product artwork.

import { useState, useEffect, type CSSProperties } from 'react'

// ── Responsive helper ────────────────────────────────────────────────────────
export const useIsMobile = (bp = 760) => {
  const [m, setM] = useState(false)
  useEffect(() => {
    const onR = () => setM(window.innerWidth < bp)
    onR()
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [bp])
  return m
}

// ── Icons (minimal stroke set, 24px viewBox) ─────────────────────────────────
type IconName =
  | 'search' | 'heart' | 'cart' | 'user' | 'globe' | 'grid' | 'film' | 'music'
  | 'ai' | 'gamepad' | 'gift' | 'chevronRight' | 'chevronLeft' | 'chevronDown'
  | 'plus' | 'check' | 'flash' | 'shield' | 'star' | 'headphones'

export const Icon = ({ name, size = 20, stroke = 1.75 }: { name: IconName; size?: number; stroke?: number }) => {
  const paths: Record<IconName, React.ReactNode> = {
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
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  )
}

// ── Brand mark (W with red broadcast wave) ───────────────────────────────────
export const Logo = ({ size = 28 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size + 4} height={size + 4} viewBox="0 0 32 32" fill="none">
      <path d="M4 8l3 16 5-12 4 12 5-12 3 12 4-16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="6" r="3" fill="#0f0f0f" />
    </svg>
    <span style={{ fontWeight: 900, fontSize: size * 0.78, color: '#fff', fontFamily: 'var(--font-display)' }}>
      Walano<span style={{ opacity: 0.85 }}>Cast</span>
    </span>
  </div>
)

// ── Product artwork (gradient placeholder, or real logo when available) ───────
const PALETTES: Record<string, string[][]> = {
  film: [['#250812', '#460b1a', '#e91035'], ['#1a0f24', '#2d1a3e', '#7c3aed'], ['#0a1820', '#103040', '#06b6d4'], ['#1a1208', '#3a2a10', '#f59e0b']],
  musique: [['#1a0822', '#330d4a', '#a855f7'], ['#082018', '#0e3a2d', '#10b981'], ['#220818', '#440f30', '#ec4899']],
  ia: [['#040c20', '#082045', '#3b82f6'], ['#08201c', '#0e4038', '#14b8a6'], ['#1c1408', '#382a0e', '#eab308']],
  gaming: [['#1a0a08', '#3a140e', '#f97316'], ['#08161a', '#0e3038', '#06b6d4']],
  cartes: [['#0a1a1f', '#103040', '#06b6d4'], ['#1f1408', '#3a2410', '#f59e0b']],
  autres: [['#1a0710', '#2a0916', '#e91035'], ['#101418', '#1c2630', '#64748b']],
}

export const ProductArt = ({ initials, category, idx, icon, banner }: { initials: string; category: string; idx: number; icon?: string | null; banner?: string | null }) => {
  // Admin-uploaded 4:3 banner wins over everything else (icon + gradient).
  if (banner) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={banner} alt={initials} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
      }} />
    )
  }
  const arr = PALETTES[category] || PALETTES.autres
  const p = arr[idx % arr.length]
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(120% 80% at 80% 20%, ${p[2]}55 0%, transparent 60%),
                   linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 100%)`,
    }}>
      <div style={{
        position: 'absolute', right: -30, bottom: -30, width: 140, height: 140,
        borderRadius: '50%', background: p[2], opacity: 0.35,
      }} />
      <div style={{
        position: 'absolute', left: 14, top: 14, padding: '4px 8px',
        borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff',
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      }}>{category}</div>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt={initials} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', padding: '22%', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))',
        }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, fontWeight: 900, color: '#fff',
          textShadow: '0 4px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)', opacity: 0.92,
        }}>{initials}</div>
      )}
    </div>
  )
}

export const pillBtnStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 10px',
  borderRadius: 8, border: 'none', background: 'transparent', color: '#fff',
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 0.12s ease',
}
