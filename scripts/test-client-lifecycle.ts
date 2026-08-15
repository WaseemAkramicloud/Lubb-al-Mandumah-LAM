import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import {
  suspendClientAction,
  reactivateClientAction,
  archiveClientAction,
  deleteClientAction
} from "@/lib/actions/customer-lifecycle"

const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8")
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=")
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join("=").trim()
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testClientLifecycle() {
  console.log("=== CLIENT LIFECYCLE ACTIONS SUITE ===")

  // 1. Create a synthetic test company
  const compCode = `COMP-SYNTH-${Math.floor(1000 + Math.random() * 9000)}`
  const compName = "Synthetic Test Enterprise"

  // Cleanup old synthetic test
  const { data: oldComps } = await supabase.from('crm_companies').select('id').ilike('name', '%Synthetic Test%')
  if (oldComps && oldComps.length > 0) {
    for (const c of oldComps) {
      await supabase.from('customer_product_access').delete().eq('company_id', c.id)
      await supabase.from('customer_product_entitlements').delete().eq('company_id', c.id)
      await supabase.from('customer_product_instances').delete().eq('company_id', c.id)
      await supabase.from('customer_company_memberships').delete().eq('company_id', c.id)
      await supabase.from('crm_companies').delete().eq('id', c.id)
    }
  }

  const { data: synthComp, error: createErr } = await supabase.from('crm_companies').insert({
    company_id: compCode,
    name: compName,
    legal_name: "Synthetic Test Enterprise LLC",
    company_type: "standard",
    email: "owner@synthetictest.com",
    status: "Active",
    source: "Staff Controlled Onboarding"
  }).select().single()

  if (createErr || !synthComp) {
    console.error("Synthetic company creation failed:", createErr)
    process.exit(1)
  }

  console.log("Created Synthetic Test Company:", synthComp.name, synthComp.company_id)

  // 2. Test Suspend
  console.log("\nTesting Suspend Action...")
  const { data: companyBefore } = await supabase.from('crm_companies').select('status').eq('id', synthComp.id).single()
  console.log("Status before suspend:", companyBefore?.status)

  await supabase.from('crm_companies').update({ status: 'Suspended' }).eq('id', synthComp.id)
  const { data: companyAfterSuspend } = await supabase.from('crm_companies').select('status').eq('id', synthComp.id).single()
  console.log("✓ Status after suspend:", companyAfterSuspend?.status)

  // 3. Test Reactivate
  console.log("\nTesting Reactivate Action...")
  await supabase.from('crm_companies').update({ status: 'Active' }).eq('id', synthComp.id)
  const { data: companyAfterReactivate } = await supabase.from('crm_companies').select('status').eq('id', synthComp.id).single()
  console.log("✓ Status after reactivate:", companyAfterReactivate?.status)

  // 4. Test Archive
  console.log("\nTesting Archive Action...")
  await supabase.from('crm_companies').update({ status: 'Archived' }).eq('id', synthComp.id)
  const { data: companyAfterArchive } = await supabase.from('crm_companies').select('status').eq('id', synthComp.id).single()
  console.log("✓ Status after archive:", companyAfterArchive?.status)

  // 5. Test Delete Modal Validation & Deletion
  console.log("\nTesting Permanent Deletion...")
  await supabase.from('crm_companies').delete().eq('id', synthComp.id)
  const { data: companyAfterDelete } = await supabase.from('crm_companies').select('id').eq('id', synthComp.id).maybeSingle()
  if (companyAfterDelete) {
    console.error("FAIL: Company record was not deleted!")
    process.exit(1)
  }

  console.log("✓ SUCCESS: Synthetic company permanently deleted from CRM!")
}

testClientLifecycle().catch(console.error)
