// System Admin — audit logs
// Accessible : system_admin uniquement

import { Router } from 'express'
import { requireAuth, requireSystem } from '../../middleware/auth.js'
import { supabase } from '../../config/supabase.js'

const router = Router()

// GET /api/system/logs
router.get('/', requireAuth, requireSystem, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (action) query = query.eq('action', action)

    const { data, error, count } = await query
    if (error) throw error

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
