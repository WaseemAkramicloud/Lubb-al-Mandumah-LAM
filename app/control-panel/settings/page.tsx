import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchUserPermissions } from '@/lib/auth/permissions'
import SettingsForm from './SettingsForm'

export const metadata = {
  title: "Settings | LΛM Control Panel",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/staff-login')
  }

  // Fetch settings
  const { data: settings } = await supabase
    .from('staff_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch permissions to know what widgets they can toggle
  const permissions = await fetchUserPermissions(user.id)
  const isSuperadmin = user.user_metadata?.role === 'super_admin'

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '2rem' }}>
        Personal Settings
      </h1>
      
      <SettingsForm 
        settings={settings} 
        permissions={permissions} 
        isSuperadmin={isSuperadmin} 
      />
    </div>
  )
}
