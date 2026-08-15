"use server"

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { notifyNexoraProvisioning } from '@/lib/sso/nexora-client'
import crypto from 'crypto'

export type OnboardingActionState = {
  success?: boolean
  error?: string
  companyId?: string
  companyName?: string
  inviteUrl?: string
  provisionMode?: string
  message?: string
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

    const provisionMode = (formData.get('provision_mode') as string)?.trim() || 'invite'
    const initialPassword = (formData.get('initial_password') as string)?.trim()

    if (!companyName || !ownerFirstName || !ownerEmail) {
      return { error: 'Company Name, Owner First Name, and Owner Email are required.' }
    }

    if (provisionMode === 'password' && (!initialPassword || initialPassword.length < 8)) {
      return { error: 'Initial temporary password must be at least 8 characters long.' }
    }

    const supabase = getSupabaseAdmin()

    // 1. Create or Locate Existing Company in crm_companies (Prevent duplicates)
    let company: any = null
    const { data: existingCompany } = await supabase
      .from('crm_companies')
      .select('*')
      .ilike('name', companyName)
      .maybeSingle()

    if (existingCompany) {
      // Reuse existing company & update status/details
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

      if (updateErr) {
        return { error: `Failed to update existing company record: ${updateErr.message}` }
      }
      company = updatedComp
    } else {
      // Insert new company
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

      if (compErr || !newComp) {
        return { error: `Failed to create company: ${compErr?.message}` }
      }
      company = newComp
    }

    // 2. Assign/Upsert Product Entitlement (Prevent duplicate entitlement rows for same company + product)
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

    if (entErr) {
      return { error: `Failed to create/update product entitlement: ${entErr.message}` }
    }

    // 3. Create or Link Primary Customer Owner
    let authUserId: string | null = null

    if (provisionMode === 'password' && initialPassword) {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: ownerEmail,
        password: initialPassword,
        email_confirm: true,
        user_metadata: {
          first_name: ownerFirstName,
          last_name: ownerLastName,
          role: 'customer_owner'
        }
      })
      if (authUser?.user) {
        authUserId = authUser.user.id
      } else if (authErr) {
        const { data: usersList } = await supabase.auth.admin.listUsers()
        const existingAuth = usersList.users.find(u => u.email?.toLowerCase() === ownerEmail)
        if (existingAuth) {
          authUserId = existingAuth.id
          await supabase.auth.admin.updateUserById(authUserId, { password: initialPassword })
        }
      }
    }

    let customerId: string
    const { data: existingIdentity } = await supabase
      .from('customer_identities')
      .select('id')
      .eq('email', ownerEmail)
      .maybeSingle()

    if (existingIdentity) {
      customerId = existingIdentity.id
    } else {
      const { data: newIdentity, error: idErr } = await supabase
        .from('customer_identities')
        .insert({
          auth_user_id: authUserId,
          email: ownerEmail,
          first_name: ownerFirstName,
          last_name: ownerLastName,
          status: 'active'
        })
        .select()
        .single()

      if (idErr || !newIdentity) {
        return { error: `Failed to create customer identity: ${idErr?.message}` }
      }
      customerId = newIdentity.id
    }

    await supabase.from('customer_company_memberships').upsert({
      customer_id: customerId,
      company_id: company.id,
      company_role: 'owner',
      status: 'active'
    }, { onConflict: 'customer_id,company_id' })

    // 4. Grant Explicit User Product Access
    await supabase.from('customer_product_access').upsert({
      customer_id: customerId,
      company_id: company.id,
      product_slug: productSlug,
      status: 'active'
    }, { onConflict: 'customer_id,company_id,product_slug' })

    // 5. Trigger Provisioning via Inter-Service Client
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

    // 6. Generate Customer Invitation Token
    const inviteToken = 'inv_' + crypto.randomUUID().replace(/-/g, '')
    const inviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    await supabase.from('customer_invitations').insert({
      token: inviteToken,
      company_id: company.id,
      email: ownerEmail,
      role: 'owner',
      product_slugs: [productSlug],
      expires_at: inviteExpiresAt,
      status: provisionMode === 'password' ? 'accepted' : 'pending'
    })

    const appBaseUrl = process.env.LAM_ID_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://id.lubbalmandumah.com'
    const inviteUrl = `${appBaseUrl}/id/invite/${inviteToken}`

    revalidatePath('/control-panel/modules/ecosystem')
    revalidatePath('/control-panel/modules/ecosystem/companies')
    revalidatePath('/control-panel/modules/ecosystem/entitlements')
    revalidatePath('/control-panel/modules/leads-clients/companies')

    return {
      success: true,
      companyId: company.id,
      companyName: company.name,
      inviteUrl,
      provisionMode,
      message: `Successfully onboarded ${companyName} (${companyType.toUpperCase()})!`
    }
  } catch (err: any) {
    return { error: err.message || 'Customer onboarding action failed.' }
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
    revalidatePath('/control-panel/modules/ecosystem/entitlements')
    revalidatePath(`/control-panel/modules/leads-clients/companies/${companyId}`)

    return { success: true, newStatus: newCompanyStatus }
  } catch (err: any) {
    return { error: err.message || 'Failed to update company status' }
  }
}
