// Route checkout — initier un paiement via Chariow
// Requiert authentification

import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { initiateCheckout } from '../services/chariow.js'

const router = Router()

// POST /api/checkout
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      product_id,
      first_name,
      last_name,
      phone,
      discount_code,
      redirect_url,
    } = req.body

    // L'email vient toujours du token vérifié, pas du body
    const email = req.user.email

    if (!product_id || !first_name || !last_name || !phone) {
      return res.status(400).json({
        error: 'Champs requis manquants : product_id, first_name, last_name, phone'
      })
    }

    const payload = {
      product_id,
      email,
      first_name,
      last_name,
      phone,
      ...(discount_code && { discount_code }),
      ...(redirect_url && { redirect_url }),
      custom_metadata: {
        walano_user_id: req.user.id,
      },
    }

    const data = await initiateCheckout(payload)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
