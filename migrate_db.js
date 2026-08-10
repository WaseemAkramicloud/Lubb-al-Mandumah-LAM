const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:471817%40Waseem@db.ykrjmctfmywhymgpkqlu.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to Supabase DB');
    
    // Check if cms_products exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cms_products'
      );
    `);
    
    if (!res.rows[0].exists) {
      console.log('cms_products does not exist. Running Stage 6 migration...');
      const sql4 = fs.readFileSync(path.join(__dirname, 'supabase/migrations/20260810000004_stage6_content.sql'), 'utf8');
      await client.query(sql4);
      console.log('Stage 6 migration applied.');
    }
    
    // Check if crm_leads exists
    const res2 = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'crm_leads'
      );
    `);
    
    if (!res2.rows[0].exists) {
      console.log('crm_leads does not exist. Running Stage 7 migration...');
      const sql5 = fs.readFileSync(path.join(__dirname, 'supabase/migrations/20260810000005_crm_leads_clients.sql'), 'utf8');
      await client.query(sql5);
      console.log('Stage 7 migration applied.');
    }
    
    // Check if product_plans exists
    const res3 = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_plans'
      );
    `);
    
    if (!res3.rows[0].exists) {
      console.log('product_plans does not exist. Running Stage 8 migration...');
      const sql6 = fs.readFileSync(path.join(__dirname, 'supabase/migrations/20260810000006_stage8.sql'), 'utf8');
      await client.query(sql6);
      console.log('Stage 8 migration applied.');
    }

    console.log('All missing migrations applied successfully.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

runMigrations();
