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

async function checkColumns() {
  console.log("Checking customer_identities columns...")
  const { data: idData, error: idErr } = await supabase
    .from('customer_identities')
    .select('*')
    .limit(1)

  console.log("customer_identities row sample keys:", idData?.[0] ? Object.keys(idData[0]) : [], idErr)

  console.log("Checking customer_invitations columns...")
  const { data: invData, error: invErr } = await supabase
    .from('customer_invitations')
    .select('*')
    .limit(1)

  console.log("customer_invitations row sample keys:", invData?.[0] ? Object.keys(invData[0]) : [], invErr)
}

checkColumns().catch(console.error)
