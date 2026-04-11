// Test database connection
const https = require('https');

const url = 'https://aifqsjkgvejcqrzwgvqg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZnFzamtndmVqY3FyendndnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI3MDAwMSwiZXhwIjoyMDkwODQ2MDAxfQ.RofK8cNAM_aeuLA8TX670eBzxGM-xCuWt1euHyOTcpc';

console.log('🔍 Testing Supabase connection...\n');

const options = {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  }
};

https.get(`${url}/rest/v1/events?limit=1`, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS: Can connect to Supabase!');
      console.log('📊 Response:', data.substring(0, 100));
    } else {
      console.log('❌ Status:', res.statusCode, data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error:', err.message);
});
