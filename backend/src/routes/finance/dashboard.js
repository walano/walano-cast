// Finance Admin — dashboard revenus et comparaisons
// Accessible : finance_admin, system_admin

import { Router } from 'express'
import { requireAuth, requireFinance } from '../../middleware/auth.js'
import { getSales } from '../../services/chariow.js'

const router = Router()

// Utilitaire : paginer toutes les ventes sur une période
async function fetchAllSales(startDate, endDate) {
  let allSales = []
  let cursor = null

  do {
    const result = await getSales({
      status: 'completed',
      startDate,
      endDate,
      perPage: '100',
      cursor,
    })
    allSales = allSales.concat(result.data || [])
    cursor = result.pagination?.next_cursor || null
  } while (cursor)

  return allSales
}

// Utilitaire : calculer les métriques d'une liste de ventes
function computeMetrics(sales, previousPeriodEmails = new Map()) {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount?.value || 0), 0)
  const salesByType = {}
  let newSubscriptions = 0
  let renewals = 0

  const seenInPeriod = new Map()

  for (const sale of sales) {
    // Par type de produit
    const type = sale.product?.type || 'unknown'
    if (!salesByType[type]) salesByType[type] = { count: 0, revenue: 0 }
    salesByType[type].count++
    salesByType[type].revenue += sale.amount?.value || 0

    // New vs Renewal
    // Renewal = le même email avait déjà acheté ce produit dans une période précédente
    const key = `${sale.customer?.email}_${sale.product?.id}`
    if (previousPeriodEmails.has(key) || seenInPeriod.has(key)) {
      renewals++
    } else {
      newSubscriptions++
    }
    seenInPeriod.set(key, true)
  }

  return {
    totalRevenue,
    totalSales: sales.length,
    salesByType,
    newSubscriptions,
    renewals,
  }
}

// GET /api/finance/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/dashboard', requireAuth, requireFinance, async (req, res, next) => {
  try {
    const { from, to } = req.query

    if (!from || !to) {
      return res.status(400).json({ error: 'Paramètres from et to requis (YYYY-MM-DD)' })
    }

    // Calculer la période précédente de même durée
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const durationMs = toDate - fromDate
    const prevTo = new Date(fromDate - 1)
    const prevFrom = new Date(prevTo - durationMs)

    const prevFromStr = prevFrom.toISOString().split('T')[0]
    const prevToStr = prevTo.toISOString().split('T')[0]

    // Fetch les deux périodes en parallèle
    const [currentSales, previousSales] = await Promise.all([
      fetchAllSales(from, to),
      fetchAllSales(prevFromStr, prevToStr),
    ])

    // Construire la map de la période précédente pour détecter les renewals
    const previousMap = new Map()
    for (const sale of previousSales) {
      const key = `${sale.customer?.email}_${sale.product?.id}`
      previousMap.set(key, true)
    }

    const current = computeMetrics(currentSales, previousMap)
    const previous = computeMetrics(previousSales)

    // Calcul des variations (%)
    const revenueChange = previous.totalRevenue === 0
      ? null
      : ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100

    const salesChange = previous.totalSales === 0
      ? null
      : ((current.totalSales - previous.totalSales) / previous.totalSales) * 100

    res.json({
      period: { from, to },
      previousPeriod: { from: prevFromStr, to: prevToStr },
      current,
      previous,
      changes: {
        revenue: revenueChange !== null ? Math.round(revenueChange * 10) / 10 : null,
        sales: salesChange !== null ? Math.round(salesChange * 10) / 10 : null,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
