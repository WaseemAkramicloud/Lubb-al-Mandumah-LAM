'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from './audit'

export async function updateSystemSettings(formData: FormData) {
  await requirePermission('system_settings', 'edit')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const companyInfo = {
    name: formData.get('company_name'),
    email: formData.get('company_email'),
    phone: formData.get('company_phone'),
    address: formData.get('company_address'),
  }

  const socialLinks = {
    linkedin: formData.get('social_linkedin'),
    twitter: formData.get('social_twitter'),
    github: formData.get('social_github'),
  }

  const seoDefaults = {
    title_suffix: formData.get('seo_title_suffix'),
    default_description: formData.get('seo_default_description'),
  }

  const settingsToUpdate = [
    { key: 'company_info', value: companyInfo },
    { key: 'social_links', value: socialLinks },
    { key: 'seo_defaults', value: seoDefaults }
  ]

  for (const item of settingsToUpdate) {
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        setting_value: item.value, 
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', item.key)

    if (error) {
      console.error(`Error updating ${item.key}:`, error)
      return { success: false, error: "Failed to update system settings." }
    }
  }

  await logAudit('system_settings', 'global', 'update', { settings: settingsToUpdate })

  revalidatePath('/control-panel/modules/system-settings')
  return { success: true }
}
