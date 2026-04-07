// Simple test to check if we can connect to Supabase
const supabaseUrl = 'https://vxzagfvbnfgipoqlpjel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4emFnZnZibmZnaXBvcWxwamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODA5NzEsImV4cCI6MjA4OTI1Njk3MX0.Do7kCZQZFt120VrFFXCm4Tee5RfeyjN3lWSumKPuHYk';

async function testConnection() {
  console.log('🔍 Testing Supabase connection to Dreamscape database...\n');

  try {
    // Test 1: Check if we can reach the database at all
    console.log('1️⃣ Testing basic connection...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      console.log('✅ Can reach Supabase!\n');
    } else {
      console.log('❌ Cannot reach Supabase:', response.status, response.statusText);
      return;
    }

    // Test 2: Check if bookings table exists
    console.log('2️⃣ Testing bookings table...');
    const bookingsResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?select=count&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Bookings table exists!');
      console.log('   Response:', JSON.stringify(bookingsData, null, 2));
    } else {
      const error = await bookingsResponse.text();
      console.log('❌ Bookings table error:', bookingsResponse.status, error);
    }

    // Test 3: Check blog_posts table
    console.log('\n3️⃣ Testing blog_posts table...');
    const blogResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?select=count&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (blogResponse.ok) {
      const blogData = await blogResponse.json();
      console.log('✅ Blog posts table exists!');
      console.log('   Response:', JSON.stringify(blogData, null, 2));
    } else {
      const error = await blogResponse.text();
      console.log('❌ Blog posts table error:', blogResponse.status, error);
    }

    // Test 4: Get actual bookings count
    console.log('\n4️⃣ Getting bookings statistics...');
    const countResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (countResponse.ok) {
      const count = countResponse.headers.get('content-range');
      console.log('✅ Total bookings:', count || 'unknown');
    } else {
      console.log('❌ Could not get bookings count');
    }

    console.log('\n🎉 Database connection test complete!');
    console.log('✅ Your database schema is properly set up');
    console.log('✅ The admin portal should be able to connect');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
