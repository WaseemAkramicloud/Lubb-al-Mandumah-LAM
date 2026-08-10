'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/actions/audit'

export async function saveCollectionDraft(formData: FormData) {
  await requirePermission('site_management', 'edit')

  const supabase = await createClient()
  const slug = formData.get('slug') as string
  const type = formData.get('type') as 'solution' | 'industry'
  const isNew = formData.get('is_new') === 'true'
  
  const payload = {
    slug,
    type,
    title: formData.get('title'),
    status: 'draft',
    data: {
      description: formData.get('description'),
      commonNeeds: (formData.get('commonNeeds') as string)?.split('\n').filter(Boolean) || [],
      relatedProducts: (formData.get('relatedProducts') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
    }
  }

  if (isNew) {
    const { error } = await supabase.from('cms_collections').insert([payload])
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('cms_collections').update(payload).eq('slug', slug).eq('type', type)
    if (error) throw new Error(error.message)
  }

  await logAudit('cms_collection', slug, 'draft_saved', { payload })

  revalidatePath(`/${type}s`)
  revalidatePath(`/${type}s/${slug}`)
  revalidatePath(`/control-panel/modules/${type}s`)
  
  return { success: true }
}

export async function publishCollection(slug: string, type: 'solution' | 'industry') {
  await requirePermission('site_management', 'publish')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_collections')
    .update({ status: 'published' })
    .eq('slug', slug)
    .eq('type', type)
    
  if (error) throw new Error(error.message)

  await logAudit('cms_collection', slug, 'published', {})

  revalidatePath(`/${type}s`)
  revalidatePath(`/${type}s/${slug}`)
  revalidatePath(`/control-panel/modules/${type}s`)
  
  return { success: true }
}

export async function unpublishCollection(slug: string, type: 'solution' | 'industry') {
  await requirePermission('site_management', 'publish')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_collections')
    .update({ status: 'draft' })
    .eq('slug', slug)
    .eq('type', type)
    
  if (error) throw new Error(error.message)

  await logAudit('cms_collection', slug, 'unpublished', {})

  revalidatePath(`/${type}s`)
  revalidatePath(`/${type}s/${slug}`)
  revalidatePath(`/control-panel/modules/${type}s`)
  
  return { success: true }
}
