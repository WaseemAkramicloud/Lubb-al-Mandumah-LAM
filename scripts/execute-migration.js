const { Client } = require('pg');
const { Resolver } = require('dns/promises');
const fs = require('fs');
const path = require('path');

async function runLiveMigration() {
  console.log("=== RESOLVING AND CONNECTING TO LIVE SUPABASE POOLER IPS ===");

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const poolerDomains = [
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com'
  ];

  const password = "471817@Lam2026";
  let connected = false;

  for (const domain of poolerDomains) {
    let ips = [];
    try {
      ips = await resolver.resolve4(domain);
      console.log(`Resolved ${domain} ->`, ips);
    } catch (e) {
      continue;
    }

    for (const ip of ips) {
      for (const port of [5432, 6543]) {
        for (const user of [`postgres.ykrjmctfmywhymgpkqlu`, `postgres`]) {
          console.log(`Connecting to IP ${ip}:${port} as ${user}...`);
          const client = new Client({
            host: ip,
            port,
            database: 'postgres',
            user,
            password,
            ssl: {
              rejectUnauthorized: false,
              servername: domain
            },
            connectionTimeoutMillis: 3000
          });

          try {
            await client.connect();
            console.log(`\n🎉 CONNECTED SUCCESSFULLY TO ${ip}:${port} (${domain}) as ${user}!`);
            connected = true;

            // 1. Check column before
            const checkBefore = await client.query(`
              SELECT column_name, data_type, column_default, is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'customer_identities'
                AND column_name = 'must_change_password';
            `);
            console.log("\nBefore Migration Check - column info:", checkBefore.rows);

            // 2. Read and apply migration SQL
            const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260815000001_customer_access_setup.sql');
            const sql = fs.readFileSync(migrationPath, 'utf8');

            console.log("\nExecuting Migration 20260815000001_customer_access_setup.sql...");
            await client.query(sql);
            console.log("✓ DDL executed successfully!");

            // 3. Send NOTIFY pgrst to reload PostgREST schema cache
            console.log("\nReloading PostgREST Schema Cache...");
            await client.query("NOTIFY pgrst, 'reload schema';");
            console.log("✓ NOTIFY pgrst, 'reload schema' executed successfully!");

            // 4. Verify column after
            const checkAfter = await client.query(`
              SELECT column_name, data_type, column_default, is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'customer_identities'
                AND column_name = 'must_change_password';
            `);
            console.log("\nAfter Migration Verification - column info:", checkAfter.rows);

            await client.end();
            break;
          } catch (err) {
            await client.end().catch(() => {});
          }
        }
        if (connected) break;
      }
      if (connected) break;
    }
    if (connected) break;
  }

  if (!connected) {
    console.error("\nFAIL: Could not connect to any pooler IP.");
    process.exit(1);
  }
}

runLiveMigration().catch(console.error);
