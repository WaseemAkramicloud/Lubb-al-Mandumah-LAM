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

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function auditRemainingUsers() {
  console.log("=== READ-ONLY AUDIT OF REMAINING CLIENT USERS ===")

  const { data: identities, error: idErr } = await admin
    .from('customer_identities')
    .select(`
      id, auth_user_id, email, first_name, last_name, status, created_at,
      memberships:customer_company_memberships(
        id, company_id, company_role, status,
        company:crm_companies(id, name, status)
      )
    `)

  if (idErr) {
    console.error("Error fetching identities:", idErr)
    process.exit(1)
  }

  console.log(`Total Customer Identities Found: ${identities?.length || 0}\n`)

  let activeCount = 0
  let archivedCount = 0
  let unassignedCount = 0

  identities?.forEach((cust, idx) => {
    const activeMemberships = cust.memberships?.filter((m: any) => m.company && m.company.status !== 'Deleted') || []
    const isOrphaned = activeMemberships.length === 0

    if (cust.status === 'archived') {
      archivedCount++
    } else if (isOrphaned) {
      unassignedCount++
    } else {
      activeCount++
    }

    console.log(`User #${idx + 1}:`)
    console.log(`  ID: ${cust.id}`)
    console.log(`  Auth UUID: ${cust.auth_user_id}`)
    console.log(`  Email (LAM ID): ${cust.email}`)
    console.log(`  Name: ${cust.first_name} ${cust.last_name || ''}`)
    console.log(`  Identity Status: ${cust.status}`)
    console.log(`  Memberships Count: ${cust.memberships?.length || 0}`)
    console.log(`  Active Companies: ${activeMemberships.map((m: any) => m.company?.name).join(', ') || 'None (Unassigned/Orphaned)'}`)
    console.log(`  Classification: ${cust.status === 'archived' ? 'Archived' : isOrphaned ? 'Unassigned/Orphaned' : 'Active'}`)
    console.log('---')
  })

  console.log(`\nSUMMARY:`)
  console.log(`  Active Users: ${activeCount}`)
  console.log(`  Archived Users: ${archivedCount}`)
  console.log(`  Unassigned / Orphaned Users: ${unassignedCount}`)
}

auditRemainingUsers().catch(console.error)
