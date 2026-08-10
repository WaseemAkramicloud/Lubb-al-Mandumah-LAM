import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Site Management | LΛM Control Panel",
}

const PUBLIC_PAGES = [
  { slug: 'home', title: 'Home Page', description: 'Main landing page and ecosystem overview.' },
  { slug: 'products', title: 'Products', description: 'Enterprise software registry and platform suite.' },
  { slug: 'solutions', title: 'Solutions', description: 'Tailored approaches across disciplines.' },
  { slug: 'industries', title: 'Industries', description: 'Sectors and specialized markets we serve.' },
  { slug: 'partners', title: 'Partners & Clients', description: 'Strategic alliances and integration networks.' },
  { slug: 'about', title: 'About Us', description: 'Company philosophy, ecosystem, and identity.' },
  { slug: 'careers', title: 'Careers', description: 'Open positions and architectural collaborations.' },
  { slug: 'insights', title: 'Insights', description: 'Research, technical perspectives, and strategy.' },
  { slug: 'contact', title: 'Contact', description: 'Global office locations and secure communications.' },
  { slug: 'request-demo', title: 'Request Demo', description: 'Enterprise engagement and platform walkthroughs.' },
];

export default async function SiteManagementPage() {
  await requirePermission('site_management', 'view')

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
        Site Management
      </h1>
      <p style={{ color: 'var(--lam-silver-dim)', marginBottom: '2.5rem', fontSize: 'var(--text-lg)' }}>
        Manage the content, layout, and copy of the public-facing LΛM website.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {PUBLIC_PAGES.map((page) => (
          <Link 
            href={`/control-panel/modules/site-management/${page.slug}`} 
            key={page.slug}
            className="lam-card lam-card--gold"
            style={{ textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lam-gold)' }} />
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', margin: 0 }}>
                {page.title}
              </h2>
            </div>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1, lineHeight: 1.5 }}>
              {page.description}
            </p>
            <div style={{ marginTop: '1.5rem', color: 'var(--lam-gold)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <span>Edit Sections &rarr;</span>
            </div>
          </Link>
        ))}

        {/* Global Website Content (Placeholder for future) */}
        <Link 
          href="/control-panel/modules/system-settings" 
          className="lam-card"
          style={{ textDecoration: 'none', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem', borderStyle: 'dashed', borderColor: 'var(--lam-border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lam-silver-dim)' }} />
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', margin: 0 }}>
              Global Content
            </h2>
          </div>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1, lineHeight: 1.5 }}>
            Header navigation, footer links, company identity, and default SEO settings.
          </p>
          <div style={{ marginTop: '1.5rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Manage via Settings &rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
