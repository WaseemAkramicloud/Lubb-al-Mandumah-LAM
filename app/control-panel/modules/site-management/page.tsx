import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Site Management | LΛM Control Panel",
}

export default async function SiteManagementPage() {
  await requirePermission('site_management', 'view')

  const supabase = await createClient()
  
  // Fetch available pages
  const { data: pages } = await supabase
    .from('cms_pages')
    .select('*')
    .order('title')

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
        Site Management
      </h1>
      <p style={{ color: 'var(--lam-silver-dim)', marginBottom: '2rem' }}>
        Select a page to edit its content sections.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {pages?.map((page) => (
          <Link 
            href={`/control-panel/modules/site-management/${page.slug}`} 
            key={page.slug}
            className="lam-card"
            style={{ textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>
              {page.title}
            </h2>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
              Path: /{page.slug === 'home' ? '' : page.slug}
            </p>
            <div style={{ marginTop: '1rem', color: 'var(--lam-silver)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Manage Sections &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
