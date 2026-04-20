import { redirect } from 'next/navigation'

export default async function ManagementHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/management/orders`)
}
