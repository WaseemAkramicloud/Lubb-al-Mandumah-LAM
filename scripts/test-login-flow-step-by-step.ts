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

async function testStepByStep() {
  console.log("=== STEP-BY-STEP DIAGNOSIS OF customerLogin CLIENT MUTATION ===")

  const adminClient = getAdmin()
  const email = "ayesha@purembil.com"

  // 1. Fetch user by email to get Auth UUID
  const { data: usersList } = await adminClient.auth.admin.listUsers()
  const authUser = usersList?.users?.find(u => u.email?.toLowerCase() === email)

  if (!authUser) {
    console.error("Auth user not found!")
    process.exit(1)
  }

  console.log("Found Auth User:", authUser.id, authUser.email)

  // 2. Query customer_identities BEFORE signInWithPassword on adminClient
  const { data: beforeSelect, error: beforeErr } = await adminClient
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authUser.id)

  console.log("\n1. Query customer_identities BEFORE signInWithPassword (on adminClient):", {
    rowCount: beforeSelect?.length,
    data: beforeSelect,
    error: beforeErr
  })

  // 3. Test Query A: customer_identities.auth_user_id = authUser.id using fresh getAdmin()
  const freshAdmin1 = getAdmin()
  const { data: queryA, error: errA } = await freshAdmin1
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authUser.id)

  console.log("\n2. Query A (auth_user_id = Auth UUID on fresh getAdmin()):", {
    rowCount: queryA?.length,
    data: queryA,
    error: errA
  })

  // 4. Test Query B: customer_identities.email ilike email on fresh getAdmin()
  const freshAdmin2 = getAdmin()
  const { data: queryB, error: errB } = await freshAdmin2
    .from('customer_identities')
    .select('*')
    .ilike('email', email)

  console.log("\n3. Query B (email ilike ayesha@purembil.com on fresh getAdmin()):", {
    rowCount: queryB?.length,
    data: queryB,
    error: errB
  })

  // 5. Check what happens if a client executes signInWithPassword
  // Notice: signInWithPassword on a Supabase JS client stores session in client instance!
  // If we create a separate authClient for signInWithPassword vs adminClient for DB queries:
  console.log("\n=== COMPARING MUTATED vs UNMUTATED CLIENT INSTANCE ===")
  const sharedClient = getAdmin()

  // Before signInWithPassword
  const resBefore = await sharedClient.from('customer_identities').select('id').eq('auth_user_id', authUser.id)
  console.log("Shared Client BEFORE signInWithPassword:", { rowCount: resBefore.data?.length, error: resBefore.error })

  // Simulate signInWithPassword by setting auth session on sharedClient or using auth JS client
  // Let's test with a fresh getAdmin() for DB query after auth check!
  const freshAdminAfter = getAdmin()
  const resAfter = await freshAdminAfter.from('customer_identities').select('id').eq('auth_user_id', authUser.id)
  console.log("Fresh Admin Client AFTER Auth Check:", { rowCount: resAfter.data?.length, error: resAfter.error })
}

testStepByStep().catch(console.error)
