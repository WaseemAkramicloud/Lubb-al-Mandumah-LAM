import { requirePermission } from '@/lib/auth/permissions'
import { ProductForm } from '../ProductForm'
import Link from 'next/link'

export const metadata = {
  title: "Create Product | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CreateProductPage() {
  await requirePermission('products', 'create')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/products" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Products
        </Link>
      </div>
      <ProductForm isNew={true} />
    </div>
  )
}
