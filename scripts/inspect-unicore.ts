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

async function inspectUnicore() {
  console.log("=== 1. SEARCHING crm_companies FOR UNICORE ===")
  const { data: companies, error: compErr } = await supabase
    .from("crm_companies")
    .select("*")
    .ilike("name", "%unicore%")
  
  console.log("Companies:", companies, compErr)

  if (!companies || companies.length === 0) {
    console.log("No company matching 'unicore' found!")
    return
  }

  const company = companies[0]
  const companyId = company.id

  console.log("\n=== 2. CUSTOMER PRODUCT ENTITLEMENTS ===")
  const { data: entitlements } = await supabase
    .from("customer_product_entitlements")
    .select("*")
    .eq("company_id", companyId)
  console.log("Entitlements:", entitlements)

  console.log("\n=== 3. CUSTOMER PRODUCT INSTANCES ===")
  const { data: instances } = await supabase
    .from("customer_product_instances")
    .select("*")
    .eq("company_id", companyId)
  console.log("Instances:", instances)

  console.log("\n=== 4. COMPANY MEMBERSHIPS ===")
  const { data: memberships } = await supabase
    .from("customer_company_memberships")
    .select("*")
    .eq("company_id", companyId)
  console.log("Memberships:", memberships)

  console.log("\n=== 5. CUSTOMER PRODUCT ACCESS GRANTS ===")
  const { data: accessGrants } = await supabase
    .from("customer_product_access")
    .select("*")
    .eq("company_id", companyId)
  console.log("Access Grants:", accessGrants)

  console.log("\n=== 6. CUSTOMER INVITATIONS ===")
  const { data: invitations } = await supabase
    .from("customer_invitations")
    .select("*")
    .eq("company_id", companyId)
  console.log("Invitations:", invitations)

  console.log("\n=== 7. ALL CUSTOMER IDENTITIES ===")
  const { data: customerIdentities } = await supabase
    .from("customer_identities")
    .select("*")
  console.log("All Customer Identities:", customerIdentities)

  console.log("\n=== 8. SUPABASE AUTH USERS ===")
  const { data: authUsers, error: authListErr } = await supabase.auth.admin.listUsers()
  console.log("Auth Users:", authUsers?.users?.map(u => ({
    id: u.id,
    email: u.email,
    user_metadata: u.user_metadata,
    created_at: u.created_at
  })), authListErr)

  if (company.email) {
    console.log(`\n=== 9. LOOKUP FOR COMPANY EMAIL (${company.email}) ===`)
    const { data: idByEmail } = await supabase
      .from("customer_identities")
      .select("*")
      .ilike("email", company.email)
    console.log("Customer Identities by email:", idByEmail)
  }
}

inspectUnicore().catch(console.error)
