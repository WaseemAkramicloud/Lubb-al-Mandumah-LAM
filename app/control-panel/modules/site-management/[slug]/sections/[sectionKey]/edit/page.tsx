import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, fetchUserPermissions } from '@/lib/auth/permissions'
import Link from 'next/link'
import CmsEditForm from './CmsEditForm'

export async function generateMetadata({ params }: { params: { slug: string, sectionKey: string } }) {
  const p = await Promise.resolve(params)
  return { title: `Edit ${p.sectionKey} | Site Management` }
}

/** Human-readable label from camelCase / snake_case */
function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function CmsEditPage({ params }: { params: { slug: string, sectionKey: string } }) {
  await requirePermission('site_management', 'view')

  const p = await Promise.resolve(params)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/staff-login')

  const permissions = await fetchUserPermissions(user.id)
  const isSuperadmin = user.user_metadata?.role === 'super_admin'
  const canPublish = isSuperadmin || !!permissions.site_management?.includes('publish')

  const { data: section } = await supabase
    .from('cms_sections')
    .select('*')
    .eq('section_key', p.sectionKey)
    .single()

  if (!section) {
    redirect(`/control-panel/modules/site-management/${p.slug}`)
  }

  const published = section.published_content as Record<string, unknown> | null
  const hasPublished = published && Object.keys(published).length > 0

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* ── Navigation ── */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/control-panel/modules/site-management/${p.slug}`} style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          &larr; Back to Sections
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginTop: '1rem', marginBottom: '0.25rem' }}>
          Edit: {section.name}
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Page: <strong style={{ color: 'var(--lam-silver-light)' }}>{p.slug}</strong> &nbsp;·&nbsp; Section key: <code style={{ color: 'var(--lam-gold)', fontSize: '12px' }}>{section.section_key}</code>
        </p>
      </div>

      {/* ── Currently Published Reference Panel ── */}
      {hasPublished && (
        <details
          open
          style={{
            marginBottom: '2rem',
            background: 'rgba(46,204,113,0.04)',
            border: '1px solid rgba(46,204,113,0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <summary
            style={{
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              color: '#2ecc71',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              background: 'rgba(46,204,113,0.06)',
              borderBottom: '1px solid rgba(46,204,113,0.1)',
              userSelect: 'none',
            }}
          >
            📄 Currently Published Content (what visitors see now)
          </summary>
          <div style={{ padding: '1rem 1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <tbody>
                {Object.entries(published!).map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td
                      style={{
                        padding: '0.5rem 1rem 0.5rem 0',
                        color: 'var(--lam-gold)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        verticalAlign: 'top',
                        width: '180px',
                      }}
                    >
                      {humanize(key)}
                    </td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--lam-silver-light)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {val === null || val === undefined || val === ''
                        ? '—'
                        : Array.isArray(val)
                          ? val.length === 0
                            ? '— (empty)'
                            : typeof val[0] === 'object'
                              ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {(val as Record<string, unknown>[]).map((item, i) => (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontSize: '12px' }}>
                                      <span style={{ color: 'var(--lam-silver-dim)' }}>{i + 1}.</span>{' '}
                                      {Object.entries(item).map(([sk, sv]) => (
                                        <span key={sk} style={{ marginRight: '0.75rem' }}>
                                          <span style={{ color: 'var(--lam-silver-dim)' }}>{humanize(sk)}:</span>{' '}
                                          {String(sv || '—').substring(0, 80)}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )
                              : val.join(', ')
                          : typeof val === 'object'
                            ? JSON.stringify(val)
                            : String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* ── Instruction ── */}
      <div
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '8px',
          fontSize: 'var(--text-sm)',
          color: 'var(--lam-silver-light)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--lam-gold)' }}>How to edit:</strong> Change any field below.
        Click <strong>Save Draft</strong> to store your changes without affecting the live website.
        When you are satisfied, click <strong>Publish to Live Site</strong> to make the changes visible to the public.
      </div>

      {/* ── Edit Form ── */}
      <CmsEditForm
        sectionKey={section.section_key}
        schema={section.content_schema}
        initialData={section.draft_content || section.published_content || {}}
        canPublish={canPublish}
        previewUrl={p.slug === 'home' ? '/?preview=true' : `/${p.slug}?preview=true`}
      />
    </div>
  )
}
