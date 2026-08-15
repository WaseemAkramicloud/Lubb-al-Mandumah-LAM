const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testDnsAndConnect() {
  const host = 'db.ykrjmctfmywhymgpkqlu.supabase.co';
  console.log('Resolving host:', host);
  dns.lookup(host, { all: true }, async (err, addresses) => {
    console.log('DNS lookup result:', err, addresses);
    if (addresses && addresses.length > 0) {
      const ip = addresses[0].address;
      console.log(`Connecting directly to IP ${ip}...`);
      const connectionString = `postgresql://postgres:471817%40Waseem@${ip}:5432/postgres`;
      const client = new Client({ connectionString, ssl: { rejectUnauthorized: false, servername: host } });
      try {
        await client.connect();
        console.log('Connected directly to IP!');
        const sqlPath = path.join(__dirname, 'supabase/migrations/20260815000001_customer_access_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);
        console.log('Migration executed successfully!');
        await client.end();
      } catch (e) {
        console.error('Direct IP Connect Error:', e);
        await client.end().catch(() => {});
      }
    }
  });
}

testDnsAndConnect();
