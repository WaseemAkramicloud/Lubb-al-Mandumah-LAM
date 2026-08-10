import { requirePermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '../../ProductForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Edit Product | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditProductPage({ params }: Props) {
  await requirePermission('products', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('cms_products')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/products" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Products
        </Link>
      </div>
      <ProductForm initialData={product} isNew={false} />
    </div>
  )
}
