import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, fetchUserPermissions } from '@/lib/auth/permissions'
import Link from 'next/link'
import CmsEditForm from './CmsEditForm'

export async function generateMetadata({ params }: { params: { slug: string, sectionKey: string } }) {
  const p = await Promise.resolve(params)
  return { title: `Edit ${p.sectionKey} | Site Management` }
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/control-panel/modules/site-management/${p.slug}`} style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          &larr; Back to Sections
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginTop: '1rem', marginBottom: '0.5rem' }}>
          Edit: {section.name}
        </h1>
      </div>

      <CmsEditForm 
        sectionKey={section.section_key}
        schema={section.content_schema}
        initialData={section.draft_content || section.published_content || {}}
        canPublish={canPublish}
      />
    </div>
  )
}
