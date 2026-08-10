import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { SystemSettingsForm } from './SystemSettingsForm'

export const metadata = {
  title: "System Settings | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function SystemSettingsPage() {
  await requirePermission('system_settings', 'edit')
  
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('system_settings')
    .select('*')

  const settingsMap = (settings || []).reduce((acc: any, item: any) => {
    acc[item.setting_key] = item.setting_value
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
        Global System Settings
      </h1>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem' }}>
        Manage public website configuration, SEO defaults, and global contact parameters.
      </p>

      <SystemSettingsForm settingsMap={settingsMap} />
    </div>
  )
}
