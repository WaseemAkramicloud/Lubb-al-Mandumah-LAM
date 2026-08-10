'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileDetails(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const phone = formData.get('phone') as string
    // Designation could be editable for normal users depending on policy, but we'll allow it for now
    const designation = formData.get('designation') as string

    if (!firstName || !lastName) {
      return { error: 'First name and Last name are required' }
    }

    const { error } = await supabase
      .from('staff_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        designation: designation || null
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/control-panel/profile')
    revalidatePath('/control-panel/layout') // in case name is displayed in top bar
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!newPassword || newPassword !== confirmPassword) {
      return { error: 'New passwords do not match or are empty' }
    }

    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    // Because this is the user updating their own password, we just call updateUser
    // Note: Supabase doesn't strictly verify 'currentPassword' via this method unless secure password change is configured on the project,
    // but we pass it anyway if we were to use a different auth flow. For now, updateUser is sufficient for the authenticated session.
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function updateSettings(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const theme = formData.get('theme') as string
    const notifications = formData.get('notifications') === 'on'
    
    // We expect the dashboard layout to be a JSON string from a hidden input if they use the drag/drop
    const layoutStr = formData.get('dashboard_layout') as string
    const dashboardLayout = layoutStr ? JSON.parse(layoutStr) : null

    const updates: Record<string, string | boolean | string[]> = {
      theme: theme || 'dark',
      email_notifications: notifications
    }

    if (dashboardLayout) {
      updates.dashboard_layout = dashboardLayout
    }

    // Upsert since they might not have a settings row if created before migration
    const { error } = await supabase
      .from('staff_settings')
      .upsert({
        user_id: user.id,
        ...updates
      })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/control-panel/settings')
    revalidatePath('/control-panel/dashboard')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}
