import { Client } from 'pg'
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

async function testConnections() {
  const pass = '471817@Lam2026'
  const proj = 'ykrjmctfmywhymgpkqlu'

  const connStrings = [
    `postgres://postgres:${encodeURIComponent(pass)}@db.${proj}.supabase.co:5432/postgres`,
    `postgres://postgres.${proj}:${encodeURIComponent(pass)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    `postgres://postgres.${proj}:${encodeURIComponent(pass)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgres://postgres:${encodeURIComponent(pass)}@db.${proj}.supabase.co:6543/postgres`
  ]

  for (const conn of connStrings) {
    console.log("Testing:", conn.replace(encodeURIComponent(pass), "*****"))
    const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 4000 })
    try {
      await client.connect()
      console.log("SUCCESS!")
      const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20260815000001_customer_access_setup.sql')
      const sql = fs.readFileSync(sqlPath, 'utf8')
      await client.query(sql)
      console.log("Migration executed successfully!")
      await client.end()
      return
    } catch (e: any) {
      console.log("Failed:", e.message)
      await client.end().catch(() => {})
    }
  }
}

testConnections().catch(console.error)
