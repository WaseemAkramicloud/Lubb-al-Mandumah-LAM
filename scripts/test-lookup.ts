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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testImprovedLookup() {
  const authUserId = "fffe0026-89e5-429b-a973-2608cb4b3046"
  const testEmails = ["waazimrana@gmail.com", "Waazimrana@gmail.com", " WAAZIMRANA@GMAIL.COM "]

  for (const emailRaw of testEmails) {
    const email = emailRaw.trim().toLowerCase()
    console.log(`\n--- Testing lookup for raw input: '${emailRaw}' (normalized: '${email}') ---`)
    
    // Step 1: Query by auth_user_id
    let { data: customer, error } = await supabase
      .from('customer_identities')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (!customer) {
      console.log("Not found by auth_user_id, trying email ilike...")
      const { data: custByEmail } = await supabase
        .from('customer_identities')
        .select('*')
        .ilike('email', email)
        .maybeSingle()

      customer = custByEmail
    }

    console.log("Customer found:", customer ? customer.id : null, "Email:", customer?.email)
  }
}

testImprovedLookup().catch(console.error)
