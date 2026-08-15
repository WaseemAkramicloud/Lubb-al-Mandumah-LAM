"use server"

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { notifyNexoraProvisioning } from '@/lib/sso/nexora-client'
import { logCustomerAudit } from '@/lib/sso/sso-service'
import crypto from 'crypto'

export type OnboardingActionState = {
  success?: boolean
  error?: string
  companyId?: string
  companyName?: string
  inviteUrl?: string
  provisionMode?: string
  message?: string
  ownerEmail?: string
  ownerFirstName?: string
  ownerLastName?: string
  temporaryPassword?: string
  isExistingIdentity?: boolean
  productSlug?: string
  planTier?: string
  maxSeats?: number
}

export async function onboardCustomerCompanyAction(
  prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  try {
    await requirePermission('leads_clients', 'edit')

    const companyName = (formData.get('company_name') as string)?.trim()
    const legalName = (formData.get('legal_name') as string)?.trim() || null
    const companyType = (formData.get('company_type') as string)?.trim() || 'standard'
    const country = (formData.get('country') as string)?.trim() || null
    const city = (formData.get('city') as string)?.trim() || null

    const ownerFirstName = (formData.get('owner_first_name') as string)?.trim()
    const ownerLastName = (formData.get('owner_last_name') as string)?.trim() || ''
    const ownerEmail = (formData.get('owner_email') as string)?.trim().toLowerCase()

    const productSlug = (formData.get('product_slug') as string)?.trim().toLowerCase() || 'nexora'
    const planTier = (formData.get('plan_tier') as string)?.trim().toLowerCase() || (companyType === 'demo' ? 'demo' : 'standard')
    const maxSeats = parseInt((formData.get('max_seats') as string) || '10', 10)
    const expiresDaysRaw = (formData.get('expires_days') as string)?.trim()
    const expiresDays = expiresDaysRaw ? parseInt(expiresDaysRaw, 10) : null

    const provisionMode = (formData.get('provision_mode') as string)?.trim() || 'password'
    let initialPassword = (formData.get('initial_password') as string)?.trim()

    if (!companyName || !ownerFirstName || !ownerEmail) {
      return { error: 'Company Name, Owner First Name, and Owner Email are required.' }
    }

    const supabase = getSupabaseAdmin()

    // Check if identity already exists in customer_identities or Auth
    let isExistingIdentity = false
    let authUserId: string | null = null

    const { data: existingIdentity } = await supabase
      .from('customer_identities')
      .select('id, auth_user_id, email, status')
      .ilike('email', ownerEmail)
      .maybeSingle()

    const { data: usersList } = await supabase.auth.admin.listUsers()
    const existingAuth = usersList?.users?.find(u => u.email?.toLowerCase() === ownerEmail)

    if (existingIdentity || existingAuth) {
      isExistingIdentity = true
      authUserId = existingIdentity?.auth_user_id || existingAuth?.id || null
    }

    // 1. Create or Locate Company in crm_companies
    let company: any = null
    const { data: existingCompany } = await supabase
      .from('crm_companies')
      .select('*')
      .ilike('name', companyName)
      .maybeSingle()

    if (existingCompany) {
      const { data: updatedComp, error: updateErr } = await supabase
        .from('crm_companies')
        .update({
          legal_name: legalName || existingCompany.legal_name,
          company_type: companyType,
          country: country || existingCompany.country,
          city: city || existingCompany.city,
          email: ownerEmail || existingCompany.email,
          status: 'Active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCompany.id)
        .select()
        .single()

      if (updateErr) return { error: `Failed to update company record: ${updateErr.message}` }
      company = updatedComp
    } else {
      const companyIdCode = `COMP-${Math.floor(100000 + Math.random() * 900000)}`
      const { data: newComp, error: compErr } = await supabase
        .from('crm_companies')
        .insert({
          company_id: companyIdCode,
          name: companyName,
          legal_name: legalName,
          company_type: companyType,
          country,
          city,
          email: ownerEmail,
          status: 'Active',
          source: companyType === 'demo' ? 'Superadmin Demo Onboarding' : 'Staff Controlled Onboarding'
        })
        .select()
        .single()

      if (compErr || !newComp) return { error: `Failed to create company: ${compErr?.message}` }
      company = newComp
    }

    // 2. Product Entitlement (Company level)
    let expiresAt: string | null = null
    if (expiresDays && expiresDays > 0) {
      expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()
    }

    const { error: entErr } = await supabase
      .from('customer_product_entitlements')
      .upsert(
        {
          company_id: company.id,
          product_slug: productSlug,
          plan_tier: planTier,
          max_seats: maxSeats,
          status: 'active',
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'company_id,product_slug' }
      )

    if (entErr) return { error: `Failed to assign entitlement: ${entErr.message}` }

    // 3. Identity & Auth Provisioning Branch
    let customerId: string

    if (isExistingIdentity && existingIdentity) {
      customerId = existingIdentity.id
      if (authUserId && !existingIdentity.auth_user_id) {
        await supabase
          .from('customer_identities')
          .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
          .eq('id', customerId)
      }
    } else {
      // NEW IDENTITY PROVISIONING
      if (provisionMode === 'password') {
        if (!initialPassword || initialPassword.length < 8) {
          initialPassword = `LAM-Temp-${Math.floor(100000 + Math.random() * 900000)}!`
        }

        const { data: newAuth, error: authErr } = await supabase.auth.admin.createUser({
          email: ownerEmail,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            first_name: ownerFirstName,
            last_name: ownerLastName,
            role: 'customer_owner',
            must_change_password: true
          }
        })

        if (authErr || !newAuth.user) {
          return { error: `Failed to create Auth user: ${authErr?.message}` }
        }
        authUserId = newAuth.user.id
      }

      // Create linked customer_identities row
      const { data: newIdentity, error: idErr } = await supabase
        .from('customer_identities')
        .insert({
          auth_user_id: authUserId,
          email: ownerEmail,
          first_name: ownerFirstName,
          last_name: ownerLastName,
          status: 'active',
          must_change_password: provisionMode === 'password' && !isExistingIdentity
        })
        .select()
        .single()

      if (idErr || !newIdentity) {
        return { error: `Failed to create customer identity: ${idErr?.message}` }
      }
      customerId = newIdentity.id
    }

    // 4. Company Membership (Role: Company Owner)
    await supabase.from('customer_company_memberships').upsert(
      {
        customer_id: customerId,
        company_id: company.id,
        company_role: 'owner',
        status: 'active'
      },
      { onConflict: 'customer_id,company_id' }
    )

    // 5. Explicit Primary Owner Product Access Grant
    await supabase.from('customer_product_access').upsert(
      {
        customer_id: customerId,
        company_id: company.id,
        product_slug: productSlug,
        status: 'active'
      },
      { onConflict: 'customer_id,company_id,product_slug' }
    )

    // 6. Inter-Service Provisioning Notice for Child SaaS (NEXORA API call, no direct DB writes)
    await notifyNexoraProvisioning({
      action: 'activate',
      company_id: company.id,
      company_name: company.name,
      product_slug: productSlug,
      plan_tier: planTier,
      max_seats: maxSeats
    })

    const { data: instanceCheck } = await supabase
      .from('customer_product_instances')
      .select('id')
      .eq('company_id', company.id)
      .eq('product_slug', productSlug)
      .maybeSingle()

    if (!instanceCheck) {
      const nexoraBase = process.env.NEXORA_BASE_URL || 'https://nexora.lubbalmandumah.com'
      await supabase.from('customer_product_instances').insert({
        company_id: company.id,
        product_slug: productSlug,
        instance_key: `tenant_${company.id.slice(0, 8)}`,
        environment: 'production',
        instance_url: nexoraBase,
        status: 'active'
      })
    }

    // 7. Setup / Invitation Link Generation
    let inviteUrl = ''
    const inviteToken = 'inv_' + crypto.randomUUID().replace(/-/g, '')
    const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex')
    const inviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    // Revoke previous unredeemed invitations for same email & company context
    await supabase
      .from('customer_invitations')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('company_id', company.id)
      .eq('email', ownerEmail)
      .eq('status', 'pending')

    await supabase.from('customer_invitations').insert({
      token: inviteToken,
      token_hash: inviteTokenHash,
      company_id: company.id,
      email: ownerEmail,
      role: 'owner',
      product_slugs: [productSlug],
      expires_at: inviteExpiresAt,
      status: provisionMode === 'password' ? 'accepted' : 'pending'
    })

    const appBaseUrl = process.env.LAM_ID_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://id.lubbalmandumah.com'
    inviteUrl = `${appBaseUrl}/id/invite/${inviteToken}`

    await logCustomerAudit(customerId, company.id, 'client_company_onboarded', {
      companyName: company.name,
      ownerEmail,
      provisionMode,
      isExistingIdentity,
      productSlug,
      maxSeats
    })

    revalidatePath('/control-panel/modules/ecosystem')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath(`/control-panel/modules/ecosystem/companies/${company.id}`)
    revalidatePath('/control-panel/clients')

    return {
      success: true,
      companyId: company.id,
      companyName: company.name,
      inviteUrl,
      provisionMode,
      ownerEmail,
      ownerFirstName,
      ownerLastName,
      temporaryPassword: (provisionMode === 'password' && !isExistingIdentity) ? initialPassword : undefined,
      isExistingIdentity,
      productSlug,
      planTier,
      maxSeats,
      message: `Successfully onboarded ${company.name} (${companyType.toUpperCase()})!`
    }
  } catch (err: any) {
    return { error: err.message || 'Client onboarding failed.' }
  }
}

export async function issueTemporaryPasswordAction(customerId: string, companyId?: string) {
  try {
    await requirePermission('leads_clients', 'edit')
    const supabase = getSupabaseAdmin()

    const { data: customer, error: custErr } = await supabase
      .from('customer_identities')
      .select('id, auth_user_id, email, first_name, last_name')
      .eq('id', customerId)
      .single()

    if (custErr || !customer) {
      return { success: false, error: 'Customer identity not found.' }
    }

    const newTempPassword = `LAM-Reset-${Math.floor(100000 + Math.random() * 900000)}!`

    if (customer.auth_user_id) {
      const { error: authErr } = await supabase.auth.admin.updateUserById(customer.auth_user_id, {
        password: newTempPassword,
        user_metadata: { must_change_password: true }
      })
      if (authErr) return { success: false, error: authErr.message }
    } else {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: customer.email,
        password: newTempPassword,
        email_confirm: true,
        user_metadata: { first_name: customer.first_name, last_name: customer.last_name, must_change_password: true }
      })
      if (authErr) return { success: false, error: authErr.message }
      if (authUser?.user) {
        await supabase.from('customer_identities').update({ auth_user_id: authUser.user.id }).eq('id', customer.id)
      }
    }

    await supabase
      .from('customer_identities')
      .update({ must_change_password: true, updated_at: new Date().toISOString() })
      .eq('id', customer.id)

    await logCustomerAudit(customer.id, companyId || null, 'temporary_password_issued_by_admin', {
      email: customer.email
    })

    revalidatePath(`/control-panel/modules/ecosystem/companies/${companyId}`)

    return {
      success: true,
      temporaryPassword: newTempPassword,
      email: customer.email,
      message: `Issued new temporary password for ${customer.email}.`
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to issue temporary password.' }
  }
}

export async function toggleCompanyStatusAction(companyId: string, currentStatus: string) {
  try {
    await requirePermission('leads_clients', 'edit')

    const newCompanyStatus = currentStatus === 'Active' ? 'Suspended' : 'Active'
    const newEntitlementStatus = currentStatus === 'Active' ? 'suspended' : 'active'

    const supabase = getSupabaseAdmin()

    await supabase
      .from('crm_companies')
      .update({ status: newCompanyStatus })
      .eq('id', companyId)

    await supabase
      .from('customer_product_entitlements')
      .update({ status: newEntitlementStatus })
      .eq('company_id', companyId)

    await notifyNexoraProvisioning({
      action: newCompanyStatus === 'Active' ? 'activate' : 'suspend',
      company_id: companyId,
      company_name: 'Company',
      product_slug: 'nexora',
      plan_tier: 'standard',
      max_seats: 10
    })

    revalidatePath('/control-panel/modules/ecosystem')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath(`/control-panel/modules/ecosystem/companies/${companyId}`)

    return { success: true, newStatus: newCompanyStatus }
  } catch (err: any) {
    return { error: err.message || 'Failed to update company status' }
  }
}
