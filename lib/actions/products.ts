'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/actions/audit'

export async function saveProductDraft(formData: FormData) {
  await requirePermission('products', 'edit')

  const supabase = await createClient()
  const slug = formData.get('slug') as string
  const isNew = formData.get('is_new') === 'true'
  
  const payload = {
    slug,
    name: formData.get('name'),
    tagline: formData.get('tagline'),
    description: formData.get('description'),
    category: formData.get('category'),
    href: formData.get('href') || `/products/${slug}`,
    restricted: formData.get('restricted') === 'true',
    coming_soon: formData.get('coming_soon') === 'true',
    badge: formData.get('badge') || null,
    status: 'draft',
    detail: {
      whatItIs: formData.get('whatItIs'),
      whoItIsFor: formData.get('whoItIsFor'),
      problemsSolved: (formData.get('problemsSolved') as string)?.split('\n').filter(Boolean) || [],
      keyCapabilities: (formData.get('keyCapabilities') as string)?.split('\n').filter(Boolean) || [],
      benefits: (formData.get('benefits') as string)?.split('\n').filter(Boolean) || [],
      deploymentNote: formData.get('deploymentNote'),
      relatedSolutions: (formData.get('relatedSolutions') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      ctaType: formData.get('ctaType') || 'demo'
    }
  }

  if (isNew) {
    const { error } = await supabase.from('cms_products').insert([payload])
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('cms_products').update(payload).eq('slug', slug)
    if (error) throw new Error(error.message)
  }

  await logAudit('cms_product', slug, 'draft_saved', { payload })

  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/control-panel/modules/products')
  
  return { success: true }
}

export async function publishProduct(slug: string) {
  // We reuse the edit permission here since publish isn't a separate action for products in MODULE_DEFINITIONS
  await requirePermission('products', 'edit')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_products')
    .update({ status: 'published' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  await logAudit('cms_product', slug, 'published', {})

  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/control-panel/modules/products')
  
  return { success: true }
}

export async function unpublishProduct(slug: string) {
  await requirePermission('products', 'edit')
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('cms_products')
    .update({ status: 'draft' })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  await logAudit('cms_product', slug, 'unpublished', {})

  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/control-panel/modules/products')
  
  return { success: true }
}
