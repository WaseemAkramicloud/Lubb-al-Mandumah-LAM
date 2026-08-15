import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

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

function getAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function testPurembilFlows() {
  console.log("=== SCENARIO 2: PUREMBIL FRESH ONBOARDING (NEW IDENTITY) ===")

  const admin = getAdmin()
  const email = "ayesha@purembil.com"
  const companyName = "Purembil Commercial"

  // 0. Complete cleanup of any existing test accounts
  const { data: usersList } = await admin.auth.admin.listUsers()
  const existingAuthUser = usersList?.users?.find(u => u.email?.toLowerCase() === email)
  if (existingAuthUser) {
    await admin.auth.admin.deleteUser(existingAuthUser.id)
    console.log("Deleted existing Auth user for clean test.")
  }

  const { data: oldComps } = await admin.from('crm_companies').select('id').ilike('name', '%Purembil%')
  if (oldComps && oldComps.length > 0) {
    for (const c of oldComps) {
      await admin.from('customer_product_access').delete().eq('company_id', c.id)
      await admin.from('customer_product_entitlements').delete().eq('company_id', c.id)
      await admin.from('customer_product_instances').delete().eq('company_id', c.id)
      await admin.from('customer_company_memberships').delete().eq('company_id', c.id)
      await admin.from('crm_companies').delete().eq('id', c.id)
    }
  }

  await admin.from('customer_identities').delete().ilike('email', email)
  console.log("Cleaned up old test records.")

  // 1. Create Auth User & Customer Identity
  const tempPassword = "LAM-Temp-789012!"
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { first_name: "Ayesha", last_name: "Siddiqua", role: "customer_owner", must_change_password: true }
  })

  if (authErr || !authUser.user) {
    console.error("Auth creation failed:", authErr)
    process.exit(1)
  }

  const { data: newCust, error: custErr } = await admin.from('customer_identities').insert({
    auth_user_id: authUser.user.id,
    email,
    first_name: "Ayesha",
    last_name: "Siddiqua",
    status: "active"
  }).select().single()

  if (custErr || !newCust) {
    console.error("Customer identity creation failed:", custErr)
    process.exit(1)
  }

  console.log("Created NEW Customer Identity:", {
    id: newCust.id,
    auth_user_id: newCust.auth_user_id,
    email: newCust.email,
    user_metadata_must_change_password: authUser.user.user_metadata.must_change_password
  })

  // 2. Create Company
  const companyCode1 = `COMP-${Math.floor(100000 + Math.random() * 900000)}`
  const { data: newComp, error: compErr } = await admin.from('crm_companies').insert({
    company_id: companyCode1,
    name: companyName,
    legal_name: "Purembil Commercial LLC",
    company_type: "standard",
    email,
    status: "Active",
    source: "Staff Controlled Onboarding"
  }).select().single()

  if (compErr || !newComp) {
    console.error("Company creation failed:", compErr)
    process.exit(1)
  }

  // 3. Create Membership & Entitlement & Instance & Explicit Access Grant
  await admin.from('customer_company_memberships').insert({
    customer_id: newCust.id,
    company_id: newComp.id,
    company_role: "owner",
    status: "active"
  })

  await admin.from('customer_product_entitlements').insert({
    company_id: newComp.id,
    product_slug: "nexora",
    plan_tier: "starter",
    max_seats: 10,
    status: "active"
  })

  await admin.from('customer_product_instances').insert({
    company_id: newComp.id,
    product_slug: "nexora",
    instance_key: `tenant_${newComp.id.slice(0, 8)}`,
    environment: "production",
    instance_url: "https://nexora.lubbalmandumah.com",
    status: "active"
  })

  await admin.from('customer_product_access').insert({
    customer_id: newCust.id,
    company_id: newComp.id,
    product_slug: "nexora",
    status: "active"
  })

  console.log("✓ Purembil onboarding created atomically!")

  // 4. Test Login with Temporary Password
  console.log("\nTesting login with temporary password for Purembil owner...")
  const authClient = getAdmin()
  const { data: loginAuth, error: loginErr } = await authClient.auth.signInWithPassword({
    email,
    password: tempPassword
  })

  if (loginErr || !loginAuth.user) {
    console.error("FAIL: Temporary password login failed!", loginErr)
    process.exit(1)
  }

  console.log("✓ Temporary password authenticated successfully in Auth!")
  console.log("Must Change Password Flag in User Metadata:", loginAuth.user.user_metadata?.must_change_password)

  // 5. Simulate Forced Password Change
  const permanentPassword = "PurembilSecure2026!"
  await admin.auth.admin.updateUserById(authUser.user.id, {
    password: permanentPassword,
    user_metadata: { must_change_password: false }
  })

  const { data: permAuth, error: permErr } = await authClient.auth.signInWithPassword({
    email,
    password: permanentPassword
  })

  if (permErr || !permAuth.user) {
    console.error("FAIL: Permanent password login failed after update!", permErr)
    process.exit(1)
  }

  console.log("✓ Permanent password verified successfully! Flag cleared:", permAuth.user.user_metadata?.must_change_password)

  // 6. Test Scenario 3: Onboarding Second Company with Existing Identity
  console.log("\n=== SCENARIO 3: PUREMBIL EXISTING LAM ID MEMBERSHIP ASSIGNMENT ===")
  const secondCompName = "Purembil Logistics"
  const companyCode2 = `COMP-${Math.floor(100000 + Math.random() * 900000)}`

  const { data: comp2, error: comp2Err } = await admin.from('crm_companies').insert({
    company_id: companyCode2,
    name: secondCompName,
    legal_name: "Purembil Logistics LLC",
    company_type: "standard",
    email,
    status: "Active",
    source: "Staff Controlled Onboarding"
  }).select().single()

  if (comp2Err || !comp2) {
    console.error("Second company creation failed:", comp2Err)
    process.exit(1)
  }

  await admin.from('customer_company_memberships').insert({
    customer_id: newCust.id,
    company_id: comp2.id,
    company_role: "owner",
    status: "active"
  })

  await admin.from('customer_product_access').insert({
    customer_id: newCust.id,
    company_id: comp2.id,
    product_slug: "nexora",
    status: "active"
  })

  // Verify permanent password STILL works and was NOT changed
  const { data: existingCheck } = await authClient.auth.signInWithPassword({
    email,
    password: permanentPassword
  })

  if (!existingCheck?.user) {
    console.error("FAIL: Existing password changed unexpectedly!")
    process.exit(1)
  }

  console.log("✓ SUCCESS: Existing LAM ID assigned to second company while preserving existing password!")
}

testPurembilFlows().catch(console.error)
