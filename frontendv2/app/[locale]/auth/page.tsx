import type { Metadata } from 'next'
import { AuthPage } from '@/components/auth/AuthPage'

export const metadata: Metadata = { title: 'Connexion — WalanoCast' }

export default async function Auth({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ mode?: string; next?: string }>
}) {
  const { locale } = await params
  const { mode, next } = await searchParams
  return <AuthPage locale={locale} mode={mode === 'register' ? 'register' : 'login'} next={next} />
}
