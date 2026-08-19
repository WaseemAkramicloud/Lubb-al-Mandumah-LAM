import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim()
        let val = trimmed.substring(idx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        process.env[key] = val
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ykrjmctfmywhymgpkqlu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function audit() {
  console.log('--- STAGE B PRE-MIGRATION DATABASE AUDIT ---')

  const { data: companies, error: compErr } = await supabase.from('crm_companies').select('*')
  console.log(`crm_companies count: ${companies?.length || 0}`, compErr ? `(Error: ${compErr.message})` : '')
  if (companies && companies.length > 0) {
    console.log('Companies sample:', companies.map(c => ({ id: c.id, company_id: c.company_id, name: c.name, status: c.status })))
  }

  const { data: clients, error: clientErr } = await supabase.from('crm_clients').select('*')
  console.log(`crm_clients count: ${clients?.length || 0}`, clientErr ? `(Error: ${clientErr.message})` : '')

  const { data: identities, error: idErr } = await supabase.from('customer_identities').select('*')
  console.log(`customer_identities count: ${identities?.length || 0}`, idErr ? `(Error: ${idErr.message})` : '')
  if (identities && identities.length > 0) {
    console.log('Identities sample:', identities.map(i => ({ id: i.id, email: i.email, auth_user_id: i.auth_user_id, status: i.status })))
  }

  const { data: memberships, error: memErr } = await supabase.from('customer_company_memberships').select('*')
  console.log(`customer_company_memberships count: ${memberships?.length || 0}`, memErr ? `(Error: ${memErr.message})` : '')

  const { data: entitlements, error: entErr } = await supabase.from('customer_product_entitlements').select('*')
  console.log(`customer_product_entitlements count: ${entitlements?.length || 0}`, entErr ? `(Error: ${entErr.message})` : '')
  if (entitlements && entitlements.length > 0) {
    console.log('Entitlements sample:', entitlements.map(e => ({ id: e.id, company_id: e.company_id, product_slug: e.product_slug, plan_tier: e.plan_tier, status: e.status })))
  }

  const { data: accessGrants, error: accErr } = await supabase.from('customer_product_access').select('*')
  console.log(`customer_product_access count: ${accessGrants?.length || 0}`, accErr ? `(Error: ${accErr.message})` : '')

  const { data: instances, error: instErr } = await supabase.from('customer_product_instances').select('*')
  console.log(`customer_product_instances count: ${instances?.length || 0}`, instErr ? `(Error: ${instErr.message})` : '')

  const { data: products, error: prodErr } = await supabase.from('cms_products').select('slug, name, product_id, category, status')
  console.log(`cms_products count: ${products?.length || 0}`, prodErr ? `(Error: ${prodErr.message})` : '')
  if (products && products.length > 0) {
    console.log('Products:', products)
  }

  // Check for orphan records
  if (memberships && memberships.length > 0) {
    const validCompanyIds = new Set((companies || []).map(c => c.id))
    const validCustomerIds = new Set((identities || []).map(i => i.id))
    const orphanMemberships = memberships.filter(m => !validCompanyIds.has(m.company_id) || !validCustomerIds.has(m.customer_id))
    console.log(`Orphan memberships count: ${orphanMemberships.length}`)
  }

  if (entitlements && entitlements.length > 0) {
    const validCompanyIds = new Set((companies || []).map(c => c.id))
    const orphanEntitlements = entitlements.filter(e => !validCompanyIds.has(e.company_id))
    console.log(`Orphan entitlements count: ${orphanEntitlements.length}`)
  }
}

audit().catch(console.error)
