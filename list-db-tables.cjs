const https = require('https');

const url = 'https://aifqsjkgvejcqrzwgvqg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZnFzamtndmVqY3FyendndnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI3MDAwMSwiZXhwIjoyMDkwODQ2MDAxfQ.RofK8cNAM_aeuLA8TX670eBzxGM-xCuWt1euHyOTcpc';

console.log('🔍 Discovering tables in Supabase database...\n');

// List of common tables to check
const possibleTables = [
  'users', 'accounts', 'sessions', 'verification_tokens',
  'portfolio_items', 'events', 'services', 'bookings', 
  'media_library', 'site_settings', 'site_content',
  'inquiries', 'blog_posts', 'pages', 'audit_logs',
  'password_reset_tokens'
];

const options = {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  }
};

let found = 0;
let checked = 0;

const checkTable = (tableName) => {
  return new Promise((resolve) => {
    const testUrl = `${url}/rest/v1/${tableName}?limit=1`;
    
    https.get(testUrl, options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 406) {
        console.log(`✅ ${tableName}`);
        found++;
        resolve(true);
      } else {
        resolve(false);
      }
      checked++;
      
      if (checked === possibleTables.length) {
        console.log(`\n📊 Found ${found} out of ${possibleTables.length} checked tables`);
      }
    }).on('error', () => {
      resolve(false);
      checked++;
      
      if (checked === possibleTables.length) {
        console.log(`\n📊 Found ${found} out of ${possibleTables.length} checked tables`);
      }
    });
  });
};

(async () => {
  console.log('Checking for tables:\n');
  for (const table of possibleTables) {
    await checkTable(table);
  }
})();
