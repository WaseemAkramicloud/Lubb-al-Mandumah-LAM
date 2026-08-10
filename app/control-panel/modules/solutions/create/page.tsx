import { requirePermission } from '@/lib/auth/permissions'
import { CollectionForm } from '../../CollectionForm'
import Link from 'next/link'

export const metadata = {
  title: "Create Solution | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CreateSolutionPage() {
  await requirePermission('site_management', 'edit')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/solutions" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Solutions
        </Link>
      </div>
      <CollectionForm isNew={true} type="solution" />
    </div>
  )
}
