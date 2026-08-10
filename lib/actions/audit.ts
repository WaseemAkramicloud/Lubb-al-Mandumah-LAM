'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function logAudit(
  entityType: string,
  entityId: string,
  action: string,
  changes: any
) {
  // We use the admin client to ensure we can write audit logs bypassing any restrictive RLS
  // as audit logs are often written when a user performs an action they might not have direct RLS to the audit table for.
  const adminClient = getSupabaseAdmin()
  const supabase = await createClient()
  
  // Get current user doing the action
  const { data: { user } } = await supabase.auth.getUser()

  // Ensure passwords or secrets are stripped from changes
  const sanitizedChanges = { ...changes }
  
  // Strip common sensitive fields
  const sensitiveKeys = ['password', 'secret', 'token', 'key']
  
  const sanitizeObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return
    Object.keys(obj).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        obj[key] = '[REDACTED]'
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key])
      }
    })
  }

  sanitizeObject(sanitizedChanges)

  const { error } = await adminClient.from('audit_logs').insert({
    entity_type: entityType,
    entity_id: entityId,
    action: action,
    changes: sanitizedChanges,
    actor_id: user?.id
  })

  if (error) {
    console.error("Failed to write audit log:", error)
  }
}
