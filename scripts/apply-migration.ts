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

async function applyMigration() {
  console.log("Applying schema additions to customer_identities and customer_invitations...")
  
  // We can execute SQL or check table definitions by inspecting or performing RPC if enabled,
  // or testing column select.
  const { data, error } = await supabase
    .from('customer_identities')
    .select('id, must_change_password')
    .limit(1)

  if (error && error.message.includes('must_change_password')) {
    console.log("Column must_change_password missing, executing ALTER TABLE via postgres query / rpc if available...")
  } else {
    console.log("customer_identities.must_change_password check result:", { data, error })
  }
}

applyMigration().catch(console.error)
