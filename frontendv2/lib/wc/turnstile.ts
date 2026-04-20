// Cloudflare Turnstile verification (spec U4). No-op until
// TURNSTILE_SECRET_KEY is configured, so the flow works before CAPTCHA setup.

export async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
  })
  const data = await res.json().catch(() => null)
  return data?.success === true
}
