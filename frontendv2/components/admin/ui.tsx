'use client'
// Small shared primitives for the management UI (dark, red accent #e91035).

import { type CSSProperties, type ReactNode } from 'react'

export const card: CSSProperties = {
  background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20,
}

export const input: CSSProperties = {
  width: '100%', height: 38, padding: '0 12px', borderRadius: 8,
  border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#fff',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

export const textarea: CSSProperties = {
  ...input, height: 'auto', minHeight: 90, padding: '10px 12px', resize: 'vertical',
}

export const label: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#9a9a9a', marginBottom: 6,
}

export function Btn({
  children, onClick, kind = 'default', disabled, type,
}: {
  children: ReactNode
  onClick?: () => void
  kind?: 'default' | 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const colors: Record<string, CSSProperties> = {
    default: { background: '#1e1e1e', color: '#fff' },
    primary: { background: '#e91035', color: '#fff' },
    danger: { background: 'transparent', color: '#ff5c72', border: '1px solid #4a1520' },
    ghost: { background: 'transparent', color: '#9a9a9a' },
  }
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
        fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', ...colors[kind],
      }}
    >
      {children}
    </button>
  )
}

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  pending_payment: { bg: '#2a2208', fg: '#eab308', label: 'En attente paiement' },
  awaiting_validation: { bg: '#0e2438', fg: '#38bdf8', label: 'À valider' },
  paid: { bg: '#2a1508', fg: '#f97316', label: 'Payé — non livré' },
  fulfilling: { bg: '#1c0f2e', fg: '#a78bfa', label: 'En traitement' },
  fulfilled: { bg: '#0a2818', fg: '#22c55e', label: 'Livré' },
  rejected: { bg: '#2e0d14', fg: '#ff5c72', label: 'Rejeté' },
  expired: { bg: '#1a1a1a', fg: '#777', label: 'Expiré' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#1a1a1a', fg: '#999', label: status }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  )
}

export function fmtXAF(n: number | string) {
  return `${new Intl.NumberFormat('fr-FR').format(Number(n))} XAF`
}

export const th: CSSProperties = {
  textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700,
  color: '#777', textTransform: 'uppercase', letterSpacing: 0.5,
  borderBottom: '1px solid #1e1e1e', whiteSpace: 'nowrap',
}

export const td: CSSProperties = {
  padding: '12px', fontSize: 13, borderBottom: '1px solid #161616', verticalAlign: 'top',
}
