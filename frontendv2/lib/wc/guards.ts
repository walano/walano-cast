import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

// Session + role guards shared by the API routes.

export async function requireUser(): Promise<
  | { user: User; supabase: SupabaseClient }
  | { user: null; supabase: null }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, supabase: null }
  return { user, supabase }
}

export async function requireAdmin(): Promise<
  | { user: User; supabase: SupabaseClient }
  | { user: null; supabase: null }
> {
  const got = await requireUser()
  if (!got.user) return { user: null, supabase: null }
  const { data } = await got.supabase.from('profiles').select('role').eq('id', got.user.id).single()
  if (data?.role !== 'admin') return { user: null, supabase: null }
  return got
}

export function clientMeta(req: NextRequest): { ip: string | null; ua: string | null } {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip'),
    ua: req.headers.get('user-agent'),
  }
}
