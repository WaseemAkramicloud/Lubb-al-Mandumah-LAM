import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Insights | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function InsightsListPage() {
  await requirePermission('insights', 'view')
  
  const supabase = await createClient()
  const { data: insights, error } = await supabase
    .from('cms_insights')
    .select('slug, title, category, date, author, status, updated_at')
    .order('date', { ascending: false })

  if (error) {
    console.error("Error fetching insights:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Insights & Articles
        </h1>
        <Link href="/control-panel/modules/insights/create" className="btn btn-primary">
          + Create Article
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Title</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Author</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {insights?.map((i) => (
              <tr key={i.slug} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {i.title}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {i.category}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {i.author}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {i.date}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: i.status === 'published' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                    color: i.status === 'published' ? '#2ecc71' : '#f1c40f'
                  }}>
                    {i.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/control-panel/modules/insights/${i.slug}/edit`} style={{
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
                  <Link href={`/insights/${i.slug}`} target="_blank" style={{
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
            
            {!insights || insights.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No insights found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
