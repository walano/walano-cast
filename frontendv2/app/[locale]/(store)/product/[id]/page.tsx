import { notFound } from 'next/navigation'
import { fetchCatalog, servicesToCardProducts, serviceToCardProduct } from '@/lib/catalog'
import { ProductPage, type PlanOption } from '@/components/product/ProductPage'

// One service = one product page. Plans come from the Supabase catalog,
// sorted by duration; cheapest per-month flagged as best value. A service
// with zero stock (auto-inventory categories) shows all plans sold out.

export default async function ProductRoute({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params

  const { services } = await fetchCatalog()
  const service = services.find((s) => s.id === id || s.slug === id)
  if (!service || service.plans.length === 0) notFound()

  const soldOut = service.available <= 0
  const monthly = service.plans.map((p) => Number(p.price_amount) / Math.max(1, p.duration_days / 30))
  const bestIdx = service.plans.length > 1 ? monthly.indexOf(Math.min(...monthly)) : -1

  const plans: PlanOption[] = service.plans.map((p, i) => {
    const months = Math.max(1, Math.round(p.duration_days / 30))
    return {
      id: p.id,
      label: p.label,
      price: Number(p.price_amount),
      perMonth: Math.round(Number(p.price_amount) / months),
      bestValue: i === bestIdx,
      soldOut,
    }
  })

  const card = serviceToCardProduct(service, 0)

  // Related: same category first, then the rest.
  const others = services.filter((s) => s.id !== service.id)
  const sameCat = others.filter((s) => s.category?.slug === service.category?.slug)
  const rest = others.filter((s) => s.category?.slug !== service.category?.slug)
  const related = servicesToCardProducts([...sameCat, ...rest]).slice(0, 5)

  return <ProductPage product={card} plans={plans} related={related} locale={locale} />
}
