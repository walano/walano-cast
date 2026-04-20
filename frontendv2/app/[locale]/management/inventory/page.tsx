import { redirect } from 'next/navigation'

export default async function InventoryHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/management/inventory/items`)
}
