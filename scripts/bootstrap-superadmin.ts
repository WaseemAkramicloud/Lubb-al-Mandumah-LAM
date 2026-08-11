import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local automatically
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach((line) => {
    const [key, ...val] = line.split('=')
    if (key && val.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim()
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
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

async function bootstrapSuperadmin() {
  const args = parseArgs()

  const email = (args['email'] as string) || process.env.ADMIN_EMAIL
  const password = (args['password'] as string) || process.env.ADMIN_PASSWORD
  const firstName = (args['firstname'] as string) || process.env.ADMIN_FIRST_NAME || 'Platform'
  const lastName = (args['lastname'] as string) || process.env.ADMIN_LAST_NAME || 'Superadmin'

  if (!email || !password) {
    console.error("❌ ERROR: Please supply --email and --password arguments or set ADMIN_EMAIL & ADMIN_PASSWORD environment variables.")
    console.log("\nUsage:")
    console.log("  npx tsx scripts/bootstrap-superadmin.ts --email=admin@yourdomain.com --password=YourStrongPassword --firstname=Owner --lastname=Admin")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("❌ ERROR: Password must be at least 8 characters long.")
    process.exit(1)
  }

  console.log(`🔒 Checking existing platform administrators...`)

  // 1. Permanent Security Lock: Abort if ANY Superadmin already exists in staff_profiles
  const { data: existingAdmins, error: checkErr } = await supabase
    .from('staff_profiles')
    .select('id, work_email, designation')
    .eq('designation', 'System Administrator')

  if (!checkErr && existingAdmins && existingAdmins.length > 0) {
    console.error(`🔒 SECURITY LOCK: Platform Superadmin initialization is LOCKED because ${existingAdmins.length} Superadmin account(s) already exist.`)
    console.error(`  Active Superadmin : ${existingAdmins[0].work_email}`)
    console.error(`  Additional Superadmins must be created by an authenticated Superadmin in the Web Control Panel (/control-panel/users).`)
    console.error(`  For disaster recovery, use the explicit server-side recovery script: scripts/emergency-superadmin-recovery.ts`)
    process.exit(1)
  }

  console.log(`🚀 Initializing FIRST Platform Superadmin account: ${email}...`)

  // 2. Create or find user in Supabase Auth
  let userId: string | undefined = undefined

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: 'super_admin'
    }
  })

  if (authUser?.user?.id) {
    userId = authUser.user.id
  } else if (authError) {
    console.log(`ℹ️ Lookup user in auth.users by email...`)
    const { data: usersList } = await supabase.auth.admin.listUsers()
    const found = usersList.users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())
    if (found) {
      userId = found.id
      await supabase.auth.admin.updateUserById(userId, { password })
    } else {
      console.error(`❌ Failed to create or locate Supabase Auth user: ${authError.message}`)
      process.exit(1)
    }
  }

  if (!userId) {
    console.error(`❌ Unexpected error: User ID is missing.`)
    process.exit(1)
  }

  // 3. Upsert staff_profiles record
  const staffId = `LAM-${Math.floor(100000 + Math.random() * 900000)}`
  const { error: profileErr } = await supabase
    .from('staff_profiles')
    .upsert(
      {
        id: userId,
        staff_id: staffId,
        work_email: email.trim().toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        designation: 'System Administrator',
        status: 'active',
        requires_password_change: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )

  if (profileErr) {
    console.error(`❌ Failed to create staff_profile: ${profileErr.message}`)
    process.exit(1)
  }

  // 4. Grant full permissions in staff_permissions
  const permissionsList = [
    'dashboard', 'users', 'permissions', 'site_management', 'products',
    'insights', 'leads_clients', 'pricing', 'system_settings'
  ]

  for (const moduleName of permissionsList) {
    await supabase.from('staff_permissions').upsert(
      {
        staff_id: userId,
        module: moduleName,
        can_view: true,
        can_edit: true,
        can_delete: true,
        can_publish: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'staff_id,module' }
    )
  }

  // 5. Log audit entry
  await supabase.from('audit_logs').insert({
    staff_id: userId,
    staff_email: email,
    action: 'SUPERADMIN_INITIALIZATION_COMPLETED',
    details: {
      staff_id: staffId,
      first_name: firstName,
      last_name: lastName
    }
  })

  console.log(`\n✅ SUCCESS! First Platform Superadmin initialized successfully.`)
  console.log(`--------------------------------------------------`)
  console.log(`  Staff ID    : ${staffId}`)
  console.log(`  Email       : ${email}`)
  console.log(`  Designation : System Administrator`)
  console.log(`  Status      : Active (Script is now permanently locked)`)
  console.log(`  Login URL   : /staff-login or /control-panel/dashboard`)
  console.log(`--------------------------------------------------\n`)
}

bootstrapSuperadmin()
