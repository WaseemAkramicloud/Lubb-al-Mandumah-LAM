const { Client } = require('pg');

async function reloadSchemaCache() {
  const connectionString = 'postgresql://postgres:471817%40Waseem@db.ykrjmctfmywhymgpkqlu.supabase.co:5432/postgres';
  
  // Try direct IP connection if host fails or standard client
  const dns = require('dns');
  dns.lookup('db.ykrjmctfmywhymgpkqlu.supabase.co', async (err, address) => {
    const conn = address ? `postgresql://postgres:471817%40Waseem@${address}:5432/postgres` : connectionString;
    const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log("Connected to DB. Adding missing columns & reloading PostgREST schema cache...");
      await client.query(`
        ALTER TABLE public.customer_identities ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255);
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE public.customer_invitations ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;
        NOTIFY pgrst, 'reload schema';
      `);
      console.log("Schema updated and NOTIFY pgrst sent successfully!");
    } catch (e) {
      console.error("Migration/Reload error:", e);
    } finally {
      await client.end().catch(() => {});
    }
  });
}

reloadSchemaCache();
