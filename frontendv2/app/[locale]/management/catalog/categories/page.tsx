// A1 — categories.

import { getAdminSession } from '@/lib/management'
import CategoriesManager from '@/components/admin/CategoriesManager'

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { supabase } = await getAdminSession(locale)
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Catégories</h1>
      <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 24 }}>
        Chaque catégorie définit ce que le client fournit au checkout et comment la livraison se fait.
      </p>
      <CategoriesManager categories={categories ?? []} />
    </div>
  )
}
