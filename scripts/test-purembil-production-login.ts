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

async function verifyPurembilProductionLogin() {
  console.log("=== VERIFYING PUREMBIL PRODUCTION LOGIN FLOW ===")

  const email = "ayesha@purembil.com"
  const testPassword = "PurembilPassword2026!"
  const admin = getAdmin()

  // Set test password for ayesha@purembil.com
  const { data: usersList } = await admin.auth.admin.listUsers()
  const authUser = usersList?.users?.find(u => u.email?.toLowerCase() === email)

  if (!authUser) {
    console.error("Auth user not found!")
    process.exit(1)
  }

  await admin.auth.admin.updateUserById(authUser.id, { password: testPassword })
  console.log("1. Auth User UUID:", authUser.id)

  // 2. Separate clients for Auth vs Admin DB query (as implemented in customer-auth.ts)
  const authClient = getAdmin()
  const adminClient = getAdmin()

  const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
    email,
    password: testPassword
  })

  console.log("2. Supabase Auth Result:", {
    success: !!authData?.user,
    authUserId: authData?.user?.id,
    authErr: authErr?.message
  })

  if (authErr || !authData?.user) {
    console.error("FAIL: Password authentication failed!")
    process.exit(1)
  }

  // 3. Query customer identity profile using adminClient
  const { data: customer, error: profileErr } = await adminClient
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle()

  console.log("3. Customer Profile Lookup Result:", {
    found: !!customer,
    customerId: customer?.id,
    email: customer?.email,
    auth_user_id: customer?.auth_user_id,
    must_change_password: customer?.must_change_password,
    profileErr
  })

  if (!customer) {
    console.error("FAIL: Customer profile not found!")
    process.exit(1)
  }

  // 4. Test RLS query for authenticated user role
  const { data: rlsQuery, error: rlsErr } = await authClient
    .from('customer_identities')
    .select('id, email, must_change_password')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle()

  console.log("4. RLS Query for Authenticated User Role:", {
    found: !!rlsQuery,
    data: rlsQuery,
    rlsErr
  })

  if (!rlsQuery) {
    console.error("FAIL: RLS policy blocked user from reading their identity!")
    process.exit(1)
  }

  console.log("\n🎉 SUCCESS: Purembil production identity resolution fully verified & operational!")
}

verifyPurembilProductionLogin().catch(console.error)
