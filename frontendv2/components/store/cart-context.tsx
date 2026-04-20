'use client'
// Cart + wishlist, persisted in localStorage. A cart line = one subscription
// (service + plan). The same plan can appear multiple times (separate lines,
// each gets its own checkout fields at checkout). Cap enforced server-side too.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export type CartItem = {
  lineId: string
  serviceId: string
  planId: string
  serviceName: string
  planLabel: string
  price: number
  logo: string | null
  cat: string
}

const MAX_ITEMS = 10
const STORAGE_KEY = 'wc_cart_v1'

type CartCtx = {
  cart: CartItem[]
  count: number
  total: number
  wishlist: Set<string>
  toast: string | null
  addItem: (item: Omit<CartItem, 'lineId'>, opts?: { silent?: boolean }) => boolean
  removeItem: (lineId: string) => void
  clearCart: () => void
  toggleWish: (id: string) => void
}

const Ctx = createContext<CartCtx | null>(null)

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export function CartProvider({ children }: { locale?: string; children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCart(JSON.parse(raw))
    } catch { /* ignore corrupt storage */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch { /* quota */ }
  }, [cart])

  const flash = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const addItem = useCallback<CartCtx['addItem']>((item, opts) => {
    let ok = true
    setCart((c) => {
      if (c.length >= MAX_ITEMS) { ok = false; return c }
      return [...c, { ...item, lineId: crypto.randomUUID() }]
    })
    if (!ok) { flash(`Panier plein (max ${MAX_ITEMS} articles).`); return false }
    if (!opts?.silent) flash('Ajouté au panier')
    return true
  }, [flash])

  const removeItem = useCallback((lineId: string) => {
    setCart((c) => c.filter((i) => i.lineId !== lineId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWish = useCallback((id: string) => {
    setWishlist((w) => {
      const n = new Set(w)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }, [])

  const total = cart.reduce((s, i) => s + i.price, 0)

  return (
    <Ctx.Provider value={{ cart, count: cart.length, total, wishlist, toast, addItem, removeItem, clearCart, toggleWish }}>
      {children}
    </Ctx.Provider>
  )
}
