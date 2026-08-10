import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import EditUserForm from './EditUserForm'

export const metadata = {
  title: "Edit User | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== 'super_admin') {
    redirect('/control-panel/dashboard')
  }

  const adminClient = getSupabaseAdmin()
  
  // Fetch profile
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('*')
    .eq('id', params.id)
    .single()
    
  if (!profile) {
    redirect('/control-panel/users')
  }

  // Fetch permissions
  const { data: permData } = await adminClient
    .from('staff_permissions')
    .select('permissions')
    .eq('user_id', params.id)
    .single()

  const permissions = permData?.permissions || {}

  return (
    <div style={{ maxWidth: '800px' }}>
      <EditUserForm profile={profile} initialPermissions={permissions} />
    </div>
  )
}
