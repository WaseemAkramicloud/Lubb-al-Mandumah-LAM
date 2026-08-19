import { Client } from 'pg'

const regions = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-south-1',
  'ca-central-1',
  'sa-east-1'
]

const password = encodeURIComponent('471817@Lam2026')
const user = 'postgres.ykrjmctfmywhymgpkqlu'

async function findRegion() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`
    const connectionString = `postgresql://${user}:${password}@${host}:6543/postgres`
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 })
    try {
      await client.connect()
      console.log(`🎉 MATCH FOUND! Project region is ${region} (${host})`)
      const res = await client.query('SELECT current_database(), current_user')
      console.log('Query result:', res.rows[0])
      await client.end()
      return host
    } catch (err: any) {
      if (err.message.includes('tenant/user') && err.message.includes('not found')) {
        // wrong region
      } else {
        console.log(`Host ${host} response:`, err.message)
      }
    }
  }
  console.log('Finished testing regions.')
}

findRegion()
