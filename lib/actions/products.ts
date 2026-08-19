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
  
  const payload: Record<string, unknown> = {
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
    },
    // Internal Product Administration fields
    product_type: formData.get('product_type') || null,
    lifecycle_status: formData.get('lifecycle_status') || 'Active',
    db_architecture: formData.get('db_architecture') || 'Separate Product Project',
    app_url: formData.get('app_url') || null,
    admin_url: formData.get('admin_url') || null,
    product_owner: formData.get('product_owner') || null,
    technical_owner: formData.get('technical_owner') || null,
    commercial_owner: formData.get('commercial_owner') || null,
    internal_version: formData.get('internal_version') || null,
    internal_notes: formData.get('internal_notes') || null,
    // Integration Metadata
    integration_status: formData.get('integration_status') || 'Not Configured',
    api_base_url: formData.get('api_base_url') || null,
    health_check_url: formData.get('health_check_url') || null,
    webhook_url: formData.get('webhook_url') || null,
    external_product_ref: formData.get('external_product_ref') || null,
    sso_status: formData.get('sso_status') || 'Not Configured',
    integration_notes: formData.get('integration_notes') || null,
  }

  // Only set product_id on creation
  if (isNew) {
    const productId = formData.get('product_id') as string
    if (productId) {
      payload.product_id = productId.toUpperCase().trim()
    }
  }

  if (isNew) {
    const { error } = await supabase.from('cms_products').insert([payload])
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('cms_products').update(payload).eq('slug', slug)
    if (error) throw new Error(error.message)
    await supabase.from('lam_products').update({ category: payload.category as string }).eq('slug', slug)
  }

  await logAudit('cms_product', slug, 'draft_saved', { payload })

  revalidatePath('/', 'layout')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/control-panel/modules/products')
  
  return { success: true }
}

export async function publishProduct(slug: string) {
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

/**
 * Update the permanent Product ID. Restricted to Superadmin only.
 * This is a sensitive operation because other relational records depend on it.
 */
export async function updateProductId(slug: string, newProductId: string) {
  // Only Superadmin can change product_id after creation
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.user_metadata?.role !== 'super_admin') {
    throw new Error('Only Superadmin can modify the permanent Product ID.')
  }

  const sanitizedId = newProductId.toUpperCase().trim()
  if (!sanitizedId || sanitizedId.length < 2) {
    throw new Error('Product ID must be at least 2 characters.')
  }

  const { error } = await supabase
    .from('cms_products')
    .update({ product_id: sanitizedId })
    .eq('slug', slug)
    
  if (error) throw new Error(error.message)

  await logAudit('cms_product', slug, 'product_id_changed', { new_product_id: sanitizedId })

  revalidatePath('/control-panel/modules/products')
  revalidatePath(`/control-panel/modules/products/${slug}/edit`)
  
  return { success: true }
}
