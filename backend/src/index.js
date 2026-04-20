import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import productsRouter from './routes/products.js'
import checkoutRouter from './routes/checkout.js'
import subscriptionsRouter from './routes/subscriptions.js'
import requestsRouter from './routes/requests.js'
import adminCatalogRouter from './routes/admin/catalog.js'
import adminRequestsRouter from './routes/admin/requests.js'
import financeDashboardRouter from './routes/finance/dashboard.js'
import systemUsersRouter from './routes/system/users.js'
import systemLogsRouter from './routes/system/logs.js'
import chariowWebhookRouter from './routes/webhooks/chariow.js'

const app = express()

// --- Sécurité ---
app.use(helmet())
app.use(cors({
  origin: config.app.frontendUrl,
  credentials: true,
}))

// Rate limiting global
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,
  message: { error: 'Trop de requêtes, réessayez dans un moment.' },
}))

// --- Parsing ---
// Le webhook Chariow doit recevoir le raw body AVANT express.json()
app.use('/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  if (req.body instanceof Buffer) {
    req.body = JSON.parse(req.body.toString())
  }
  next()
})

app.use(express.json())
app.use(morgan(config.app.nodeEnv === 'production' ? 'combined' : 'dev'))

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- Routes publiques ---
app.use('/api/products', productsRouter)

// --- Routes authentifiées (customer) ---
app.use('/api/checkout', checkoutRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/requests', requestsRouter)

// --- Routes admin ---
app.use('/api/admin/catalog', adminCatalogRouter)
app.use('/api/admin/requests', adminRequestsRouter)

// --- Routes finance ---
app.use('/api/finance', financeDashboardRouter)

// --- Routes system ---
app.use('/api/system/users', systemUsersRouter)
app.use('/api/system/logs', systemLogsRouter)

// --- Webhooks ---
app.use('/webhooks/chariow', chariowWebhookRouter)

// --- Erreurs ---
app.use(errorHandler)

// --- Démarrage ---
app.listen(config.app.port, () => {
  console.log(`[SERVER] Walano Cast backend démarré sur le port ${config.app.port}`)
  console.log(`[SERVER] Environnement : ${config.app.nodeEnv}`)
  console.log(`[SERVER] Frontend autorisé : ${config.app.frontendUrl}`)
})

export default app
