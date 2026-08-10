import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { deleteCareer } from '@/lib/actions/careers'

export const metadata = {
  title: "Careers | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CareersListPage() {
  await requirePermission('careers', 'view')
  
  const supabase = await createClient()
  const { data: careers, error } = await supabase
    .from('cms_collections')
    .select('slug, title, status, updated_at, data')
    .eq('type', 'career')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Error fetching careers:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Career Vacancies
        </h1>
        <Link href="/control-panel/modules/careers/create" className="btn btn-primary">
          + Create Vacancy
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Role Title</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Department</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {careers?.map((c) => (
              <tr key={c.slug} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {c.title}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {c.data?.department}
                </td>
                <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                  {c.data?.location}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: c.status === 'published' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                    color: c.status === 'published' ? '#2ecc71' : '#f1c40f'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/control-panel/modules/careers/${c.slug}/edit`} style={{
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
                  <form action={async () => {
                    "use server"
                    await deleteCareer(c.slug)
                  }}>
                    <button type="submit" style={{
                      background: 'none',
                      border: '1px solid var(--lam-border)',
                      color: 'var(--lam-silver)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      transition: 'all 0.2s'
                    }}>
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            
            {!careers || careers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No careers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
