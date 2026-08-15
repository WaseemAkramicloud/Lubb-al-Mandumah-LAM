'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { logAudit } from './audit'
import { revalidatePath } from 'next/cache'

/**
 * Grant or update a company product entitlement (Staff Control Panel action).
 */
export async function grantCompanyEntitlement(formData: FormData) {
  await requirePermission('leads_clients', 'edit')

  const companyId = formData.get('company_id') as string
  const productSlug = formData.get('product_slug') as string
  const planTier = (formData.get('plan_tier') as string) || 'standard'
  const maxSeats = parseInt((formData.get('max_seats') as string) || '10', 10)
  const status = (formData.get('status') as string) || 'active'
  const expiresAt = formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : null

  if (!companyId || !productSlug) {
    throw new Error('Company ID and product slug are required.')
  }

  const adminClient = getSupabaseAdmin()

  const payload = {
    company_id: companyId,
    product_slug: productSlug,
    plan_tier: planTier,
    max_seats: maxSeats,
    status,
    expires_at: expiresAt,
    updated_at: new Date().toISOString()
  }

  const { error } = await adminClient
    .from('customer_product_entitlements')
    .upsert(payload, { onConflict: 'company_id,product_slug' })

  if (error) throw new Error(error.message)

  await logAudit('customer_entitlement', companyId, 'entitlement_granted', { product_slug: productSlug, plan_tier: planTier, max_seats: maxSeats, status })

  revalidatePath('/control-panel/modules/ecosystem')
  revalidatePath('/control-panel/modules/ecosystem/entitlements')
  return { success: true }
}

/**
 * Revoke or suspend a company product entitlement.
 */
export async function revokeCompanyEntitlement(companyId: string, productSlug: string) {
  await requirePermission('leads_clients', 'edit')

  const adminClient = getSupabaseAdmin()

  const { error } = await adminClient
    .from('customer_product_entitlements')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)

  if (error) throw new Error(error.message)

  await logAudit('customer_entitlement', companyId, 'entitlement_suspended', { product_slug: productSlug })

  revalidatePath('/control-panel/modules/ecosystem/entitlements')
  return { success: true }
}

/**
 * Register or update a SaaS product tenant instance.
 */
export async function createProductInstance(formData: FormData) {
  await requirePermission('products', 'edit')

  const companyId = formData.get('company_id') as string
  const productSlug = formData.get('product_slug') as string
  const instanceKey = formData.get('instance_key') as string
  const instanceUrl = formData.get('instance_url') as string
  const environment = (formData.get('environment') as string) || 'production'
  const status = (formData.get('status') as string) || 'active'

  if (!companyId || !productSlug || !instanceKey || !instanceUrl) {
    throw new Error('All instance parameters are required.')
  }

  const adminClient = getSupabaseAdmin()

  const payload = {
    company_id: companyId,
    product_slug: productSlug,
    instance_key: instanceKey,
    instance_url: instanceUrl,
    environment,
    status,
    updated_at: new Date().toISOString()
  }

  const { error } = await adminClient
    .from('customer_product_instances')
    .upsert(payload, { onConflict: 'company_id,product_slug,instance_key' })

  if (error) throw new Error(error.message)

  await logAudit('product_instance', instanceKey, 'instance_registered', payload)

  revalidatePath('/control-panel/modules/ecosystem/instances')
  return { success: true }
}

/**
 * Suspend or reactivate a customer identity (Staff Control Panel action).
 */
export async function toggleCustomerIdentityStatus(customerId: string, newStatus: 'active' | 'suspended') {
  await requirePermission('user_management', 'edit')

  const adminClient = getSupabaseAdmin()

  const { error } = await adminClient
    .from('customer_identities')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', customerId)

  if (error) throw new Error(error.message)

  // Also revoke active sessions if suspending
  if (newStatus === 'suspended') {
    await adminClient
      .from('customer_sessions')
      .update({ is_active: false })
      .eq('customer_id', customerId)
  }

  await logAudit('customer_identity', customerId, `identity_${newStatus}`, { new_status: newStatus })

  revalidatePath('/control-panel/modules/ecosystem/identities')
  return { success: true }
}

/**
 * Update Customer Company details (Staff Control Panel action).
 * Preserves stable UUID PK and company_id string. Does NOT create duplicate company records.
 */
export async function updateCompanyDetailsAction(formData: FormData) {
  await requirePermission('leads_clients', 'edit')

  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const legalName = (formData.get('legal_name') as string)?.trim() || null
  const companyType = (formData.get('company_type') as string)?.trim() || 'standard'
  const country = (formData.get('country') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || null
  const website = (formData.get('website') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim().toLowerCase() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const status = (formData.get('status') as string)?.trim() || 'Active'
  const notes = (formData.get('notes') as string)?.trim() || null
  const assignedStaff = (formData.get('assigned_staff') as string)?.trim() || null

  if (!id || !name) {
    throw new Error('Company ID and Name are required.')
  }

  const adminClient = getSupabaseAdmin()

  const payload = {
    name,
    legal_name: legalName,
    company_type: companyType,
    country,
    city,
    website,
    email,
    phone,
    status,
    notes,
    assigned_staff: assignedStaff,
    updated_at: new Date().toISOString()
  }

  const { error } = await adminClient
    .from('crm_companies')
    .update(payload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  await logAudit('crm_company', id, 'company_updated', payload)

  revalidatePath('/control-panel/modules/ecosystem/companies')
  revalidatePath(`/control-panel/modules/ecosystem/companies/${id}`)
  revalidatePath('/control-panel/modules/leads-clients/companies')
  revalidatePath(`/control-panel/modules/leads-clients/companies/${id}`)

  return { success: true }
}

