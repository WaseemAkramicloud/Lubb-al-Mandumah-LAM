const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function tryPooler() {
  const pass = '471817@Waseem';
  const proj = 'ykrjmctfmywhymgpkqlu';
  const hosts = [
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com'
  ];

  for (const host of hosts) {
    // Session mode user: postgres.ykrjmctfmywhymgpkqlu
    const connStr = `postgres://postgres.${proj}:${encodeURIComponent(pass)}@${host}:5432/postgres`;
    console.log(`Testing host ${host}...`);
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log(`Connected to ${host}! Executing migration...`);
      const sqlPath = path.join(__dirname, 'supabase/migrations/20260815000001_customer_access_setup.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(sql);
      console.log('Migration executed successfully!');
      await client.end();
      return;
    } catch (err) {
      console.log(`Host ${host} failed: ${err.message}`);
      await client.end().catch(() => {});
    }
  }

  for (const host of hosts) {
    // Transaction mode user: postgres.ykrjmctfmywhymgpkqlu on 6543
    const connStr = `postgres://postgres.${proj}:${encodeURIComponent(pass)}@${host}:6543/postgres`;
    console.log(`Testing transaction host ${host}...`);
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log(`Connected to ${host}:6543! Executing migration...`);
      const sqlPath = path.join(__dirname, 'supabase/migrations/20260815000001_customer_access_setup.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(sql);
      console.log('Migration executed successfully!');
      await client.end();
      return;
    } catch (err) {
      console.log(`Host ${host}:6543 failed: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
}

tryPooler();
