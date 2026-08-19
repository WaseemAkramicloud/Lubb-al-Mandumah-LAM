import { Client } from 'pg'

const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com'
]

const password = encodeURIComponent('471817@Lam2026')
const user = 'postgres.ykrjmctfmywhymgpkqlu'

async function testConnection() {
  for (const host of hosts) {
    const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 })
    try {
      console.log(`Connecting to ${host}...`)
      await client.connect()
      console.log(`SUCCESS! Connected to ${host}`)
      const res = await client.query('SELECT current_database(), current_user')
      console.log('Query result:', res.rows[0])
      await client.end()
      return host
    } catch (err: any) {
      console.log(`Failed to connect to ${host}:`, err.message)
    }
  }
}

testConnection()
