import { requirePermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { CareerForm } from '../../CareerForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Edit Vacancy | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditCareerPage({ params }: Props) {
  await requirePermission('careers', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: career, error } = await supabase
    .from('cms_collections')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  if (error || !career) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/careers" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Careers
        </Link>
      </div>
      <CareerForm initialData={career} isNew={false} />
    </div>
  )
}
