import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim()
        let val = trimmed.substring(idx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        process.env[key] = val
      }
    }
  })
}

const host = 'aws-1-eu-west-1.pooler.supabase.com'
const port = 6543
const user = 'postgres.ykrjmctfmywhymgpkqlu'
const password = process.env.SUPABASE_DB_PASSWORD || '471817@Lam2026'

async function run() {
  console.log('=== APPLYING SSO AUTH CODES WORKSPACE CONTEXT MIGRATION ===')
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })

  try {
    await client.connect()
    console.log(`Connected to Supabase Database on ${host}:${port}`)

    const sqlPath = path.join(process.cwd(), 'supabase/migrations/20260819000003_sso_auth_codes_workspace_context.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    await client.query(sql)
    console.log('✅ Migration DDL executed successfully.')

    await client.query("NOTIFY pgrst, 'reload schema';")
    console.log('✅ PostgREST schema cache reloaded.')

  } catch (err: any) {
    console.error('❌ Migration Error:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
