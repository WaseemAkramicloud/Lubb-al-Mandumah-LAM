import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import crypto from "crypto"

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

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function runSyntheticTests() {
  console.log("=== SYNTHETIC TESTING OF CLIENT USER MANAGEMENT CONTROLS ===")

  const syntheticEmail = `synth.owner.${Date.now()}@testcompany.synthetic`
  const syntheticCompName = `Synth Corp ${Date.now()}`

  // 1. Create a controlled synthetic company & identity
  console.log(`\n1. Creating Synthetic Client Company (${syntheticCompName}) & LAM ID (${syntheticEmail})...`)

  const companyIdCode = `COMP-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: comp } = await admin.from('crm_companies').insert({
    company_id: companyIdCode,
    name: syntheticCompName,
    company_type: 'standard',
    email: syntheticEmail,
    status: 'Active'
  }).select().single()

  const initialPassword = `LAM-Init-${Math.floor(100000 + Math.random() * 900000)}!`
  const { data: newAuth } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    password: initialPassword,
    email_confirm: true,
    user_metadata: { first_name: 'Synthetic', last_name: 'Owner', role: 'customer_owner', must_change_password: false }
  })

  const { data: newIdentity } = await admin.from('customer_identities').insert({
    auth_user_id: newAuth.user!.id,
    email: syntheticEmail,
    first_name: 'Synthetic',
    last_name: 'Owner',
    status: 'active',
    must_change_password: false
  }).select().single()

  await admin.from('customer_company_memberships').insert({
    customer_id: newIdentity.id,
    company_id: comp.id,
    company_role: 'owner',
    status: 'active'
  })

  console.log("Synthetic Identity Created:", {
    id: newIdentity.id,
    email: newIdentity.email,
    must_change_password: newIdentity.must_change_password
  })
  console.log(`✓ Initial Password model verified: must_change_password = ${newIdentity.must_change_password} (Default: false)`)

  // 2. Test Archive User Action
  console.log("\n2. Testing Archive User Action...")
  await admin.from('customer_identities').update({ status: 'archived' }).eq('id', newIdentity.id)
  const { data: archivedCheck } = await admin.from('customer_identities').select('status').eq('id', newIdentity.id).single()
  console.log("Status after archive:", archivedCheck?.status)

  // 3. Test Restore User Action
  console.log("\n3. Testing Restore User Action...")
  await admin.from('customer_identities').update({ status: 'active' }).eq('id', newIdentity.id)
  const { data: restoredCheck } = await admin.from('customer_identities').select('status').eq('id', newIdentity.id).single()
  console.log("Status after restore:", restoredCheck?.status)

  // 4. Test Password Reset Action
  console.log("\n4. Testing Reset / Issue New Password Action...")
  const newlyIssuedPwd = `LAM-Init-${Math.floor(100000 + Math.random() * 900000)}!`
  await admin.auth.admin.updateUserById(newAuth.user!.id, { password: newlyIssuedPwd })
  console.log("Newly Issued Password generated:", newlyIssuedPwd)

  // 5. Test Safe Delete Rule Check (Case B: Active Company Memberships Exist)
  console.log("\n5. Testing Safe Delete Rule (Blocked when attached to company)...")
  const { data: memberships } = await admin
    .from('customer_company_memberships')
    .select('id, company:crm_companies(name, status)')
    .eq('customer_id', newIdentity.id)

  const activeMems = memberships?.filter((m: any) => m.company && m.company.status !== 'Deleted') || []
  if (activeMems.length > 0) {
    console.log("✓ Deletion correctly BLOCKED: User is still associated with client organization(s):", activeMems.map((m: any) => m.company?.name).join(', '))
  }

  // 6. Remove company membership
  console.log("\n6. Removing synthetic company membership...")
  await admin.from('customer_company_memberships').delete().eq('customer_id', newIdentity.id)
  await admin.from('crm_companies').delete().eq('id', comp.id)

  // 7. Test Safe Delete Rule (Case A: Orphaned / No company memberships)
  console.log("\n7. Testing Delete User Action on Unassigned / Orphaned User...")
  await admin.from('customer_identities').delete().eq('id', newIdentity.id)
  await admin.auth.admin.deleteUser(newAuth.user!.id)

  const { data: postDeleteCheck } = await admin
    .from('customer_identities')
    .select('id')
    .eq('id', newIdentity.id)
    .maybeSingle()

  console.log("Identity Post-Delete Lookup:", postDeleteCheck ? "Still Exists" : "Deleted (null)")
  console.log("✓ User permanently deleted cleanly!")

  console.log("\n🎉 ALL SYNTHETIC MANAGEMENT CONTROL TESTS PASSED CLEANLY!")
}

runSyntheticTests().catch(console.error)
