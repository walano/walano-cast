import { createClient } from '@supabase/supabase-js'
import { config } from './env.js'

// Client avec service role — accès total, uniquement côté backend
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
