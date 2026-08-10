'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'

export async function saveCareerDraft(formData: FormData) {
  await requirePermission('careers', 'edit')

  const supabase = await createClient()
  const slug = formData.get('slug') as string
  const isNew = formData.get('is_new') === 'true'
  
  const payload = {
    slug,
    type: 'career',
    title: formData.get('title'),
    status: 'draft',
    data: {
      location: formData.get('location'),
      type: formData.get('job_type'),
      department: formData.get('department'),
      description: formData.get('description'),
      requirements: (formData.get('requirements') as string)?.split('\n').filter(Boolean) || [],
    }
  }

  if (isNew) {
    const { error } = await supabase.from('cms_collections').insert([payload])
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('cms_collections').update(payload).eq('slug', slug)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/about/careers')
  revalidatePath('/control-panel/modules/careers')
  
  return { success: true }
}

export async function publishCareer(slug: string) {
  // We reuse edit permission as careers don't have explicit publish action in MODULE_DEFINITIONS
  await requirePermission('careers', 'edit')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_collections')
    .update({ status: 'published' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  revalidatePath('/about/careers')
  revalidatePath('/control-panel/modules/careers')
  
  return { success: true }
}

export async function unpublishCareer(slug: string) {
  await requirePermission('careers', 'edit')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_collections')
    .update({ status: 'draft' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  revalidatePath('/about/careers')
  revalidatePath('/control-panel/modules/careers')
  
  return { success: true }
}

export async function deleteCareer(slug: string) {
  await requirePermission('careers', 'delete')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_collections')
    .delete()
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  revalidatePath('/about/careers')
  revalidatePath('/control-panel/modules/careers')
  
  return { success: true }
}
