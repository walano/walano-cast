'use client'
// Management sidebar: collapsible groups (+ / −), one page per resource.
// The group containing the current page auto-expands.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Item = { href: string; label: string }
type Group = { label: string; base: string; items: Item[] }

export default function Sidebar({ locale, email }: { locale: string; email: string }) {
  const pathname = usePathname()
  const root = `/${locale}/management`

  const groups: Group[] = [
    {
      label: 'Commandes', base: `${root}/orders`, items: [
        { href: `${root}/orders/validation`, label: 'À valider' },
        { href: `${root}/orders/manual`, label: 'À traiter (manuel)' },
        { href: `${root}/orders/stuck`, label: 'En approvisionnement' },
      ],
    },
    {
      label: 'Catalogue', base: `${root}/catalog`, items: [
        { href: `${root}/catalog/categories`, label: 'Catégories' },
        { href: `${root}/catalog/services`, label: 'Services' },
        { href: `${root}/catalog/plans`, label: 'Offres' },
      ],
    },
    {
      label: 'Stock', base: `${root}/inventory`, items: [
        { href: `${root}/inventory/items`, label: 'Clés & liens' },
        { href: `${root}/inventory/accounts`, label: 'Comptes partagés' },
      ],
    },
  ]

  const singles: Item[] = [
    { href: `${root}/payments`, label: 'Paiements' },
    { href: `${root}/ledger`, label: 'Transactions' },
    { href: `${root}/audit`, label: 'Journal' },
  ]

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.label, pathname.startsWith(g.base)])))

  return (
    <aside style={{ borderRight: '1px solid #1a1a1a', padding: '24px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Link href={root} style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)' }}>
        Management
      </Link>
      <div style={{ height: 1, background: '#1a1a1a', margin: '10px 0' }} />

      {groups.map((g) => {
        const isOpen = open[g.label] || pathname.startsWith(g.base)
        return (
          <div key={g.label}>
            <button
              onClick={() => setOpen((o) => ({ ...o, [g.label]: !isOpen }))}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent',
                color: pathname.startsWith(g.base) ? '#fff' : '#cfcfcf',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {g.label}
              <span style={{ color: '#666', fontSize: 15, fontWeight: 400 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 4 }}>
                {g.items.map((it) => <SubLink key={it.href} item={it} active={pathname === it.href} />)}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ height: 1, background: '#1a1a1a', margin: '10px 0' }} />
      {singles.map((it) => (
        <Link key={it.href} href={it.href} style={{
          padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
          color: pathname === it.href ? '#fff' : '#cfcfcf',
          background: pathname === it.href ? '#1a1a1a' : 'transparent',
          fontSize: 14, fontWeight: 700,
        }}>
          {it.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />
      <div style={{ padding: '8px 12px', fontSize: 11, color: '#666', lineHeight: 1.5 }}>
        <div style={{ color: '#9a9a9a', fontWeight: 600 }}>{email}</div>
        <div>admin</div>
      </div>
      <Link href={`/${locale}`} style={{ padding: '8px 12px', fontSize: 12, color: '#9a9a9a', textDecoration: 'none' }}>← Retour storefront</Link>
    </aside>
  )
}

function SubLink({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link href={item.href} style={{
      padding: '8px 12px 8px 26px', borderRadius: 8, textDecoration: 'none',
      color: active ? '#fff' : '#9a9a9a',
      background: active ? '#1a1a1a' : 'transparent',
      fontSize: 13, fontWeight: 600,
      borderLeft: active ? '2px solid #e91035' : '2px solid transparent',
    }}>
      {item.label}
    </Link>
  )
}
