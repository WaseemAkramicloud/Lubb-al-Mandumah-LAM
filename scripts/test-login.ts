import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Env")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testLogin() {
  console.log("Attempting login...")
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@lamweb.com',
    password: 'Admin@123',
  })

  if (error) {
    console.error("Login failed:", error.message)
  } else {
    console.log("Login successful!", data.user.email)
  }
}

testLogin()
