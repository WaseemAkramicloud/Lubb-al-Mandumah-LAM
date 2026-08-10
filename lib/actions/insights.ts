'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'

export async function saveInsightDraft(formData: FormData) {
  await requirePermission('insights', 'edit')

  const supabase = await createClient()
  const slug = formData.get('slug') as string
  const isNew = formData.get('is_new') === 'true'
  
  const payload = {
    slug,
    title: formData.get('title'),
    category: formData.get('category'),
    date: formData.get('date'),
    author: formData.get('author'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    status: 'draft',
  }

  if (isNew) {
    const { error } = await supabase.from('cms_insights').insert([payload])
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('cms_insights').update(payload).eq('slug', slug)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/insights')
  revalidatePath(`/insights/${slug}`)
  revalidatePath('/control-panel/modules/insights')
  
  return { success: true }
}

export async function publishInsight(slug: string) {
  await requirePermission('insights', 'publish')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_insights')
    .update({ status: 'published' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  revalidatePath('/insights')
  revalidatePath(`/insights/${slug}`)
  revalidatePath('/control-panel/modules/insights')
  
  return { success: true }
}

export async function unpublishInsight(slug: string) {
  await requirePermission('insights', 'publish')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_insights')
    .update({ status: 'draft' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  revalidatePath('/insights')
  revalidatePath(`/insights/${slug}`)
  revalidatePath('/control-panel/modules/insights')
  
  return { success: true }
}
