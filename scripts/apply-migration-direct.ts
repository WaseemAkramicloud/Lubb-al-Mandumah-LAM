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

async function applyDirectMigration() {
  console.log("=== CONNECTING TO SUPABASE POOLER PORTS (5432 & 6543) ===")

  const password = "471817@Lam2026"
  const regions = ['eu-central-1', 'eu-west-1', 'us-east-1', 'ap-southeast-1', 'me-central-1']
  const ports = [5432, 6543]

  let connected = false

  for (const region of regions) {
    for (const port of ports) {
      const host = `aws-0-${region}.pooler.supabase.com`
      const user = `postgres.ykrjmctfmywhymgpkqlu`

      console.log(`Testing ${host}:${port}...`)
      const client = new Client({
        host,
        port,
        database: 'postgres',
        user,
        password,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 4000
      })

      try {
        await client.connect()
        console.log(`\n🎉 CONNECTED SUCCESSFULLY TO ${host}:${port}!`)
        connected = true

        // 1. Check if column must_change_password exists before
        const checkBefore = await client.query(`
          SELECT column_name, data_type, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'customer_identities'
            AND column_name = 'must_change_password';
        `)
        console.log("\nBefore Migration Check:", checkBefore.rows)

        // 2. Read and apply migration SQL
        const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260815000001_customer_access_setup.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        console.log("\nExecuting Migration 20260815000001_customer_access_setup.sql...")
        await client.query(sql)
        console.log("✓ DDL executed successfully!")

        // 3. Send NOTIFY pgrst to reload PostgREST schema cache
        console.log("\nReloading PostgREST Schema Cache...")
        await client.query("NOTIFY pgrst, 'reload schema';")
        console.log("✓ NOTIFY pgrst, 'reload schema' executed successfully!")

        // 4. Verify column after
        const checkAfter = await client.query(`
          SELECT column_name, data_type, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'customer_identities'
            AND column_name = 'must_change_password';
        `)
        console.log("\nAfter Migration Verification:", checkAfter.rows)

        await client.end()
        break
      } catch (err: any) {
        if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
          console.log(`  Output for ${host}:${port}: ${err.message}`)
        }
        await client.end().catch(() => {})
      }
    }
    if (connected) break
  }

  if (!connected) {
    console.error("\nFAIL: Could not connect to any pooler port.")
    process.exit(1)
  }
}

applyDirectMigration().catch(console.error)
