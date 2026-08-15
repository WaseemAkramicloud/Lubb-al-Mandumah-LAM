"use server"

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { logCustomerAudit } from '@/lib/sso/sso-service'
import crypto from 'crypto'

export async function archiveCustomerUserAction(customerId: string) {
  try {
    await requirePermission('user_management', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: cust, error: fetchErr } = await supabase
      .from('customer_identities')
      .select('id, email, status')
      .eq('id', customerId)
      .single()

    if (fetchErr || !cust) {
      return { success: false, error: 'Customer user not found.' }
    }

    const { error: updateErr } = await supabase
      .from('customer_identities')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', customerId)

    if (updateErr) {
      return { success: false, error: `Failed to archive user: ${updateErr.message}` }
    }

    await logCustomerAudit(customerId, null, 'customer_user_archived', { email: cust.email })

    revalidatePath('/control-panel/clients/users')
    revalidatePath(`/control-panel/clients/users/${customerId}`)
    revalidatePath('/control-panel/modules/ecosystem/identities')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

export async function restoreCustomerUserAction(customerId: string) {
  try {
    await requirePermission('user_management', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: cust, error: fetchErr } = await supabase
      .from('customer_identities')
      .select('id, email, status')
      .eq('id', customerId)
      .single()

    if (fetchErr || !cust) {
      return { success: false, error: 'Customer user not found.' }
    }

    const { error: updateErr } = await supabase
      .from('customer_identities')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', customerId)

    if (updateErr) {
      return { success: false, error: `Failed to restore user: ${updateErr.message}` }
    }

    await logCustomerAudit(customerId, null, 'customer_user_restored', { email: cust.email })

    revalidatePath('/control-panel/clients/users')
    revalidatePath(`/control-panel/clients/users/${customerId}`)
    revalidatePath('/control-panel/modules/ecosystem/identities')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

export async function resetCustomerUserPasswordAction(customerId: string) {
  try {
    await requirePermission('user_management', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: cust, error: fetchErr } = await supabase
      .from('customer_identities')
      .select('id, email, auth_user_id, first_name, last_name')
      .eq('id', customerId)
      .single()

    if (fetchErr || !cust) {
      return { success: false, error: 'Customer user not found.' }
    }

    let authUserId = cust.auth_user_id

    // If Auth user is missing or unlinked, locate or create Auth user
    if (!authUserId) {
      const { data: usersList } = await supabase.auth.admin.listUsers()
      const existingAuth = usersList?.users?.find(u => u.email?.toLowerCase() === cust.email.toLowerCase())
      authUserId = existingAuth?.id || null
    }

    // Generate a strong new initial password
    const newPassword = `LAM-${Math.floor(100000 + Math.random() * 900000)}!`

    if (authUserId) {
      const { error: authErr } = await supabase.auth.admin.updateUserById(authUserId, {
        password: newPassword,
        user_metadata: { must_change_password: false }
      })
      if (authErr) {
        return { success: false, error: `Failed to update Auth password: ${authErr.message}` }
      }
    } else {
      // Create new Auth user if not present
      const { data: newAuth, error: authCreateErr } = await supabase.auth.admin.createUser({
        email: cust.email,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          first_name: cust.first_name,
          last_name: cust.last_name,
          role: 'customer_owner',
          must_change_password: false
        }
      })
      if (authCreateErr || !newAuth.user) {
        return { success: false, error: `Failed to create Auth user: ${authCreateErr?.message}` }
      }
      authUserId = newAuth.user.id
    }

    // Update customer_identities record
    await supabase
      .from('customer_identities')
      .update({
        auth_user_id: authUserId,
        must_change_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)

    await logCustomerAudit(customerId, null, 'customer_user_password_reset', { email: cust.email })

    revalidatePath('/control-panel/clients/users')
    revalidatePath(`/control-panel/clients/users/${customerId}`)

    return {
      success: true,
      email: cust.email,
      newPassword
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

export async function removeCustomerCompanyMembershipAction(customerId: string, companyId: string) {
  try {
    await requirePermission('user_management', 'edit')
    const supabase = getSupabaseAdmin()

    // 1. Remove company membership
    const { error: memErr } = await supabase
      .from('customer_company_memberships')
      .delete()
      .eq('customer_id', customerId)
      .eq('company_id', companyId)

    if (memErr) {
      return { success: false, error: `Failed to remove company membership: ${memErr.message}` }
    }

    // 2. Remove company product access grants for this user
    await supabase
      .from('customer_product_access')
      .delete()
      .eq('customer_id', customerId)
      .eq('company_id', companyId)

    await logCustomerAudit(customerId, companyId, 'customer_user_membership_removed', { companyId })

    revalidatePath('/control-panel/clients/users')
    revalidatePath(`/control-panel/clients/users/${customerId}`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

export async function deleteCustomerUserAction(customerId: string, confirmEmail: string) {
  try {
    await requirePermission('user_management', 'delete')
    const supabase = getSupabaseAdmin()

    // 1. Fetch identity and active memberships
    const { data: cust, error: fetchErr } = await supabase
      .from('customer_identities')
      .select(`
        id, auth_user_id, email, first_name, last_name,
        memberships:customer_company_memberships(
          id, company_id, company_role,
          company:crm_companies(id, name, status)
        )
      `)
      .eq('id', customerId)
      .single()

    if (fetchErr || !cust) {
      return { success: false, error: 'Customer user not found.' }
    }

    // Verify confirmation email
    if (confirmEmail.trim().toLowerCase() !== cust.email.trim().toLowerCase()) {
      return { success: false, error: 'Confirmation email does not match the user\'s LAM ID email.' }
    }

    // 2. Safe Delete Rule Check: Check for active company memberships
    const activeMemberships = cust.memberships?.filter((m: any) => m.company && m.company.status !== 'Deleted') || []
    if (activeMemberships.length > 0) {
      const companyNames = activeMemberships.map((m: any) => m.company?.name).join(', ')
      await logCustomerAudit(customerId, null, 'customer_user_deletion_blocked', {
        email: cust.email,
        activeCompanies: companyNames
      })
      return {
        success: false,
        error: `This LAM ID is still associated with one or more client organizations (${companyNames}). Remove the relevant memberships before permanently deleting the identity.`
      }
    }

    // 3. Clean up user-scoped records
    await supabase.from('customer_product_access').delete().eq('customer_id', customerId)
    await supabase.from('customer_invitations').delete().eq('email', cust.email)
    await supabase.from('customer_sessions').delete().eq('customer_id', customerId)
    await supabase.from('customer_company_memberships').delete().eq('customer_id', customerId)

    // 4. Delete customer_identities row
    const { error: deleteIdErr } = await supabase
      .from('customer_identities')
      .delete()
      .eq('id', customerId)

    if (deleteIdErr) {
      return { success: false, error: `Failed to delete customer identity: ${deleteIdErr.message}` }
    }

    // 5. Delete Auth user if present
    if (cust.auth_user_id) {
      const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(cust.auth_user_id)
      if (authDeleteErr) {
        console.warn(`[WARNING] Deleted customer identity ${customerId} but Auth user deletion returned:`, authDeleteErr.message)
      }
    }

    await logCustomerAudit(customerId, null, 'customer_user_deleted', { email: cust.email })

    revalidatePath('/control-panel/clients/users')
    revalidatePath('/control-panel/modules/ecosystem/identities')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
