'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { notifyNexoraProvisioning } from '@/lib/sso/nexora-client'
import { logCustomerAudit } from '@/lib/sso/sso-service'

export async function suspendClientAction(companyId: string) {
  try {
    await requirePermission('leads_clients', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: company } = await supabase
      .from('crm_companies')
      .select('id, name')
      .eq('id', companyId)
      .single()

    if (!company) return { success: false, error: 'Company not found.' }

    await supabase
      .from('crm_companies')
      .update({ status: 'Suspended', updated_at: new Date().toISOString() })
      .eq('id', companyId)

    await supabase
      .from('customer_product_entitlements')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    await supabase
      .from('customer_product_access')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    const nexoraRes = await notifyNexoraProvisioning({
      action: 'suspend',
      company_id: companyId,
      company_name: company.name,
      product_slug: 'nexora',
      plan_tier: 'standard',
      max_seats: 10
    })

    await logCustomerAudit(null, companyId, 'client_suspended', {
      companyName: company.name,
      externalSaasDeprovisioning: nexoraRes
    })

    revalidatePath('/control-panel/clients')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath(`/control-panel/clients/${companyId}`)
    revalidatePath(`/control-panel/modules/ecosystem/companies/${companyId}`)

    return { success: true, newStatus: 'Suspended' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to suspend client.' }
  }
}

export async function reactivateClientAction(companyId: string) {
  try {
    await requirePermission('leads_clients', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: company } = await supabase
      .from('crm_companies')
      .select('id, name')
      .eq('id', companyId)
      .single()

    if (!company) return { success: false, error: 'Company not found.' }

    await supabase
      .from('crm_companies')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', companyId)

    await supabase
      .from('customer_product_entitlements')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    await supabase
      .from('customer_product_access')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    const nexoraRes = await notifyNexoraProvisioning({
      action: 'activate',
      company_id: companyId,
      company_name: company.name,
      product_slug: 'nexora',
      plan_tier: 'standard',
      max_seats: 10
    })

    await logCustomerAudit(null, companyId, 'client_reactivated', {
      companyName: company.name,
      externalSaasDeprovisioning: nexoraRes
    })

    revalidatePath('/control-panel/clients')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath(`/control-panel/clients/${companyId}`)
    revalidatePath(`/control-panel/modules/ecosystem/companies/${companyId}`)

    return { success: true, newStatus: 'Active' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reactivate client.' }
  }
}

export async function archiveClientAction(companyId: string) {
  try {
    await requirePermission('leads_clients', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: company } = await supabase
      .from('crm_companies')
      .select('id, name')
      .eq('id', companyId)
      .single()

    if (!company) return { success: false, error: 'Company not found.' }

    await supabase
      .from('crm_companies')
      .update({ status: 'Archived', updated_at: new Date().toISOString() })
      .eq('id', companyId)

    await supabase
      .from('customer_product_entitlements')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    await supabase
      .from('customer_product_access')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    const nexoraRes = await notifyNexoraProvisioning({
      action: 'archive',
      company_id: companyId,
      company_name: company.name,
      product_slug: 'nexora',
      plan_tier: 'standard',
      max_seats: 10
    })

    await logCustomerAudit(null, companyId, 'client_archived', {
      companyName: company.name,
      externalSaasDeprovisioning: nexoraRes
    })

    revalidatePath('/control-panel/clients')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath(`/control-panel/clients/${companyId}`)
    revalidatePath(`/control-panel/modules/ecosystem/companies/${companyId}`)

    return { success: true, newStatus: 'Archived' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to archive client.' }
  }
}

export async function deleteClientAction(
  companyId: string,
  typedConfirmation: string,
  deleteOrphanedIdentity: boolean = false
) {
  try {
    await requirePermission('leads_clients', 'edit')
    const supabase = getSupabaseAdmin()

    // 1. Fetch company & verify confirmation text
    const { data: company } = await supabase
      .from('crm_companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) return { success: false, error: 'Company record not found.' }

    const normInput = typedConfirmation.trim().toLowerCase()
    const matchName = company.name.trim().toLowerCase()
    const matchCode = (company.company_id || '').trim().toLowerCase()

    if (normInput !== matchName && normInput !== matchCode) {
      return { success: false, error: `Confirmation mismatch. You typed "${typedConfirmation}", which does not match "${company.name}" or code "${company.company_id}".` }
    }

    await logCustomerAudit(null, companyId, 'permanent_deletion_initiated', {
      companyName: company.name,
      companyIdCode: company.company_id,
      deleteOrphanedIdentity
    })

    // 2. Inter-Service Deprovisioning Notice to NEXORA
    const nexoraRes = await notifyNexoraProvisioning({
      action: 'delete',
      company_id: company.id,
      company_name: company.name,
      product_slug: 'nexora',
      plan_tier: 'standard',
      max_seats: 10
    })

    await logCustomerAudit(null, companyId, 'external_saas_deprovisioned', {
      product: 'nexora',
      result: nexoraRes
    })

    // 3. Fetch Memberships before deletion to inspect customer identities
    const { data: memberships } = await supabase
      .from('customer_company_memberships')
      .select('customer_id')
      .eq('company_id', companyId)

    const customerIds = (memberships || []).map(m => m.customer_id)

    // 4. Delete Company-scoped records safely
    await supabase.from('customer_product_access').delete().eq('company_id', companyId)
    await supabase.from('customer_product_entitlements').delete().eq('company_id', companyId)
    await supabase.from('customer_product_instances').delete().eq('company_id', companyId)
    await supabase.from('customer_company_memberships').delete().eq('company_id', companyId)
    await supabase.from('customer_invitations').delete().eq('company_id', companyId)

    // 5. Optionally handle orphaned customer identities
    if (deleteOrphanedIdentity && customerIds.length > 0) {
      for (const custId of customerIds) {
        // Check if customer belongs to ANY OTHER company
        const { data: otherMems } = await supabase
          .from('customer_company_memberships')
          .select('id')
          .eq('customer_id', custId)

        if (!otherMems || otherMems.length === 0) {
          const { data: custIdentity } = await supabase
            .from('customer_identities')
            .select('id, auth_user_id, email')
            .eq('id', custId)
            .single()

          if (custIdentity) {
            // Delete customer sessions
            await supabase.from('customer_sessions').delete().eq('customer_id', custId)
            // Delete customer identity record
            await supabase.from('customer_identities').delete().eq('id', custId)

            // Delete Auth user if auth_user_id is present
            if (custIdentity.auth_user_id) {
              await supabase.auth.admin.deleteUser(custIdentity.auth_user_id).catch(() => {})
            }

            await logCustomerAudit(null, null, 'orphaned_identity_deleted', {
              email: custIdentity.email,
              customerId: custId
            })
          }
        }
      }
    }

    // 6. Delete Company Record
    const { error: deleteErr } = await supabase
      .from('crm_companies')
      .delete()
      .eq('id', companyId)

    if (deleteErr) {
      await logCustomerAudit(null, companyId, 'permanent_deletion_failed', { error: deleteErr.message })
      return { success: false, error: `Failed to delete company record: ${deleteErr.message}` }
    }

    await logCustomerAudit(null, null, 'permanent_deletion_completed', {
      companyName: company.name,
      companyId: company.id
    })

    revalidatePath('/control-panel/clients')
    revalidatePath('/control-panel/modules/ecosystem/companies')

    return { success: true, redirectUrl: '/control-panel/clients' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Permanent deletion failed.' }
  }
}
