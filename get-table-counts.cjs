const https = require('https');

const url = 'https://aifqsjkgvejcqrzwgvqg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZnFzamtndmVqY3FyendndnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI3MDAwMSwiZXhwIjoyMDkwODQ2MDAxfQ.RofK8cNAM_aeuLA8TX670eBzxGM-xCuWt1euHyOTcpc';

const tables = [
  'sessions', 'portfolio_items', 'events', 'services', 
  'bookings', 'media_library', 'site_settings', 'site_content',
  'blog_posts', 'pages', 'audit_logs'
];

const options = {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
  }
};

const checkTable = (tableName) => {
  return new Promise((resolve) => {
    https.get(`${url}/rest/v1/${tableName}?select=*&limit=0`, options, (res) => {
      const countHeader = res.headers['content-range'];
      const count = countHeader ? countHeader.split('/')[1] : '?';
      
      if (res.statusCode === 200) {
        resolve({ table: tableName, count: count, status: '✅' });
      } else {
        resolve({ table: tableName, count: 'Error', status: '❌' });
      }
    }).on('error', () => {
      resolve({ table: tableName, count: 'Error', status: '❌' });
    });
  });
};

(async () => {
  console.log('📊 Database Tables Overview\n');
  console.log('Table'.padEnd(20), 'Count'.padEnd(10), 'Status');
  console.log('─'.repeat(40));
  
  const results = await Promise.all(tables.map(checkTable));
  results.forEach(({ table, count, status }) => {
    console.log(status, table.padEnd(18), count.toString().padEnd(10));
  });
  
  const total = results.reduce((sum, { count }) => 
    sum + (parseInt(count) || 0), 0
  );
  console.log('─'.repeat(40));
  console.log('Total Records:', total);
})();
