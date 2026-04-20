// Validation of a category's checkout_fields against user-submitted values.
// Field definitions live in categories.checkout_fields (spec §2, axis 1).

export type CheckoutField = {
  key: string
  label: string
  type: 'text' | 'email' | 'pin' | 'phone'
  required?: boolean
  max?: number
  digits?: number
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9 ]{6,20}$/

export function validateCheckoutData(
  fields: CheckoutField[],
  data: Record<string, unknown>,
): { ok: true; clean: Record<string, string> } | { ok: false; error: string } {
  const clean: Record<string, string> = {}

  for (const f of fields) {
    const raw = data?.[f.key]
    const value = typeof raw === 'string' ? raw.trim() : ''

    if (!value) {
      if (f.required) return { ok: false, error: `Champ requis : ${f.label}` }
      continue
    }

    switch (f.type) {
      case 'email':
        if (!EMAIL_RE.test(value)) return { ok: false, error: `Adresse e-mail invalide : ${f.label}` }
        break
      case 'pin': {
        const digits = f.digits ?? 4
        if (!new RegExp(`^[0-9]{${digits}}$`).test(value))
          return { ok: false, error: `${f.label} : ${digits} chiffres attendus` }
        break
      }
      case 'phone':
        if (!PHONE_RE.test(value)) return { ok: false, error: `Numéro invalide : ${f.label}` }
        break
      case 'text':
        if (value.length > (f.max ?? 100))
          return { ok: false, error: `${f.label} : ${f.max ?? 100} caractères maximum` }
        break
    }
    clean[f.key] = value
  }

  // reject unknown keys silently by only keeping declared ones
  return { ok: true, clean }
}
