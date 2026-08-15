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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function getAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function diagnosePurembil() {
  console.log("=== PART 1 & 4 — AUTHENTICATED USER & AUTH UUID LINK VERIFICATION ===")
  const admin = getAdminClient()
  const email = "ayesha@purembil.com"

  const { data: usersList } = await admin.auth.admin.listUsers()
  const authUser = usersList?.users?.find(u => u.email?.toLowerCase() === email)

  console.log("Auth User Record:", {
    found: !!authUser,
    auth_user_id: authUser?.id,
    email: authUser?.email,
    user_metadata: authUser?.user_metadata
  })

  const { data: customerAdmin, error: adminErr } = await admin
    .from('customer_identities')
    .select('*')
    .ilike('email', email)

  console.log("\nAdmin (Service Role) Lookup Result for customer_identities:", {
    rowCount: customerAdmin?.length || 0,
    rows: customerAdmin,
    error: adminErr
  })

  if (customerAdmin && customerAdmin.length > 0) {
    const cust = customerAdmin[0]
    console.log("UUID Comparison:", {
      authUser_id: authUser?.id,
      customer_auth_user_id: cust.auth_user_id,
      matches: authUser?.id === cust.auth_user_id
    })
  }

  console.log("\n=== PART 2 & 3 — RLS & CLIENT CONTEXT ACCESS DIAGNOSIS ===")

  const anon = getAnonClient()
  const { data: anonQueryA, error: anonErrA } = await anon
    .from('customer_identities')
    .select('id, auth_user_id, email, status')
    .eq('auth_user_id', authUser?.id || '')

  console.log("Anon Client Query A (by auth_user_id):", {
    rowCount: anonQueryA?.length || 0,
    data: anonQueryA,
    error: anonErrA
  })

  const { data: anonQueryB, error: anonErrB } = await anon
    .from('customer_identities')
    .select('id, auth_user_id, email, status')
    .ilike('email', email)

  console.log("Anon Client Query B (by ilike email):", {
    rowCount: anonQueryB?.length || 0,
    data: anonQueryB,
    error: anonErrB
  })

  console.log("\n=== PART 5 — SUPABASE PROJECT REFERENCE CHECK ===")
  console.log("Configured NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("Project Reference Extracted:", process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.*?)\.supabase\.co/)?.[1])
}

diagnosePurembil().catch(console.error)
