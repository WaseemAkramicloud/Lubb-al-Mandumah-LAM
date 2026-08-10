import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StaffPermissions, ModuleName, PermissionAction } from './permission-constants'

/**
 * Fetch permissions for a given user ID
 */
export async function fetchUserPermissions(userId: string): Promise<StaffPermissions> {
  const adminClient = getSupabaseAdmin()
  const { data } = await adminClient
    .from('staff_permissions')
    .select('permissions')
    .eq('user_id', userId)
    .single()
    
  return (data?.permissions as StaffPermissions) || {}
}

/**
 * Server-side helper to enforce permissions on a route/action.
 * Must be called inside a Server Component or Server Action.
 */
export async function requirePermission(module: ModuleName, action: PermissionAction = 'view') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/staff-login')
  }

  // Security Hardening: Enforce suspended check in server actions
  const adminClient = getSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'suspended') {
    throw new Error('Action blocked: Your account is suspended.')
  }

  // If they are legacy super_admin by auth role, allow it (fallback)
  if (user.user_metadata?.role === 'super_admin') {
    return true
  }

  const permissions = await fetchUserPermissions(user.id)
  
  const moduleActions = permissions[module]
  if (!moduleActions || !moduleActions.includes(action)) {
    redirect('/control-panel/unauthorized')
  }

  return true
}

/**
 * Server-side helper to silently check if a user has a permission.
 */
export async function hasPermission(module: ModuleName, action: PermissionAction = 'view') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false;

  const adminClient = getSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'suspended') return false;

  if (user.user_metadata?.role === 'super_admin') return true;

  const permissions = await fetchUserPermissions(user.id)
  const moduleActions = permissions[module]
  return !!(moduleActions && moduleActions.includes(action))
}
