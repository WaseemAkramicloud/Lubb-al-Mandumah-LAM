import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Await params first to satisfy Next.js 15
  const slug = (await Promise.resolve(params)).slug
  return { title: `Manage ${slug} | Site Management` }
}

export default async function PageSectionsPage({ params }: { params: { slug: string } }) {
  await requirePermission('site_management', 'view')

  // Await params first to satisfy Next.js 15
  const slug = (await Promise.resolve(params)).slug
  const supabase = await createClient()

  // Fetch page info
  const { data: page } = await supabase
    .from('cms_pages')
    .select('title')
    .eq('slug', slug)
    .single()

  if (!page) {
    redirect('/control-panel/modules/site-management')
  }

  // Fetch sections
  const { data: sections } = await supabase
    .from('cms_sections')
    .select('*')
    .eq('page_slug', slug)
    .order('order_index')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/site-management" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          &larr; Back to Pages
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginTop: '1rem', marginBottom: '0.5rem' }}>
          {page.title} Sections
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)' }}>
          Select a section to edit its content.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {sections?.map((section) => {
          // Check draft status by comparing JSON strings
          const isDraftUnpublished = JSON.stringify(section.draft_content) !== JSON.stringify(section.published_content)
          const isEmpty = !section.published_content || Object.keys(section.published_content).length === 0

          return (
            <div key={section.section_key} className="lam-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)' }}>{section.name}</h3>
                
                {isDraftUnpublished ? (
                  <span style={{ fontSize: '11px', background: 'rgba(241,196,15,0.2)', color: '#f1c40f', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Unpublished Draft</span>
                ) : isEmpty ? (
                  <span style={{ fontSize: '11px', background: 'rgba(149,165,166,0.2)', color: '#95a5a6', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Not Set</span>
                ) : (
                  <span style={{ fontSize: '11px', background: 'rgba(46,204,113,0.2)', color: '#2ecc71', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Published</span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <Link 
                  href={`/control-panel/modules/site-management/${slug}/sections/${section.section_key}/edit`} 
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-sm)', flex: 1, textAlign: 'center' }}
                >
                  Edit Content
                </Link>
              </div>
            </div>
          )
        })}
        {(!sections || sections.length === 0) && (
          <p style={{ color: 'var(--lam-silver-dim)' }}>No editable sections defined for this page yet.</p>
        )}
      </div>
    </div>
  )
}
