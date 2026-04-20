'use client'
// Client chrome for the storefront: cart provider + sticky header + content slot
// + footer + toast. No cart drawer — one purchase at a time, triggered from the
// product page directly.

import type { ReactNode } from 'react'
import { CartProvider, useCart } from './cart-context'
import { Header } from './Header'
import { Footer } from './Footer'
import { Icon } from './primitives'

function Toast() {
  const { toast } = useCart()
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', zIndex: 200, padding: '14px 24px', borderRadius: 10,
      background: '#fff', color: '#0f0f0f', fontSize: 14, fontWeight: 700, boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      animation: 'pulseToast 0.25s ease', display: 'flex', alignItems: 'center', gap: 10,
      transform: 'translateX(-50%)',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={14} stroke={2.5} />
      </span>
      {toast}
    </div>
  )
}

export function StoreShell({ locale, userLoggedIn, children }: { locale: string; userLoggedIn: boolean; children: ReactNode }) {
  return (
    <CartProvider locale={locale}>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header locale={locale} userLoggedIn={userLoggedIn} />
        <main>{children}</main>
        <Footer locale={locale} />
      </div>
      <Toast />
    </CartProvider>
  )
}
