// Helpers for the management section. Server-side only.
// - Resolves the current session
// - Redirects to /auth when logged out, to /<locale> when not admin
// Admin = profiles.role === 'admin' (walano-cast-backend-spec.md §3.1)

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getAdminSession(locale: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/auth?next=/${locale}/management`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect(`/${locale}`)

  return { user, supabase, displayName: profile?.display_name ?? user.email ?? 'admin' }
}
