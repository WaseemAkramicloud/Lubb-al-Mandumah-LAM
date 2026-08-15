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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function inspectRls() {
  console.log("=== INSPECTING RLS POLICIES ON customer_identities ===")

  const { data: customer } = await supabase.from('customer_identities').select('id, email, auth_user_id').eq('email', 'ayesha@purembil.com').maybeSingle()

  if (!customer) {
    console.log("Purembil record not found.")
    return
  }

  console.log("Purembil Customer Record:", customer)

  const authUserId = customer.auth_user_id
  if (authUserId) {
    const { data: authUserData } = await supabase.auth.admin.getUserById(authUserId)
    console.log("Auth User Email:", authUserData?.user?.email)
  }
}

inspectRls().catch(console.error)
