import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { MediaLibrary } from './MediaLibrary'

export const metadata = {
  title: "Media Library | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function MediaLibraryPage() {
  await requirePermission('media_library', 'view')
  
  const supabase = await createClient()
  const { data: assets, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching media:", error)
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Media Library
        </h1>
        <p style={{ color: 'var(--lam-silver-light)', marginTop: '0.5rem' }}>
          Upload and manage reusable images and documents across the ecosystem. Maximum file size is 5MB.
        </p>
      </div>

      <MediaLibrary assets={assets || []} />
    </div>
  )
}
