import { requirePermission } from '@/lib/auth/permissions'
import { CareerForm } from '../CareerForm'
import Link from 'next/link'

export const metadata = {
  title: "Create Vacancy | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CreateCareerPage() {
  await requirePermission('careers', 'create')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/careers" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Careers
        </Link>
      </div>
      <CareerForm isNew={true} />
    </div>
  )
}
