import PanierView from '@/components/store/PanierView'

export default async function PanierPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <PanierView locale={locale} />
}
