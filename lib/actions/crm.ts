'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from './audit'

// ============================================================================
// LEAD MANAGEMENT
// ============================================================================

export async function updateLeadStatus(leadId: string, newStatus: string) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('crm_leads')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    
  if (error) throw new Error(error.message)

  await supabase.from('crm_audit_logs').insert({
    lead_id: leadId,
    action_type: 'status_change',
    action_details: { new_status: newStatus },
    performed_by: user?.id
  })

  await logAudit('crm_lead', leadId, 'status_change', { new_status: newStatus })

  revalidatePath('/control-panel/modules/leads-clients')
  revalidatePath(`/control-panel/modules/leads-clients/${leadId}`)
  return { success: true }
}

export async function assignLead(leadId: string, assigneeId: string | null) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('crm_leads')
    .update({ assigned_to: assigneeId, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    
  if (error) throw new Error(error.message)

  await supabase.from('crm_audit_logs').insert({
    lead_id: leadId,
    action_type: 'assigned',
    action_details: { assigned_to: assigneeId },
    performed_by: user?.id
  })

  await logAudit('crm_lead', leadId, 'assigned', { assigned_to: assigneeId })

  revalidatePath('/control-panel/modules/leads-clients')
  revalidatePath(`/control-panel/modules/leads-clients/${leadId}`)
  return { success: true }
}

export async function updateInternalNotes(leadId: string, notes: string) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('crm_leads')
    .update({ internal_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    
  if (error) throw new Error(error.message)

  revalidatePath(`/control-panel/modules/leads-clients/${leadId}`)
  return { success: true }
}

export async function convertToClient(leadId: string, existingCompanyId?: string) {
  await requirePermission('leads_clients', 'create')
  const supabase = await createClient()
  const adminClient = getSupabaseAdmin()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch the lead
  const { data: lead, error: fetchError } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', leadId)
    .single()
    
  if (fetchError || !lead) throw new Error(fetchError?.message || 'Lead not found')

  let companyId = existingCompanyId || null

  // 2. Check for existing company by name (if no explicit company provided)
  if (!companyId && lead.company) {
    const { data: existingCompany } = await adminClient
      .from('crm_companies')
      .select('id')
      .ilike('name', lead.company)
      .limit(1)
      .single()
    
    if (existingCompany) {
      companyId = existingCompany.id
    }
  }

  // 3. Create company if none found
  if (!companyId) {
    const companyName = lead.company || lead.contact_person
    // Generate company_id
    const { data: seqResult } = await adminClient.rpc('nextval', { seq_name: 'crm_company_id_seq' }).single()
    const companyIdCode = 'LAM-C-' + String(seqResult || Date.now()).padStart(6, '0')

    const { data: newCompany, error: companyError } = await adminClient
      .from('crm_companies')
      .insert({
        company_id: companyIdCode,
        name: companyName,
        email: lead.email,
        phone: lead.phone,
        country: lead.country,
        status: 'Active',
        source: lead.source_type === 'demo' ? 'Demo Request' : 'Contact Form',
        assigned_staff: lead.assigned_to,
        notes: `Company created from lead conversion.`
      })
      .select('id')
      .single()

    if (companyError) throw new Error(companyError.message)
    companyId = newCompany.id
  }

  // 4. Create contact record from lead info
  const nameParts = lead.contact_person?.split(' ') || ['']
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Check if contact already exists for this company+email
  const { data: existingContact } = await adminClient
    .from('crm_contacts')
    .select('id')
    .eq('company_id', companyId)
    .eq('email', lead.email)
    .limit(1)
    .single()

  if (!existingContact) {
    await adminClient.from('crm_contacts').insert({
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
      email: lead.email,
      phone: lead.phone,
      notes: 'Contact created during lead-to-client conversion.'
    })
  }

  // 5. Add product interest to company if product_slug is set
  const productSlug = lead.product_slug || null
  if (productSlug && companyId) {
    await adminClient.from('crm_company_products').insert({
      company_id: companyId,
      product_slug: productSlug,
      interest_type: 'Active Client'
    }).select().maybeSingle() // ignore conflict
  }

  // 6. Create the client record (linked to company)
  const clientData = {
    lead_id: lead.id,
    organization_name: lead.company || lead.contact_person,
    contact_name: lead.contact_person,
    email: lead.email,
    phone: lead.phone,
    related_products: lead.product_slug ? [lead.product_slug] : (lead.interested_product ? [lead.interested_product] : []),
    relationship_owner: lead.assigned_to,
    notes: lead.internal_notes,
    company_id: companyId
  }

  const { data: client, error: clientError } = await supabase
    .from('crm_clients')
    .insert([clientData])
    .select('id')
    .single()
    
  if (clientError) throw new Error(clientError.message)

  // 7. Update lead status to Converted and link to company
  await supabase
    .from('crm_leads')
    .update({ 
      status: 'Converted', 
      company_id: companyId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)

  await supabase.from('crm_audit_logs').insert({
    lead_id: leadId,
    action_type: 'converted',
    action_details: { client_id: client.id, company_id: companyId },
    performed_by: user?.id
  })

  await logAudit('crm_lead', leadId, 'converted', { client_id: client.id, company_id: companyId })

  revalidatePath('/control-panel/modules/leads-clients')
  revalidatePath(`/control-panel/modules/leads-clients/${leadId}`)
  revalidatePath('/control-panel/modules/leads-clients/clients')
  revalidatePath('/control-panel/modules/leads-clients/companies')
  
  return { success: true, clientId: client.id }
}

export async function deleteLead(leadId: string) {
  await requirePermission('leads_clients', 'delete')
  const supabase = await createClient()
  
  const { error } = await supabase.from('crm_leads').delete().eq('id', leadId)
  if (error) throw new Error(error.message)

  await logAudit('crm_lead', leadId, 'delete', {})

  revalidatePath('/control-panel/modules/leads-clients')
  return { success: true }
}

export async function updateClientNotes(clientId: string, notes: string) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('crm_clients')
    .update({ notes: notes, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    
  if (error) throw new Error(error.message)

  revalidatePath(`/control-panel/modules/leads-clients/clients/${clientId}`)
  return { success: true }
}

// ============================================================================
// COMPANY MANAGEMENT
// ============================================================================

export async function createCompany(formData: FormData) {
  await requirePermission('leads_clients', 'create')
  const adminClient = getSupabaseAdmin()

  // Generate company_id
  const { data: seqResult } = await adminClient.rpc('nextval', { seq_name: 'crm_company_id_seq' }).single()
  const companyIdCode = 'LAM-C-' + String(seqResult || Date.now()).padStart(6, '0')

  const payload = {
    company_id: companyIdCode,
    name: formData.get('name') as string,
    legal_name: formData.get('legal_name') || null,
    country: formData.get('country') || null,
    city: formData.get('city') || null,
    website: formData.get('website') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    status: formData.get('status') || 'Prospect',
    source: formData.get('source') || null,
    assigned_staff: formData.get('assigned_staff') || null,
    notes: formData.get('notes') || null,
  }

  const { data, error } = await adminClient
    .from('crm_companies')
    .insert([payload])
    .select('id')
    .single()
    
  if (error) throw new Error(error.message)

  await logAudit('crm_company', data.id, 'created', { name: payload.name })

  revalidatePath('/control-panel/modules/leads-clients/companies')
  return { success: true, companyId: data.id }
}

export async function updateCompany(companyId: string, formData: FormData) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()

  const payload = {
    name: formData.get('name') as string,
    legal_name: formData.get('legal_name') || null,
    country: formData.get('country') || null,
    city: formData.get('city') || null,
    website: formData.get('website') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    status: formData.get('status') || 'Prospect',
    source: formData.get('source') || null,
    assigned_staff: formData.get('assigned_staff') || null,
    notes: formData.get('notes') || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('crm_companies')
    .update(payload)
    .eq('id', companyId)
    
  if (error) throw new Error(error.message)

  await logAudit('crm_company', companyId, 'updated', { name: payload.name })

  revalidatePath('/control-panel/modules/leads-clients/companies')
  revalidatePath(`/control-panel/modules/leads-clients/companies/${companyId}`)
  return { success: true }
}

// ============================================================================
// CONTACT MANAGEMENT
// ============================================================================

export async function createContact(formData: FormData) {
  await requirePermission('leads_clients', 'create')
  const supabase = await createClient()

  const payload = {
    company_id: formData.get('company_id') as string,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') || null,
    job_title: formData.get('job_title') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    preferred_contact: formData.get('preferred_contact') || 'Email',
    notes: formData.get('notes') || null,
  }

  const { error } = await supabase
    .from('crm_contacts')
    .insert([payload])

  if (error) throw new Error(error.message)

  await logAudit('crm_contact', payload.company_id, 'contact_added', { name: `${payload.first_name} ${payload.last_name || ''}`.trim() })

  revalidatePath(`/control-panel/modules/leads-clients/companies/${payload.company_id}`)
  return { success: true }
}

export async function updateContact(contactId: string, formData: FormData) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()

  const payload = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') || null,
    job_title: formData.get('job_title') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    preferred_contact: formData.get('preferred_contact') || 'Email',
    notes: formData.get('notes') || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('crm_contacts')
    .update(payload)
    .eq('id', contactId)

  if (error) throw new Error(error.message)

  const companyId = formData.get('company_id') as string
  revalidatePath(`/control-panel/modules/leads-clients/companies/${companyId}`)
  return { success: true }
}

// ============================================================================
// COMPANY-PRODUCT INTERESTS
// ============================================================================

export async function addCompanyProductInterest(companyId: string, productSlug: string, interestType: string = 'Interested') {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_company_products')
    .upsert(
      { company_id: companyId, product_slug: productSlug, interest_type: interestType },
      { onConflict: 'company_id,product_slug' }
    )

  if (error) throw new Error(error.message)

  await logAudit('crm_company', companyId, 'product_interest_added', { product_slug: productSlug, interest_type: interestType })

  revalidatePath(`/control-panel/modules/leads-clients/companies/${companyId}`)
  return { success: true }
}

export async function removeCompanyProductInterest(companyId: string, productSlug: string) {
  await requirePermission('leads_clients', 'edit')
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_company_products')
    .delete()
    .eq('company_id', companyId)
    .eq('product_slug', productSlug)

  if (error) throw new Error(error.message)

  await logAudit('crm_company', companyId, 'product_interest_removed', { product_slug: productSlug })

  revalidatePath(`/control-panel/modules/leads-clients/companies/${companyId}`)
  return { success: true }
}
