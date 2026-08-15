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

async function runMigration() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || '471817@Lam2026'
  const projectId = 'ykrjmctfmywhymgpkqlu'

  const poolerHosts = [
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
  ]

  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20260815000001_customer_access_setup.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  for (const host of poolerHosts) {
    const connectionString = `postgres://postgres.${projectId}:${encodeURIComponent(dbPassword)}@${host}:6543/postgres`
    console.log(`Trying host ${host}...`)
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
    try {
      await client.connect()
      console.log(`Connected to ${host}! Executing migration...`)
      await client.query(sql)
      console.log("Migration executed successfully!")
      await client.end()
      return
    } catch (err: any) {
      console.log(`Host ${host} failed: ${err.message}`)
      await client.end().catch(() => {})
    }
  }

  // Session mode on port 5432
  for (const host of poolerHosts) {
    const connectionString = `postgres://postgres.${projectId}:${encodeURIComponent(dbPassword)}@${host}:5432/postgres`
    console.log(`Trying host ${host} (port 5432)...`)
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
    try {
      await client.connect()
      console.log(`Connected to ${host}:5432! Executing migration...`)
      await client.query(sql)
      console.log("Migration executed successfully!")
      await client.end()
      return
    } catch (err: any) {
      console.log(`Host ${host}:5432 failed: ${err.message}`)
      await client.end().catch(() => {})
    }
  }
}

runMigration().catch(console.error)
