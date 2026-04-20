// Customer — créer et consulter ses propres demandes manuelles

import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// GET /api/requests — demandes du customer connecté
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('manual_requests')
      .select('*')
      .eq('customer_user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

// POST /api/requests — créer une demande manuelle
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id, product_name, quantity, customer_name, customer_whatsapp } = req.body

    if (!product_id || !product_name) {
      return res.status(400).json({ error: 'product_id et product_name requis' })
    }

    const { data, error } = await supabase
      .from('manual_requests')
      .insert({
        customer_user_id: req.user.id,
        customer_email: req.user.email,
        customer_name,
        customer_whatsapp,
        product_id,
        product_name,
        quantity: quantity || 1,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      action: 'request_created',
      actor_id: req.user.id,
      target_id: data.id,
      target_type: 'manual_request',
      metadata: { product_id, product_name },
    })

    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
})

export default router
