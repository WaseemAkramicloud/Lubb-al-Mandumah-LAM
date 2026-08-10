import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase URL or Service Role Key in environment variables.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  console.log("Creating Super Admin user...")
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@lamweb.com',
    password: 'Admin@123',
    email_confirm: true,
    user_metadata: {
      company: 'LAM-Web',
      role: 'super_admin'
    }
  })

  if (error) {
    console.error("Error creating user:", error.message)
    process.exit(1)
  }

  console.log("Success! Super Admin user created.")
  console.log("User ID:", data.user.id)
  console.log("Email:", data.user.email)
}

createAdmin()
