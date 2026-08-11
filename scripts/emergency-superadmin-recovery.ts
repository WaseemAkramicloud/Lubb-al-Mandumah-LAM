import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const EMERGENCY_KEY = process.env.EMERGENCY_RECOVERY_KEY || 'lam-emergency-admin-recovery-2026-vault'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function parseArgs() {
  const args = process.argv.slice(2)
  const params: Record<string, string> = {}
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...val] = arg.slice(2).split('=')
      params[key] = val.length ? val.join('=') : ''
    }
  }
  return params
}

async function runEmergencyRecovery() {
  const args = parseArgs()
  const recoveryKey = args['recovery-key'] || process.env.RECOVERY_KEY
  const email = args['email'] || process.env.ADMIN_EMAIL
  const password = args['password'] || process.env.ADMIN_PASSWORD

  console.log("🚨 EMERGENCY SUPERADMIN RECOVERY PROCEDURE INITIATED")

  if (recoveryKey !== EMERGENCY_KEY) {
    console.error("❌ DISASTER RECOVERY FAILED: Invalid or missing --recovery-key argument.")
    console.error("This emergency recovery script requires explicit authorization via --recovery-key=<key>.")
    process.exit(1)
  }

  if (!email || !password) {
    console.error("❌ ERROR: Please supply --email and --password arguments.")
    process.exit(1)
  }

  // 1. Create or reset Auth user
  const { data: usersList } = await supabase.auth.admin.listUsers()
  let userId = usersList.users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())?.id

  if (userId) {
    await supabase.auth.admin.updateUserById(userId, { password })
    console.log(`ℹ️  Password reset for existing account: ${email}`)
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: { first_name: 'Emergency', last_name: 'Recovery Admin', role: 'super_admin' }
    })
    if (error || !newUser.user) {
      console.error(`❌ Emergency account creation failed: ${error?.message}`)
      process.exit(1)
    }
    userId = newUser.user.id
  }

  // 2. Ensure Superadmin profile & permissions
  const staffId = `LAM-REC-${Math.floor(1000 + Math.random() * 9000)}`
  await supabase.from('staff_profiles').upsert({
    id: userId,
    staff_id: staffId,
    work_email: email.trim().toLowerCase(),
    first_name: 'Emergency',
    last_name: 'Recovery Admin',
    role: 'super_admin',
    status: 'active',
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' })

  const permissionsList = [
    'dashboard', 'users', 'permissions', 'site_management', 'products',
    'insights', 'leads_clients', 'pricing', 'system_settings'
  ]

  for (const moduleName of permissionsList) {
    await supabase.from('staff_permissions').upsert({
      staff_id: userId,
      module: moduleName,
      can_view: true,
      can_edit: true,
      can_delete: true,
      can_publish: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'staff_id,module' })
  }

  // 3. Log high-priority security audit entry
  await supabase.from('audit_logs').insert({
    staff_id: userId,
    staff_email: email,
    action: 'EMERGENCY_SUPERADMIN_RECOVERY_EXECUTED',
    details: {
      timestamp: new Date().toISOString(),
      email
    }
  })

  console.log(`\n🚨 EMERGENCY RECOVERY COMPLETE`)
  console.log(`--------------------------------------------------`)
  console.log(`  Staff ID  : ${staffId}`)
  console.log(`  Email     : ${email}`)
  console.log(`  Role      : super_admin`)
  console.log(`--------------------------------------------------\n`)
}

runEmergencyRecovery()
