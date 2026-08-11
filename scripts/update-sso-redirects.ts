import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateSsoRedirects() {
  console.log('🔄 Updating sso_applications redirect URIs in Supabase...')

  const { data: nexoraApp } = await supabase
    .from('sso_applications')
    .select('redirect_uris')
    .eq('client_id', 'lam_app_nexora')
    .single()

  const currentUris = nexoraApp?.redirect_uris || []
  const requiredUris = [
    'https://nexora-nu-lime-63.vercel.app/api/auth/callback',
    'http://localhost:3000/api/auth/callback',
    'http://localhost:3001/api/auth/callback',
    'https://nexora.lam.com/api/auth/callback'
  ]

  const updatedUris = Array.from(new Set([...currentUris, ...requiredUris]))

  const { error } = await supabase
    .from('sso_applications')
    .update({ redirect_uris: updatedUris })
    .eq('client_id', 'lam_app_nexora')

  if (error) {
    console.error('❌ Failed to update sso_applications:', error)
  } else {
    console.log('✅ Successfully updated sso_applications redirect URIs:', updatedUris)
  }
}

updateSsoRedirects()
