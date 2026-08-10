import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Await params first to satisfy Next.js 15
  const slug = (await Promise.resolve(params)).slug
  return { title: `Manage ${slug} | Site Management` }
}

function extractPreviewText(content: any): string {
  if (!content || typeof content !== 'object') return 'No content configured.';
  
  const candidates = ['title', 'eyebrow', 'subtitle', 'description', 'heading', 'text'];
  for (const key of candidates) {
    if (content[key] && typeof content[key] === 'string') {
      const text = content[key].trim();
      if (text.length > 0) {
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
      }
    }
  }

  for (const key in content) {
    if (Array.isArray(content[key]) && content[key].length > 0) {
      return `${content[key].length} item${content[key].length === 1 ? '' : 's'} configured...`;
    }
  }

  return 'Data object configured.';
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
      <div style={{ marginBottom: '2.5rem' }}>
        <Link href="/control-panel/modules/site-management" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)', display: 'inline-block', marginBottom: '1rem', transition: 'color 0.2s' }}>
          &larr; Back to Page Overview
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lam-gold)' }} />
          <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--lam-white)', margin: 0 }}>
            {page.title}
          </h1>
        </div>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-lg)', marginLeft: '1.25rem' }}>
          Manage the structural sections and content rendered on this page.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {sections?.map((section) => {
          const isDraftUnpublished = JSON.stringify(section.draft_content) !== JSON.stringify(section.published_content)
          const isEmpty = !section.published_content || Object.keys(section.published_content).length === 0
          
          const contentToPreview = (section.draft_content && Object.keys(section.draft_content).length > 0) 
            ? section.draft_content 
            : section.published_content;
          
          const previewText = isEmpty && !isDraftUnpublished ? "Not yet configured." : extractPreviewText(contentToPreview);

          return (
            <div key={section.section_key} className="lam-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--lam-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>{section.name}</h3>
                
                {isDraftUnpublished ? (
                  <span style={{ fontSize: '11px', background: 'rgba(241,196,15,0.1)', color: '#f1c40f', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid rgba(241,196,15,0.2)' }}>Unpublished Draft</span>
                ) : isEmpty ? (
                  <span style={{ fontSize: '11px', background: 'rgba(149,165,166,0.1)', color: '#95a5a6', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid rgba(149,165,166,0.2)' }}>Not Set</span>
                ) : (
                  <span style={{ fontSize: '11px', background: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid rgba(46,204,113,0.2)' }}>Published</span>
                )}
              </div>
              
              <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.5, margin: 0, fontStyle: previewText === 'Not yet configured.' ? 'italic' : 'normal' }}>
                  "{previewText}"
                </p>
                {section.updated_at && (
                  <p style={{ fontSize: '12px', color: 'var(--lam-silver-dim)', marginTop: '0.75rem', opacity: 0.7 }}>
                    Last updated: {new Date(section.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <Link 
                  href={`/control-panel/modules/site-management/${slug}/sections/${section.section_key}/edit`} 
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', flex: 1, textAlign: 'center' }}
                >
                  Edit Content
                </Link>
                {!isEmpty && (
                  <Link 
                    href={slug === 'home' ? '/' : `/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', textAlign: 'center' }}
                  >
                    View Live
                  </Link>
                )}
              </div>
            </div>
          )
        })}
        {(!sections || sections.length === 0) && (
          <div className="lam-card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-lg)', margin: 0 }}>No editable sections defined for this page yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
