// Admin — gestion du catalogue via Chariow
// Accessible : app_admin, system_admin

import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth.js'
import { getProducts, getProduct } from '../../services/chariow.js'

const router = Router()

// GET /api/admin/catalog — liste tous les produits (y compris brouillons via dashboard Chariow)
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { cursor, per_page, search, type } = req.query
    const data = await getProducts({ cursor, perPage: per_page, search, type })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/catalog/:id
router.get('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = await getProduct(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
