import { redirect } from 'next/navigation'

export default async function OrdersHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/management/orders/validation`)
}
