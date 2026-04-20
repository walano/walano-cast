import 'dotenv/config'

const required = [
  'CHARIOW_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable d'environnement manquante : ${key}`)
  }
}

export const config = {
  chariow: {
    apiKey: process.env.CHARIOW_API_KEY,
    baseUrl: process.env.CHARIOW_BASE_URL || 'https://api.chariow.com/v1',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  webhookSecret: process.env.WEBHOOK_SECRET || '',
}
