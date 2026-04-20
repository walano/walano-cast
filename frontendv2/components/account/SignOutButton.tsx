'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton({ locale }: { locale: string }) {
  const router = useRouter()
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }
  return (
    <button onClick={signOut} style={{
      width: '100%', padding: '14px 0', borderRadius: 10, border: '1px solid #1f1f1f',
      background: 'transparent', color: '#9a9a9a', cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 14, fontWeight: 600,
    }}>Se déconnecter</button>
  )
}
