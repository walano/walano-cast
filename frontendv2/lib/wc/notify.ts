// Notifications (decision #4): in-app is derived from order status directly;
// this module handles the out-of-band channels.
//
// Notification policy (spec U7): emails NEVER contain subscription details —
// only "your subscription is ready" + a link to /abonnements.
//
// Email provider not wired yet (needs RESEND_API_KEY); until then we log so
// flows are observable in dev. WhatsApp admin ping: post-core TODO.

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function notifyAdminNewSubmission(orderRef: string): Promise<void> {
  // TODO(email): Resend → admin address; TODO(whatsapp): Cloud API ping
  console.log(`[notify] admin: new txn submission on ${orderRef}`)
}

export async function notifyUserOrderReady(email: string, orderRef: string): Promise<void> {
  // Policy: no details in the email, just readiness + link.
  const link = `${APP_URL}/abonnements`
  // TODO(email): Resend — subject "Votre abonnement est prêt", body = link only
  console.log(`[notify] user ${email}: order ${orderRef} ready → ${link}`)
}

export async function notifyUserOrderRejected(email: string, orderRef: string): Promise<void> {
  const link = `${APP_URL}/abonnements`
  // TODO(email): Resend — "Un problème avec votre paiement" + link (no reason in email)
  console.log(`[notify] user ${email}: order ${orderRef} rejected → ${link}`)
}
