import { Client } from 'pg'
import dns from 'dns'

const password = encodeURIComponent('471817@Lam2026')
const projectRef = 'ykrjmctfmywhymgpkqlu'

const hostsToTry = [
  `aws-0-eu-central-1.pooler.supabase.com`,
  `aws-1-eu-central-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-1-us-east-1.pooler.supabase.com`,
  `aws-0-us-west-1.pooler.supabase.com`,
  `aws-1-us-west-1.pooler.supabase.com`,
  `aws-0-ap-southeast-1.pooler.supabase.com`,
  `aws-1-ap-southeast-1.pooler.supabase.com`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-1-eu-west-1.pooler.supabase.com`
]

async function testPoolers() {
  for (const host of hostsToTry) {
    // Try user postgres.projectRef
    const connectionString = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres`
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 })
    try {
      await client.connect()
      console.log(`SUCCESS! Connected on ${host}`)
      await client.end()
      return host
    } catch (err: any) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`Host ${host} error:`, err.message)
      }
    }
  }
}

testPoolers().catch(console.error)
