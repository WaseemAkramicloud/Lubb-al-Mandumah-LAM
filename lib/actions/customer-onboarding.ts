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
  customerAccountCode?: string
  organizationCode?: string
  workspaceCode?: string
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

const PRODUCT_PREFIXES: Record<string, string> = {
  nexora: 'NEX',
  atom: 'ATO',
  aimhighserp: 'AHS',
  maams: 'MAA'
}

const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
function generateRandomSuffix(): string {
  let result = ''
  for (let i = 0; i < 4; i++) {
    const randIndex = Math.floor(Math.random() * ALLOWED_CHARS.length)
    result += ALLOWED_CHARS[randIndex]
  }
  return result
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

    // 1. STRICT SSO ELIGIBILITY CHECK: Exclude PointO and AMAL
    const { data: prod } = await supabase
      .from('lam_products')
      .select('slug, name, identity_mode')
      .eq('slug', productSlug)
      .maybeSingle()

    if (prod && prod.identity_mode !== 'lam_sso') {
      return { error: `Product '${prod.name}' (mode: ${prod.identity_mode}) does not participate in central LAM SSO provisioning. Provisioning refused.` }
    }

    // 2. Check existing identity
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

    // 3. Create or Locate Customer Account (lam_customer_accounts) & CRM Company
    let customerAccount: any = null
    const { data: existingCustAcc } = await supabase
      .from('lam_customer_accounts')
      .select('*')
      .ilike('name', companyName)
      .maybeSingle()

    if (existingCustAcc) {
      customerAccount = existingCustAcc
    } else {
      const custAccCode = `LAM-CA-${Math.floor(100000 + Math.random() * 900000)}`
      const { data: newCustAcc, error: custAccErr } = await supabase
        .from('lam_customer_accounts')
        .insert({
          customer_account_code: custAccCode,
          name: companyName,
          legal_name: legalName,
          status: 'active'
        })
        .select()
        .single()

      if (custAccErr || !newCustAcc) return { error: `Failed to create Customer Account: ${custAccErr?.message}` }
      customerAccount = newCustAcc
    }

    // 4. Create Organization (lam_organizations) & CRM Company link
    let organization: any = null
    const { data: existingOrg } = await supabase
      .from('lam_organizations')
      .select('*')
      .eq('customer_account_id', customerAccount.id)
      .ilike('name', companyName)
      .maybeSingle()

    if (existingOrg) {
      organization = existingOrg
    } else {
      const orgCode = `LAM-ORG-${Math.floor(100000 + Math.random() * 900000)}`
      const { data: newOrg, error: orgErr } = await supabase
        .from('lam_organizations')
        .insert({
          customer_account_id: customerAccount.id,
          organization_code: orgCode,
          name: companyName,
          status: 'active'
        })
        .select()
        .single()

      if (orgErr || !newOrg) return { error: `Failed to create Organization: ${orgErr?.message}` }
      organization = newOrg
    }

    // Create / Update CRM Company
    let company: any = null
    const { data: existingCompany } = await supabase
      .from('crm_companies')
      .select('*')
      .ilike('name', companyName)
      .maybeSingle()

    if (existingCompany) {
      const { data: updatedComp } = await supabase
        .from('crm_companies')
        .update({
          customer_account_id: customerAccount.id,
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
      company = updatedComp
    } else {
      const companyIdCode = `COMP-${Math.floor(100000 + Math.random() * 900000)}`
      const { data: newComp, error: compErr } = await supabase
        .from('crm_companies')
        .insert({
          customer_account_id: customerAccount.id,
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

    // 5. Create Product Workspace (lam_product_workspaces)
    const prefix = PRODUCT_PREFIXES[productSlug] || productSlug.substring(0, 3).toUpperCase()
    const workspaceCode = `${prefix}${generateRandomSuffix()}`

    const { data: workspace, error: wsErr } = await supabase
      .from('lam_product_workspaces')
      .insert({
        customer_account_id: customerAccount.id,
        organization_id: organization.id,
        product_slug: productSlug,
        workspace_code: workspaceCode,
        plan_tier: planTier,
        max_seats: maxSeats,
        status: 'active'
      })
      .select()
      .single()

    if (wsErr || !workspace) {
      return { error: `Failed to create product workspace: ${wsErr?.message}` }
    }

    // 6. Product Entitlement (Company level)
    let expiresAt: string | null = null
    if (expiresDays && expiresDays > 0) {
      expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()
    }

    await supabase
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

    // 7. Identity & Auth Provisioning
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
      if (provisionMode === 'password') {
        if (!initialPassword || initialPassword.length < 8) {
          initialPassword = `LAM-Init-${Math.floor(100000 + Math.random() * 900000)}!`
        }

        const { data: newAuth, error: authErr } = await supabase.auth.admin.createUser({
          email: ownerEmail,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            first_name: ownerFirstName,
            last_name: ownerLastName,
            role: 'customer_owner',
            must_change_password: false
          }
        })

        if (authErr || !newAuth.user) {
          return { error: `Failed to create Auth user: ${authErr?.message}` }
        }
        authUserId = newAuth.user.id
      }

      const { data: newIdentity, error: idErr } = await supabase
        .from('customer_identities')
        .insert({
          auth_user_id: authUserId,
          email: ownerEmail,
          first_name: ownerFirstName,
          last_name: ownerLastName,
          status: 'active',
          must_change_password: false
        })
        .select()
        .single()

      if (idErr || !newIdentity) {
        return { error: `Failed to create customer identity: ${idErr?.message}` }
      }
      customerId = newIdentity.id
    }

    // 8. Memberships Assignment
    await supabase.from('customer_company_memberships').upsert(
      {
        customer_id: customerId,
        company_id: company.id,
        company_role: 'owner',
        status: 'active'
      },
      { onConflict: 'customer_id,company_id' }
    )

    await supabase.from('lam_workspace_memberships').upsert(
      {
        workspace_id: workspace.id,
        customer_id: customerId,
        user_id: ownerFirstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'owner',
        workspace_role: 'owner',
        status: 'active'
      },
      { onConflict: 'workspace_id,customer_id' }
    )

    await supabase.from('customer_product_access').upsert(
      {
        customer_id: customerId,
        company_id: company.id,
        product_slug: productSlug,
        status: 'active'
      },
      { onConflict: 'customer_id,company_id,product_slug' }
    )

    // 9. Inter-Service Provisioning Notice & Instance Linking
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
      const prodBaseUrl = `https://${productSlug}.lubbalmandumah.com`
      await supabase.from('customer_product_instances').insert({
        company_id: company.id,
        product_slug: productSlug,
        instance_key: `tenant_${company.id.slice(0, 8)}`,
        environment: 'production',
        instance_url: prodBaseUrl,
        status: 'active'
      })
    }

    // 10. Setup / Invitation Link Generation
    let inviteUrl = ''
    const inviteToken = 'inv_' + crypto.randomUUID().replace(/-/g, '')
    const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex')
    const inviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

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
      customerAccountCode: customerAccount.customer_account_code,
      organizationCode: organization.organization_code,
      workspaceCode: workspace.workspace_code,
      ownerEmail,
      provisionMode,
      isExistingIdentity,
      productSlug,
      maxSeats
    })

    try {
      revalidatePath('/control-panel/modules/ecosystem')
      revalidatePath('/control-panel/modules/ecosystem/companies')
      revalidatePath(`/control-panel/modules/ecosystem/companies/${company.id}`)
      revalidatePath('/control-panel/clients')
    } catch (err) {
      // Ignore revalidatePath when running in standalone test scripts
    }

    return {
      success: true,
      companyId: company.id,
      companyName: company.name,
      customerAccountCode: customerAccount.customer_account_code,
      organizationCode: organization.organization_code,
      workspaceCode: workspace.workspace_code,
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
      .update({ status: newCompanyStatus === 'Active' ? 'active' : 'suspended' })
      .eq('company_id', companyId)

    await supabase
      .from('lam_product_workspaces')
      .update({ status: newCompanyStatus === 'Active' ? 'active' : 'suspended' })
      .eq('customer_account_id', companyId)

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
