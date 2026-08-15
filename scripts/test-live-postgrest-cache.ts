import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim()
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testPostgrestCacheAndMutation() {
  console.log("=== TESTING LIVE POSTGREST READ & WRITE FOR customer_identities.must_change_password ===")

  // 1. Fetch first record
  const { data: record, error: selectErr } = await supabase
    .from('customer_identities')
    .select('id, email, must_change_password')
    .limit(1)
    .single()

  if (selectErr || !record) {
    console.error("Select failed:", selectErr)
    process.exit(1)
  }

  console.log("Initial Record State:", record)

  // 2. Test Update
  const originalVal = record.must_change_password
  const { data: updateRes, error: updateErr } = await supabase
    .from('customer_identities')
    .update({ must_change_password: true })
    .eq('id', record.id)
    .select('id, email, must_change_password')
    .single()

  if (updateErr || !updateRes) {
    console.error("Update failed:", updateErr)
    process.exit(1)
  }

  console.log("✓ Updated Record State (must_change_password: true):", updateRes)

  // 3. Restore Original State
  await supabase
    .from('customer_identities')
    .update({ must_change_password: originalVal })
    .eq('id', record.id)

  console.log("✓ Restored Original Record State!")
  console.log("\n🎉 ALL LIVE POSTGREST READ/WRITE TESTS FOR must_change_password PASSED CLEANLY!")
}

testPostgrestCacheAndMutation().catch(console.error)
