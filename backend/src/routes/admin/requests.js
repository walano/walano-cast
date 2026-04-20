// Admin — gestion des demandes de subscriptions manuelles
// Accessible : app_admin, system_admin

import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth.js'
import { supabase } from '../../config/supabase.js'

const router = Router()

// GET /api/admin/requests — toutes les demandes
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabase
      .from('manual_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) throw error

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: offset + data.length < count,
      },
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/requests/:id — mettre à jour le statut d'une demande
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, admin_notes, chariow_sale_id } = req.body
    const { id } = req.params

    const updates = {
      updated_at: new Date().toISOString(),
      admin_user_id: req.user.id,
    }

    if (status) updates.status = status
    if (admin_notes !== undefined) updates.admin_notes = admin_notes
    if (chariow_sale_id) updates.chariow_sale_id = chariow_sale_id
    if (status === 'fulfilled') updates.fulfilled_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('manual_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      action: status === 'fulfilled' ? 'subscription_fulfilled' : 'request_status_changed',
      actor_id: req.user.id,
      target_id: id,
      target_type: 'manual_request',
      metadata: { old_status: req.body.previous_status, new_status: status, admin_notes },
    })

    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
