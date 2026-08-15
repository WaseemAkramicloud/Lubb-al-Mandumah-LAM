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

async function runLiveMigration() {
  console.log("=== SCANNING SUPABASE POOLER REGIONS FOR YKRJMCTFMYWHYMGPKQLU ===")

  const regions = [
    'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
    'sa-east-1', 'ca-central-1', 'me-central-1', 'af-south-1'
  ]

  const password = "471817@Lam2026"
  let connected = false

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`
    const user = `postgres.ykrjmctfmywhymgpkqlu`

    const client = new Client({
      host,
      port: 5432,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    })

    try {
      await client.connect()
      console.log(`\n🎉 CONNECTED SUCCESSFULLY TO ${host}! Region: ${region}`)
      connected = true

      // 1. Check if column must_change_password exists
      const checkRes = await client.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'customer_identities'
          AND column_name = 'must_change_password';
      `)

      console.log("\nBefore Migration Check - column info:", checkRes.rows)

      // 2. Read migration file
      const migrationFile = path.resolve(process.cwd(), 'supabase/migrations/20260815000001_customer_access_setup.sql')
      const migrationSql = fs.readFileSync(migrationFile, 'utf8')

      console.log("\nExecuting Migration SQL...")
      await client.query(migrationSql)
      console.log("✓ Migration DDL executed successfully!")

      // 3. Reload PostgREST Schema Cache
      console.log("\nReloading PostgREST Schema Cache...")
      await client.query("NOTIFY pgrst, 'reload schema';")
      console.log("✓ NOTIFY pgrst, 'reload schema' sent successfully!")

      // 4. Verify Column after migration
      const postCheck = await client.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'customer_identities'
          AND column_name = 'must_change_password';
      `)
      console.log("\nAfter Migration Verification - column info:", postCheck.rows)

      await client.end()
      break
    } catch (err: any) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`Host ${host} response: ${err.message}`)
      }
      await client.end().catch(() => {})
    }
  }

  if (!connected) {
    console.error("FAIL: Could not connect to any pooler region.")
    process.exit(1)
  }
}

runLiveMigration().catch(console.error)
