// Gestionnaire d'erreurs global Express

export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Erreurs Chariow
  if (err.chariowErrors) {
    return res.status(err.status || 422).json({
      error: err.message,
      details: err.chariowErrors,
    })
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  // Erreur générique
  const status = err.status || 500
  const message = status === 500
    ? 'Erreur interne du serveur'
    : err.message

  res.status(status).json({ error: message })
}
