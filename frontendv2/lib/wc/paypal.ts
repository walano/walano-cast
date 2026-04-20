// PayPal REST helpers (server-only). PayPal does not support XAF, so amounts
// are charged in EUR using the fixed CFA peg (655.957 XAF = 1 EUR).

const XAF_PER_EUR = 655.957

export function xafToEur(xaf: number): string {
  return (Math.round((xaf / XAF_PER_EUR) * 100) / 100).toFixed(2)
}

function baseUrl(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function paypalConfigured(): boolean {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64')
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const j = await res.json()
  return j.access_token
}

export async function createPayPalOrder(amountEur: string, referenceId: string, description: string): Promise<string> {
  const token = await getAccessToken()
  const res = await fetch(`${baseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: referenceId,
        description,
        amount: { currency_code: 'EUR', value: amountEur },
      }],
    }),
  })
  const j = await res.json()
  if (!res.ok || !j.id) throw new Error(`PayPal create failed: ${JSON.stringify(j)}`)
  return j.id
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  completed: boolean
  referenceId: string | null
  captureId: string | null
}> {
  const token = await getAccessToken()
  const res = await fetch(`${baseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const j = await res.json()
  const unit = j?.purchase_units?.[0]
  const capture = unit?.payments?.captures?.[0]
  return {
    completed: j?.status === 'COMPLETED' && capture?.status === 'COMPLETED',
    referenceId: unit?.reference_id ?? null,
    captureId: capture?.id ?? null,
  }
}
