import type { Currency } from '@/types/database'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XAF: 'FCFA',
  GHS: 'GH₵',
  USD: '$',
}

export function formatAmount(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  if (currency === 'USD') {
    return `${symbol}${amount.toFixed(2)}`
  }
  return `${amount.toLocaleString('fr-FR')} ${symbol}`
}

export function applyDiscount(amount: number, discountPct: number): number {
  return amount * (1 - discountPct / 100)
}

// ─── Currency conversion + locale formatting ───────────────────────────────
// Consolidated here from the removed lib/finance.ts (old commerce model).
// Still used by the analytics UI components.

export type PurchaseCurrency = 'USD' | 'GHS' | 'XAF'

export interface ExchangeRates {
  USD_XAF: number
  GHS_XAF: number
  updated: string | null
  fallback?: boolean
}

export function toXAF(
  amount: number,
  currency: PurchaseCurrency,
  rates: ExchangeRates,
): number {
  switch (currency) {
    case 'XAF': return amount
    case 'USD': return amount * rates.USD_XAF
    case 'GHS': return amount * rates.GHS_XAF
  }
}

export function fmtXAF(n: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function fmtCurrency(n: number, currency: PurchaseCurrency): string {
  const locales: Record<PurchaseCurrency, string> = {
    XAF: 'fr-CM',
    USD: 'en-US',
    GHS: 'en-GH',
  }
  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
