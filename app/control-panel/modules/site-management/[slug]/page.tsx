import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = (await Promise.resolve(params)).slug
  return { title: `Manage ${slug} | Site Management` }
}

/* ── helpers ─────────────────────────────────────────────── */

/** Readable label from a camelCase / snake_case key */
function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Truncate long strings */
function truncate(s: string, max = 120) {
  return s.length > max ? s.substring(0, max) + '…' : s
}

/** Render a single value as a human-readable string */
function renderValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'string') return truncate(val)
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  if (Array.isArray(val)) {
    if (val.length === 0) return '— (empty list)'
    // Array of objects → count items
    if (typeof val[0] === 'object') return `${val.length} item${val.length === 1 ? '' : 's'}`
    // Array of strings → join
    return truncate(val.join(', '))
  }
  if (typeof val === 'object') return JSON.stringify(val).substring(0, 100) + '…'
  return String(val)
}

/* ── page ────────────────────────────────────────────────── */

export default async function PageSectionsPage({ params }: { params: { slug: string } }) {
  await requirePermission('site_management', 'view')

  const slug = (await Promise.resolve(params)).slug
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('cms_pages')
    .select('title')
    .eq('slug', slug)
    .single()

  if (!page) redirect('/control-panel/modules/site-management')

  const { data: sections } = await supabase
    .from('cms_sections')
    .select('*')
    .eq('page_slug', slug)
    .order('order_index')

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Link
          href="/control-panel/modules/site-management"
          style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)', display: 'inline-block', marginBottom: '1rem' }}
        >
          &larr; Back to Page Overview
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lam-gold)' }} />
          <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--lam-white)', margin: 0 }}>
            {page.title}
          </h1>
        </div>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-lg)', marginLeft: '1.25rem' }}>
          Below are all editable sections on this page. Each card shows the <strong style={{ color: 'var(--lam-silver-light)' }}>current live content</strong> so you know exactly what visitors see.
        </p>
      </div>

      {/* ── Section cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections?.map((section) => {
          const published = section.published_content as Record<string, unknown> | null
          const draft = section.draft_content as Record<string, unknown> | null
          const isDraftDifferent =
            draft &&
            Object.keys(draft).length > 0 &&
            JSON.stringify(draft) !== JSON.stringify(published)
          const isEmpty = !published || Object.keys(published).length === 0

          // Use published content for display (this is what the visitor sees)
          const displayContent = published && Object.keys(published).length > 0 ? published : null

          // Detect "Info Panel" sections — these point to other modules
          const isInfoPanel = section.name.includes('Info Panel')
          const infoText = (displayContent?.info_text as string) || (draft as any)?.info_text || ''

          // Detect which module the Info Panel links to
          const moduleLinks: Record<string, { label: string; href: string }> = {
            'products_info': { label: 'Go to Products Module →', href: '/control-panel/modules/products' },
            'solutions_info': { label: 'Go to Solutions Module →', href: '/control-panel/modules/solutions' },
            'industries_info': { label: 'Go to Industries Module →', href: '/control-panel/modules/industries' },
            'insights_info': { label: 'Go to Insights Module →', href: '/control-panel/modules/insights' },
            'careers_positions': { label: 'Go to Careers Module →', href: '/control-panel/modules/careers' },
            'contact_form': { label: 'Go to Leads & Clients →', href: '/control-panel/modules/leads-clients' },
            'demo_form': { label: 'Go to Leads & Clients →', href: '/control-panel/modules/leads-clients' },
          }
          const moduleLink = moduleLinks[section.section_key]

          // ── Info Panel card (managed elsewhere) ──
          if (isInfoPanel || moduleLink) {
            return (
              <div
                key={section.section_key}
                className="lam-card"
                style={{ padding: 0, overflow: 'hidden', background: 'var(--lam-surface)', borderStyle: 'dashed', borderColor: 'var(--lam-border)' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px dashed var(--lam-border)',
                    background: 'rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '18px' }}>🔗</span>
                    <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-silver-light)', margin: 0 }}>
                      {section.name.replace(' (Info Panel)', '')}
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(52,152,219,0.1)',
                        color: '#3498db',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        border: '1px solid rgba(52,152,219,0.2)',
                      }}
                    >
                      Managed Elsewhere
                    </span>
                  </div>
                  {moduleLink && (
                    <Link
                      href={moduleLink.href}
                      className="btn"
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: 'var(--text-sm)',
                        background: 'rgba(52,152,219,0.1)',
                        border: '1px solid rgba(52,152,219,0.3)',
                        color: '#3498db',
                      }}
                    >
                      {moduleLink.label}
                    </Link>
                  )}
                </div>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>
                    {infoText || 'This content is managed via a separate module in the sidebar.'}
                  </p>
                </div>
              </div>
            )
          }

          // ── Normal editable section card ──
          return (
            <div
              key={section.section_key}
              className="lam-card"
              style={{ padding: 0, overflow: 'hidden', background: 'var(--lam-surface)' }}
            >
              {/* ── Card header ── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--lam-border)',
                  background: 'rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>
                    {section.name}
                  </h3>
                  {isDraftDifferent && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(241,196,15,0.12)',
                        color: '#f1c40f',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        border: '1px solid rgba(241,196,15,0.25)',
                      }}
                    >
                      Unsaved Draft
                    </span>
                  )}
                  {isEmpty && !isDraftDifferent && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(149,165,166,0.1)',
                        color: '#95a5a6',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        border: '1px solid rgba(149,165,166,0.2)',
                      }}
                    >
                      Not Set
                    </span>
                  )}
                  {!isEmpty && !isDraftDifferent && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(46,204,113,0.1)',
                        color: '#2ecc71',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        border: '1px solid rgba(46,204,113,0.2)',
                      }}
                    >
                      Published
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    href={`/control-panel/modules/site-management/${slug}/sections/${section.section_key}/edit`}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-sm)' }}
                  >
                    ✎ Edit Content
                  </Link>
                  {!isEmpty && (
                    <Link
                      href={slug === 'home' ? '/' : `/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: 'var(--text-sm)',
                        background: 'transparent',
                        border: '1px solid var(--lam-border)',
                        color: 'var(--lam-silver-light)',
                      }}
                    >
                      View Live ↗
                    </Link>
                  )}
                </div>
              </div>

              {/* ── Content summary ── */}
              <div style={{ padding: '1.25rem 1.5rem' }}>
                {displayContent ? (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    <tbody>
                      {Object.entries(displayContent).map(([key, val]) => (
                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td
                            style={{
                              padding: '0.6rem 1rem 0.6rem 0',
                              color: 'var(--lam-gold)',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              verticalAlign: 'top',
                              width: '180px',
                            }}
                          >
                            {humanize(key)}
                          </td>
                          <td style={{ padding: '0.6rem 0', color: 'var(--lam-silver-light)', lineHeight: 1.5 }}>
                            {Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {(val as Record<string, unknown>[]).map((item, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      background: 'rgba(0,0,0,0.2)',
                                      padding: '0.4rem 0.75rem',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      display: 'flex',
                                      gap: '0.5rem',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <span style={{ color: 'var(--lam-silver-dim)', minWidth: '20px' }}>
                                      {i + 1}.
                                    </span>
                                    {Object.entries(item).map(([sk, sv]) => (
                                      <span key={sk}>
                                        <span style={{ color: 'var(--lam-silver-dim)' }}>{humanize(sk)}:</span>{' '}
                                        <span style={{ color: 'var(--lam-silver-light)' }}>
                                          {truncate(String(sv || '—'), 60)}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              renderValue(val)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p
                    style={{
                      color: 'var(--lam-silver-dim)',
                      fontStyle: 'italic',
                      margin: 0,
                      padding: '1rem 0',
                    }}
                  >
                    No content has been published for this section yet. Click <strong>Edit Content</strong> to add it.
                  </p>
                )}
              </div>

              {/* ── Footer ── */}
              {section.updated_at && (
                <div
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderTop: '1px solid var(--lam-border)',
                    fontSize: '11px',
                    color: 'var(--lam-silver-dim)',
                    opacity: 0.7,
                  }}
                >
                  Last updated: {new Date(section.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}

        {(!sections || sections.length === 0) && (
          <div className="lam-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-lg)', margin: 0 }}>
              No editable sections defined for this page yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
