// Subscriptions du customer connecté
// Historique des ventes filtrées par email

import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getSales } from '../services/chariow.js'

const router = Router()

// GET /api/subscriptions — toutes les subscriptions du customer connecté
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, cursor, per_page } = req.query

    const data = await getSales({
      search: req.user.email,   // Chariow filtre par email via search
      status: status || 'completed',
      perPage: per_page || '20',
      cursor,
    })

    // Calculer new vs renewal pour chaque vente
    const sales = data.data || []
    const emailSeen = new Map()

    const enriched = sales.map(sale => {
      const key = `${sale.customer?.email}_${sale.product?.id}`
      const isRenewal = emailSeen.has(key)
      emailSeen.set(key, true)
      return { ...sale, is_renewal: isRenewal }
    })

    res.json({ ...data, data: enriched })
  } catch (err) {
    next(err)
  }
})

export default router
