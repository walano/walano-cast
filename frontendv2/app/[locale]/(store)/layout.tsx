import { createClient } from '@/lib/supabase/server'
import { StoreShell } from '@/components/store/StoreShell'

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <StoreShell locale={locale} userLoggedIn={!!user}>
      {children}
    </StoreShell>
  )
}
