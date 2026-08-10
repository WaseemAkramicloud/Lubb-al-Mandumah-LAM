import { requirePermission, hasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { CollectionForm } from '../../../CollectionForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Edit Solution | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditSolutionPage({ params }: Props) {
  await requirePermission('site_management', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: solution, error } = await supabase
    .from('cms_collections')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('type', 'solution')
    .single()

  const canPublish = await hasPermission('site_management', 'publish')

  if (error || !solution) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/solutions" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Solutions
        </Link>
      </div>
      <CollectionForm initialData={solution} isNew={false} type="solution" canPublish={canPublish} previewUrl={`/solutions/${solution.slug}?preview=true`} />
    </div>
  )
}
