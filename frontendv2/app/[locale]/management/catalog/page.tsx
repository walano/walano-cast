import { redirect } from 'next/navigation'

export default async function CatalogHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/management/catalog/categories`)
}
