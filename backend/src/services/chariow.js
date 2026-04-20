// Service centralisé pour tous les appels à l'API Chariow
// La clé API ne sort jamais de ce fichier

import { config } from '../config/env.js'

async function chariowFetch(path, options = {}) {
  const url = `${config.chariow.baseUrl}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.chariow.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Chariow API error')
    error.status = response.status
    error.chariowErrors = data.errors
    throw error
  }

  return data
}

// --- Produits ---

export async function getProducts(params = {}) {
  const query = new URLSearchParams()
  if (params.perPage) query.set('per_page', params.perPage)
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.search) query.set('search', params.search)
  if (params.type) query.set('type', params.type)
  if (params.category) query.set('category', params.category)

  const qs = query.toString()
  return chariowFetch(`/products${qs ? `?${qs}` : ''}`)
}

export async function getProduct(productId) {
  return chariowFetch(`/products/${productId}`)
}

// --- Checkout ---

export async function initiateCheckout(payload) {
  return chariowFetch('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// --- Ventes ---

export async function getSales(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.customerId) query.set('customer_id', params.customerId)
  if (params.startDate) query.set('start_date', params.startDate)
  if (params.endDate) query.set('end_date', params.endDate)
  if (params.perPage) query.set('per_page', params.perPage)
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.search) query.set('search', params.search)

  const qs = query.toString()
  return chariowFetch(`/sales${qs ? `?${qs}` : ''}`)
}

export async function getSale(saleId) {
  return chariowFetch(`/sales/${saleId}`)
}

// --- Clients ---

export async function getCustomers(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.perPage) query.set('per_page', params.perPage)
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.startDate) query.set('start_date', params.startDate)
  if (params.endDate) query.set('end_date', params.endDate)

  const qs = query.toString()
  return chariowFetch(`/customers${qs ? `?${qs}` : ''}`)
}

export async function getCustomer(customerId) {
  return chariowFetch(`/customers/${customerId}`)
}

// --- Licences ---

export async function getLicenses(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.customerId) query.set('customer_id', params.customerId)
  if (params.productId) query.set('product_id', params.productId)
  if (params.perPage) query.set('per_page', params.perPage)
  if (params.cursor) query.set('cursor', params.cursor)

  const qs = query.toString()
  return chariowFetch(`/licenses${qs ? `?${qs}` : ''}`)
}

// --- Analytics (sales analytics pour finance admin) ---

export async function getSalesAnalytics(from, to) {
  const query = new URLSearchParams({ from, to })
  return chariowFetch(`/analytics/sales?${query}`)
}

export async function getStoreAnalytics(from, to) {
  const query = new URLSearchParams({ from, to })
  return chariowFetch(`/analytics/store?${query}`)
}
