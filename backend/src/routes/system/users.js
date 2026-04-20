// System Admin — gestion des utilisateurs et rôles
// Accessible : system_admin uniquement

import { Router } from 'express'
import { requireAuth, requireSystem } from '../../middleware/auth.js'
import { supabase } from '../../config/supabase.js'

const router = Router()

// GET /api/system/users — liste tous les utilisateurs avec leur rôle
router.get('/', requireAuth, requireSystem, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Récupérer depuis auth.users via admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: parseInt(page),
      perPage: parseInt(limit),
    })

    if (error) throw error

    // Récupérer les rôles en parallèle
    const userIds = users.map(u => u.id)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds)

    const rolesMap = Object.fromEntries((roles || []).map(r => [r.user_id, r.role]))

    const enriched = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name,
      avatar_url: u.user_metadata?.avatar_url,
      role: rolesMap[u.id] || 'customer',
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
    }))

    res.json({ data: enriched })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/system/users/:id/role — changer le rôle d'un utilisateur
router.patch('/:id/role', requireAuth, requireSystem, async (req, res, next) => {
  try {
    const { role } = req.body
    const { id } = req.params

    const validRoles = ['customer', 'app_admin', 'finance_admin', 'system_admin']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Rôle invalide. Valeurs acceptées : ${validRoles.join(', ')}` })
    }

    const { data, error } = await supabase
      .from('user_roles')
      .upsert({ user_id: id, role, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      action: 'user_role_changed',
      actor_id: req.user.id,
      target_id: id,
      target_type: 'user',
      metadata: { new_role: role },
    })

    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
