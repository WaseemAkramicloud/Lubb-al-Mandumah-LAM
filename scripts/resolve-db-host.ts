import dns from 'dns'
import { Client } from 'pg'

const hostsToTest = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-me-central-1.pooler.supabase.com',
  'db.ykrjmctfmywhymgpkqlu.supabase.co'
]

async function testHosts() {
  for (const host of hostsToTest) {
    dns.lookup(host, (err, address) => {
      console.log(`DNS lookup ${host}:`, err ? err.message : address)
    })
  }
}

testHosts()
