// Webhook — reçoit les Pulses Chariow
// Pas d'authentification JWT ici, mais vérification de l'event

import { Router } from 'express'
import { supabase } from '../../config/supabase.js'

const router = Router()

// POST /webhooks/chariow
// Chariow envoie les événements : successful.sale, abandoned.sale, failed.sale, license.activated, etc.
router.post('/', async (req, res) => {
  // Répondre immédiatement pour éviter le timeout Chariow (30s max)
  res.status(200).json({ received: true })

  // Traitement asynchrone
  processWebhook(req.body).catch(err => {
    console.error('[WEBHOOK] Erreur traitement:', err)
  })
})

async function processWebhook(payload) {
  const { event, sale, customer, product, license } = payload

  console.log(`[WEBHOOK] Événement reçu : ${event}`)

  switch (event) {
    case 'successful.sale':
      await handleSuccessfulSale({ sale, customer, product })
      break

    case 'abandoned.sale':
      console.log(`[WEBHOOK] Vente abandonnée : ${sale?.id}`)
      break

    case 'failed.sale':
      console.log(`[WEBHOOK] Vente échouée : ${sale?.id}`)
      break

    case 'license.activated':
      console.log(`[WEBHOOK] Licence activée : ${license?.key}`)
      break

    case 'license.revoked':
      console.log(`[WEBHOOK] Licence révoquée : ${license?.key}`)
      break

    default:
      console.log(`[WEBHOOK] Événement non géré : ${event}`)
  }
}

async function handleSuccessfulSale({ sale, customer, product }) {
  try {
    // Log d'audit de la vente
    await supabase.from('audit_logs').insert({
      action: 'subscription_fulfilled',
      target_id: sale?.id,
      target_type: 'sale',
      metadata: {
        customer_email: customer?.email,
        product_id: product?.id,
        product_name: product?.name,
        amount: sale?.amount?.value,
        currency: sale?.amount?.currency,
      },
    })

    // Si une manual_request correspond, la marquer comme fulfilled
    if (customer?.email && product?.id) {
      await supabase
        .from('manual_requests')
        .update({
          status: 'fulfilled',
          chariow_sale_id: sale?.id,
          fulfilled_at: new Date().toISOString(),
        })
        .eq('customer_email', customer.email)
        .eq('product_id', product.id)
        .eq('status', 'in_progress')
    }

    console.log(`[WEBHOOK] Vente traitée : ${sale?.id} pour ${customer?.email}`)
  } catch (err) {
    console.error('[WEBHOOK] Erreur handleSuccessfulSale:', err)
  }
}

export default router
