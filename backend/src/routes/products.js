// Routes catalogue — proxy vers Chariow API
// Accessibles sans authentification (catalogue public)

import { Router } from 'express'
import { getProducts, getProduct } from '../services/chariow.js'

const router = Router()

// GET /api/products — liste tous les produits publiés
router.get('/', async (req, res, next) => {
  try {
    const { per_page, cursor, search, type, category } = req.query
    const data = await getProducts({ perPage: per_page, cursor, search, type, category })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id — détail d'un produit
router.get('/:id', async (req, res, next) => {
  try {
    const data = await getProduct(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
