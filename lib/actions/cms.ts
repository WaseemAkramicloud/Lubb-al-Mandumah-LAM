'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { fetchUserPermissions } from '@/lib/auth/permissions'

export async function saveCmsDraft(sectionKey: string, draftContent: Record<string, unknown>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Check module permission: 'site_management' view/edit
    const permissions = await fetchUserPermissions(user.id)
    const isSuperadmin = user.user_metadata?.role === 'super_admin'
    const hasEdit = isSuperadmin || permissions.site_management?.includes('edit')

    if (!hasEdit) {
      return { error: 'Unauthorized to edit site content' }
    }

    const { error } = await supabase
      .from('cms_sections')
      .update({ draft_content: draftContent })
      .eq('section_key', sectionKey)

    if (error) return { error: error.message }
    
    // We don't need to revalidate public paths on draft save, but we revalidate control panel
    revalidatePath('/control-panel/modules/site-management', 'layout')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}

export async function publishCmsSection(sectionKey: string, content: Record<string, unknown>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const permissions = await fetchUserPermissions(user.id)
    const isSuperadmin = user.user_metadata?.role === 'super_admin'
    const hasPublish = isSuperadmin || permissions.site_management?.includes('publish')

    if (!hasPublish) {
      return { error: 'Unauthorized to publish site content' }
    }

    const { error } = await supabase
      .from('cms_sections')
      .update({ 
        published_content: content,
        draft_content: content // Synchronize draft with published when publishing
      })
      .eq('section_key', sectionKey)

    if (error) return { error: error.message }
    
    // Hard revalidate the public site root (and specific pages when we have them)
    revalidatePath('/', 'layout')
    revalidatePath('/control-panel/modules/site-management', 'layout')
    return { success: true }
  } catch (err: unknown) {
    return { error: (err as Error).message }
  }
}
