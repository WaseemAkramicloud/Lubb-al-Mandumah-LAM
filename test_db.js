const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://ykrjmctfmywhymgpkqlu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcmptY3RmbXl3aHltZ3BrcWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE5NTgwMSwiZXhwIjoyMTAxNzcxODAxfQ.bnLY6rt5lQEfxYeCXcFIBZyccwaoWKvsqiYPxZJJN_k'
);

async function test() {
  const { data, error } = await supabase.from('cms_products').select('slug').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
