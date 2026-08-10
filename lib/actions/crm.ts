'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { logAudit } from './audit'

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

export async function convertToClient(leadId: string) {
  await requirePermission('leads_clients', 'create') // Assuming convert requires create permission
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch the lead
  const { data: lead, error: fetchError } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', leadId)
    .single()
    
  if (fetchError || !lead) throw new Error(fetchError?.message || 'Lead not found')

  // 2. Create the client record
  const clientData = {
    lead_id: lead.id,
    organization_name: lead.company || lead.contact_person,
    contact_name: lead.contact_person,
    email: lead.email,
    phone: lead.phone,
    related_products: lead.interested_product ? [lead.interested_product] : [],
    relationship_owner: lead.assigned_to,
    notes: lead.internal_notes
  }

  const { data: client, error: clientError } = await supabase
    .from('crm_clients')
    .insert([clientData])
    .select('id')
    .single()
    
  if (clientError) throw new Error(clientError.message)

  // 3. Update lead status to Converted
  await updateLeadStatus(leadId, 'Converted')

  await supabase.from('crm_audit_logs').insert({
    lead_id: leadId,
    action_type: 'converted',
    action_details: { client_id: client.id },
    performed_by: user?.id
  })

  await logAudit('crm_lead', leadId, 'converted', { client_id: client.id })

  revalidatePath('/control-panel/modules/leads-clients')
  revalidatePath(`/control-panel/modules/leads-clients/${leadId}`)
  revalidatePath('/control-panel/modules/leads-clients/clients')
  
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
