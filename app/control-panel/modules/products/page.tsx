import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Products | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function ProductsListPage() {
  await requirePermission('products', 'view')
  
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('cms_products')
    .select('slug, name, category, status, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Products & Platforms
        </h1>
        <Link href="/control-panel/modules/products/create" className="btn btn-primary">
          + Create Product
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.slug} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {p.name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {p.category}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
                  {p.slug}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: p.status === 'published' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                    color: p.status === 'published' ? '#2ecc71' : '#f1c40f'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/control-panel/modules/products/${p.slug}/edit`} style={{
                    display: 'inline-block',
                    background: 'none',
                    border: '1px solid var(--lam-border)',
                    color: 'var(--lam-silver)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: 'var(--text-xs)',
                    transition: 'all 0.2s'
                  }}>
                    Edit
                  </Link>
                  <Link href={`/products/${p.slug}`} target="_blank" style={{
                    display: 'inline-block',
                    background: 'none',
                    border: '1px solid transparent',
                    color: 'var(--lam-silver-dim)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: 'var(--text-xs)'
                  }}>
                    Preview ↗
                  </Link>
                </td>
              </tr>
            ))}
            
            {!products || products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
