import { requirePermission } from '@/lib/auth/permissions'
import { InsightForm } from '../InsightForm'
import Link from 'next/link'

export const metadata = {
  title: "Create Article | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CreateInsightPage() {
  await requirePermission('insights', 'create')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/insights" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Insights
        </Link>
      </div>
      <InsightForm isNew={true} />
    </div>
  )
}
