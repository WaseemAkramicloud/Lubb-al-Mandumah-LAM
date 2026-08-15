const { Resolver } = require('dns/promises');

async function testDnsResolution() {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const domains = [
    'ykrjmctfmywhymgpkqlu.supabase.co',
    'db.ykrjmctfmywhymgpkqlu.supabase.co',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com'
  ];

  for (const domain of domains) {
    try {
      const addresses = await resolver.resolve4(domain);
      console.log(`Resolved ${domain} -> IPv4:`, addresses);
    } catch (e) {
      try {
        const addrs6 = await resolver.resolve6(domain);
        console.log(`Resolved ${domain} -> IPv6:`, addrs6);
      } catch (e6) {
        console.log(`Failed to resolve ${domain}:`, e.message);
      }
    }
  }
}

testDnsResolution();
