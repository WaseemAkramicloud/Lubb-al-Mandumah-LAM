import { requirePermission, hasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { CollectionForm } from '../../../CollectionForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Edit Industry | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditIndustryPage({ params }: Props) {
  await requirePermission('site_management', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: industry, error } = await supabase
    .from('cms_collections')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('type', 'industry')
    .single()

  const canPublish = await hasPermission('site_management', 'publish')

  if (error || !industry) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/industries" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Industries
        </Link>
      </div>
      <CollectionForm initialData={industry} isNew={false} type="industry" canPublish={canPublish} previewUrl={`/industries/${industry.slug}?preview=true`} />
    </div>
  )
}
