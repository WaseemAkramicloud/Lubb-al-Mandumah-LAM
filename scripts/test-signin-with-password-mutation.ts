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

async function testMutation() {
  console.log("=== TESTING signInWithPassword MUTATION ON JS CLIENT INSTANCE ===")

  const email = "ayesha@purembil.com"
  const admin = getAdmin()

  // Set a temporary known password for testing authentication mutation
  const tempTestPassword = "TestPassword2026!"
  const { data: usersList } = await admin.auth.admin.listUsers()
  const authUser = usersList?.users?.find(u => u.email?.toLowerCase() === email)

  if (!authUser) {
    console.error("Auth user not found!")
    process.exit(1)
  }

  await admin.auth.admin.updateUserById(authUser.id, { password: tempTestPassword })
  console.log("Updated password for test auth user:", authUser.id)

  // Now create a single shared client instance (like getSupabaseAdmin() in customerLogin)
  const sharedClient = getAdmin()

  // Step 1: signInWithPassword on sharedClient
  const { data: authData, error: authErr } = await sharedClient.auth.signInWithPassword({
    email,
    password: tempTestPassword
  })

  console.log("Auth signInWithPassword Result:", {
    success: !!authData?.user,
    authUserId: authData?.user?.id,
    authErr
  })

  // Step 2: Run Query A on the SAME sharedClient instance right after signInWithPassword
  const { data: queryAMutated, error: errAMutated } = await sharedClient
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authData.user!.id)
    .maybeSingle()

  console.log("\nQuery A on SAME (mutated) sharedClient AFTER signInWithPassword:", {
    found: !!queryAMutated,
    data: queryAMutated,
    error: errAMutated
  })

  // Step 3: Run Query A on a FRESH getAdmin() instance
  const freshAdmin = getAdmin()
  const { data: queryAFresh, error: errAFresh } = await freshAdmin
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authData.user!.id)
    .maybeSingle()

  console.log("\nQuery A on FRESH getAdmin() client instance AFTER signInWithPassword:", {
    found: !!queryAFresh,
    data: queryAFresh,
    error: errAFresh
  })
}

testMutation().catch(console.error)
