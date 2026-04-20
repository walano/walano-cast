// Middleware d'authentification et d'autorisation
// Vérifie le token Supabase et le rôle de l'utilisateur

import { supabase } from '../config/supabase.js'

// Extraire et vérifier le JWT Supabase depuis le header Authorization
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }

  // Récupérer le rôle depuis Supabase
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  req.user = user
  req.userRole = roleData?.role || 'customer'

  next()
}

// Middleware de vérification de rôle — à utiliser après requireAuth
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Accès refusé',
        required: roles,
        current: req.userRole,
      })
    }
    next()
  }
}

// Raccourcis
export const requireAdmin = requireRole('app_admin', 'system_admin')
export const requireFinance = requireRole('finance_admin', 'system_admin')
export const requireSystem = requireRole('system_admin')
