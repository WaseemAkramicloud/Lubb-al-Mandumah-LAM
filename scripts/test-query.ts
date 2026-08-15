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

async function testCustomerQuery() {
  const email = "waazimrana@gmail.com"
  const authUserId = "fffe0026-89e5-429b-a973-2608cb4b3046"

  console.log("Testing .or() query with maybeSingle():")
  const res1 = await supabase
    .from('customer_identities')
    .select('*')
    .or(`auth_user_id.eq.${authUserId},email.eq.${email}`)
    .maybeSingle()

  console.log("res1:", res1)

  console.log("Testing .or() query with select():")
  const res2 = await supabase
    .from('customer_identities')
    .select('*')
    .or(`auth_user_id.eq.${authUserId},email.eq.${email}`)

  console.log("res2:", res2)

  console.log("Testing query by auth_user_id:")
  const res3 = await supabase
    .from('customer_identities')
    .select('*')
    .eq('auth_user_id', authUserId)

  console.log("res3:", res3)

  console.log("Testing query by email:")
  const res4 = await supabase
    .from('customer_identities')
    .select('*')
    .eq('email', email)

  console.log("res4:", res4)
}

testCustomerQuery().catch(console.error)
