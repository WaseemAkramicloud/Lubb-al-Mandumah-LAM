import { requirePermission, hasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { InsightForm } from '../../InsightForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Edit Article | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditInsightPage({ params }: Props) {
  await requirePermission('insights', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: article, error } = await supabase
    .from('cms_insights')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  const canPublish = await hasPermission('insights', 'publish')

  if (error || !article) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/insights" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Insights
        </Link>
      </div>
      <InsightForm initialData={article} isNew={false} canPublish={canPublish} previewUrl={`/insights/${article.slug}?preview=true`} />
    </div>
  )
}
