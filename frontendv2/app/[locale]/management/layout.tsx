// Management section layout. Auth-gated (admin only) via getAdminSession.
// Distinct from the storefront chrome: no cart provider, no public header.

import { getAdminSession } from '@/lib/management'
import Sidebar from '@/components/admin/Sidebar'

export default async function ManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { user } = await getAdminSession(locale)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'grid', gridTemplateColumns: '230px 1fr' }}>
      <Sidebar locale={locale} email={user.email ?? ''} />
      <main style={{ padding: '32px 40px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
