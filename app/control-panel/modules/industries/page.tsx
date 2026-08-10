import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Industries | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function IndustriesListPage() {
  await requirePermission('site_management', 'view')
  
  const supabase = await createClient()
  const { data: industries, error } = await supabase
    .from('cms_collections')
    .select('slug, title, status, updated_at')
    .eq('type', 'industry')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Error fetching industries:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Industries
        </h1>
        <Link href="/control-panel/modules/industries/create" className="btn btn-primary">
          + Create Industry
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Title</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {industries?.map((s) => (
              <tr key={s.slug} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {s.title}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
                  {s.slug}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: s.status === 'published' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                    color: s.status === 'published' ? '#2ecc71' : '#f1c40f'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/control-panel/modules/industries/${s.slug}/edit`} style={{
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
                  <Link href={`/industries/${s.slug}`} target="_blank" style={{
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
            
            {!industries || industries.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No industries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
