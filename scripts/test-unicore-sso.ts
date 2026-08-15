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

async function validateCustomerAccessDirect(customerId: string, productSlug: string) {
  const { data: customer, error: custError } = await supabase
    .from('customer_identities')
    .select('id, email, first_name, last_name, status')
    .eq('id', customerId)
    .single()

  if (custError || !customer) return { allowed: false, reason: 'Customer identity not found.' }
  if (customer.status !== 'active') return { allowed: false, reason: `Account status is ${customer.status}.` }

  const { data: memberships, error: memError } = await supabase
    .from('customer_company_memberships')
    .select(`
      id, company_role, status, company_id,
      company:crm_companies (id, name, status)
    `)
    .eq('customer_id', customerId)
    .eq('status', 'active')

  if (memError || !memberships || memberships.length === 0) {
    return { allowed: false, reason: 'User does not belong to an active organization.' }
  }

  for (const mem of memberships) {
    const company = mem.company as any
    if (!company || company.status !== 'Active') continue

    const { data: entitlement } = await supabase
      .from('customer_product_entitlements')
      .select('id, status, plan_tier')
      .eq('company_id', company.id)
      .eq('product_slug', productSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (!entitlement) continue

    const { data: explicitAccess } = await supabase
      .from('customer_product_access')
      .select('id, status')
      .eq('customer_id', customerId)
      .eq('company_id', company.id)
      .eq('product_slug', productSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (!explicitAccess) continue

    const { data: allGranted } = await supabase
      .from('customer_product_access')
      .select('product_slug')
      .eq('customer_id', customerId)
      .eq('company_id', company.id)
      .eq('status', 'active')

    const grantedProducts = (allGranted || []).map(g => g.product_slug)

    return {
      allowed: true,
      customer,
      company,
      companyRole: mem.company_role,
      grantedProducts
    }
  }

  return { allowed: false, reason: `Access to product '${productSlug.toUpperCase()}' is not granted.` }
}

async function testUnicoreSso() {
  console.log("=== SCENARIO 1: UNICORE ENTERPRISES IDENTITY AUDIT & ACCESS VERIFICATION ===")

  const { data: customer } = await supabase
    .from('customer_identities')
    .select('*')
    .ilike('email', 'waazimrana@gmail.com')
    .single()

  console.log("Unicore Owner Customer Identity:", {
    id: customer.id,
    auth_user_id: customer.auth_user_id,
    email: customer.email,
    status: customer.status
  })

  const accessResult = await validateCustomerAccessDirect(customer.id, 'nexora')
  console.log("NEXORA Access Validation Result:", {
    allowed: accessResult.allowed,
    companyName: accessResult.company?.name,
    companyRole: accessResult.companyRole,
    grantedProducts: accessResult.grantedProducts,
    reason: accessResult.reason
  })

  if (!accessResult.allowed) {
    console.error("FAIL: NEXORA access disallowed for Unicore owner!")
    process.exit(1)
  }

  console.log("✓ SUCCESS: Unicore owner identity chain fully validated and authorized for NEXORA!")
}

testUnicoreSso().catch(console.error)
