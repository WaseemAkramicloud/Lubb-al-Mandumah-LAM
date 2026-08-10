'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from './audit'

export async function savePricingPlan(formData: FormData) {
  const isEditing = formData.get('id') !== null
  if (isEditing) {
    await requirePermission('pricing_plans', 'edit')
  } else {
    await requirePermission('pricing_plans', 'manage_pricing') // Assuming create needs manage_pricing
  }

  const supabase = await createClient()

  const featuresText = formData.get('features') as string
  const features = featuresText.split('\n').map(f => f.trim()).filter(f => f.length > 0)

  const data = {
    product_slug: formData.get('product_slug'),
    plan_name: formData.get('plan_name'),
    display_price: formData.get('display_price'),
    currency: formData.get('currency') || null,
    billing_period_label: formData.get('billing_period_label') || null,
    features: features,
    cta_text: formData.get('cta_text'),
    cta_link: formData.get('cta_link'),
    order_index: parseInt(formData.get('order_index') as string || '0'),
  }

  let result
  if (isEditing) {
    const id = formData.get('id') as string
    result = await supabase
      .from('cms_pricing_plans')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, plan_name')
      .single()
      
    await logAudit('pricing_plan', id, 'update', data)
  } else {
    result = await supabase
      .from('cms_pricing_plans')
      .insert({ ...data, status: 'draft' }) // New plans always draft
      .select('id, plan_name')
      .single()
      
    if (result.data) {
      await logAudit('pricing_plan', result.data.id, 'create', data)
    }
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/control-panel/modules/pricing')
  return { success: true }
}

export async function publishPricingPlan(id: string, publish: boolean) {
  await requirePermission('pricing_plans', 'publish')
  const supabase = await createClient()
  
  const status = publish ? 'published' : 'draft'
  const { error } = await supabase
    .from('cms_pricing_plans')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  await logAudit('pricing_plan', id, status, {})
  revalidatePath('/control-panel/modules/pricing')
  return { success: true }
}

export async function archivePricingPlan(id: string) {
  // We'll treat archive as setting status to archived rather than hard delete, 
  // or we can hard delete if they have manage_pricing. The requirement says:
  // "Prefer archive/deactivate over hard delete where historical integrity matters."
  await requirePermission('pricing_plans', 'manage_pricing')
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('cms_pricing_plans')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  await logAudit('pricing_plan', id, 'archive', {})
  revalidatePath('/control-panel/modules/pricing')
  return { success: true }
}
