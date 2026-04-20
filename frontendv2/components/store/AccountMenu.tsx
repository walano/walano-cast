'use client'
// "Mon compte" dropdown: Mon compte / Mes abonnements / Historique de
// paiement / Déconnexion. Renders its trigger as children; closes on outside
// click and on navigation.

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AccountMenu({ locale, children }: { locale: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  const item: React.CSSProperties = {
    display: 'block', padding: '11px 16px', fontSize: 13.5, fontWeight: 600,
    color: '#fff', textDecoration: 'none', borderRadius: 8, whiteSpace: 'nowrap',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', display: 'block' }}>
        {children}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 80,
          background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 12,
          padding: 6, minWidth: 210, boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}>
          <Link href={`/${locale}/account`} onClick={() => setOpen(false)} className="om-search-result" style={item}>Mon compte</Link>
          <Link href={`/${locale}/abonnements`} onClick={() => setOpen(false)} className="om-search-result" style={item}>Mes abonnements</Link>
          <Link href={`/${locale}/historique`} onClick={() => setOpen(false)} className="om-search-result" style={item}>Historique de paiement</Link>
          <div style={{ height: 1, background: '#1f1f1f', margin: '6px 4px' }} />
          <button onClick={signOut} className="om-search-result" style={{ ...item, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#ff8fa3' }}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
