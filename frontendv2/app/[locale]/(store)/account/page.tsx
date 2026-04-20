// "Mon compte": profile (nom, téléphone WhatsApp) + email + logout.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/account/ProfileForm'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth?next=/${locale}/account`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>
        Mon compte
      </h1>
      <p style={{ color: '#9a9a9a', fontSize: 14, margin: '0 0 28px' }}>{user.email}</p>
      <ProfileForm
        initialName={profile?.display_name ?? ''}
        initialPhone={profile?.phone ?? ''}
      />
    </div>
  )
}
