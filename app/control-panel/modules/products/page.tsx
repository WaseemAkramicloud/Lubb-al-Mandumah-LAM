import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Products | LΛM Control Panel",
  robots: { index: false, follow: false },
}

const lifecycleColors: Record<string, { bg: string; color: string }> = {
  'Concept': { bg: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' },
  'Planning': { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' },
  'Development': { bg: 'rgba(230, 126, 34, 0.1)', color: '#e67e22' },
  'Testing': { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' },
  'Beta': { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' },
  'Active': { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' },
  'Paused': { bg: 'rgba(149, 165, 166, 0.1)', color: '#95a5a6' },
  'Deprecated': { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' },
  'Archived': { bg: 'rgba(149, 165, 166, 0.1)', color: '#7f8c8d' },
}

export default async function ProductsListPage() {
  await requirePermission('products', 'view')
  
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('cms_products')
    .select('slug, name, category, status, updated_at, product_id, lifecycle_status, product_type')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
  }

  const thStyle = { padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' as const, fontWeight: 600 }

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
              <th style={thStyle}>Product ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Lifecycle</th>
              <th style={thStyle}>Website</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const lcStyle = lifecycleColors[p.lifecycle_status || 'Active'] || lifecycleColors['Active']
              
              return (
                <tr key={p.slug} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 700, 
                      color: 'var(--lam-gold)',
                      letterSpacing: '0.05em',
                      background: 'rgba(201, 168, 76, 0.1)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '3px'
                    }}>
                      {p.product_id || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{p.category}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {p.product_type || '—'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      background: lcStyle.bg,
                      color: lcStyle.color
                    }}>
                      {p.lifecycle_status || 'Active'}
                    </span>
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
              )
            })}
            
            {!products || products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
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
