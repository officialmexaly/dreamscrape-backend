# Supabase Setup Guide for Dreamscape Booking System

## 🎯 Overview
Your booking system uses Supabase as the database backend. This guide will help you set it up in 5 minutes.

## 📋 Prerequisites
- You already have a Supabase project (credentials in `.env.local`)
- Project URL: `https://vxzagfvbnfgipoqlpjel.supabase.co`

## 🚀 Setup Steps

### Step 1: Access Your Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `Dreamscape Curated Events`

### Step 2: Run SQL Setup
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button
3. Copy the SQL below and paste it:

```sql
-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date DATE,
  event_location TEXT,
  event_types TEXT[] DEFAULT '{}',
  budget TEXT,
  guests TEXT,
  how_did_you_hear TEXT,
  additional_details TEXT,
  consultation_date DATE NOT NULL,
  consultation_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on consultation_date and consultation_time for faster availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_consultation_date_time ON bookings(consultation_date, consultation_time);

-- Create index on email for customer lookup
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bookings (for public form submission)
CREATE POLICY "Allow insert bookings" ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow service role to read all bookings
CREATE POLICY "Allow service role to read all bookings" ON bookings
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy to allow service role to update bookings
CREATE POLICY "Allow service role to update bookings" ON bookings
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy to allow service role to delete bookings
CREATE POLICY "Allow service role to delete bookings" ON bookings
  FOR DELETE
  TO service_role
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy availability checking
CREATE OR REPLACE VIEW booking_availability AS
SELECT
  consultation_date,
  consultation_time,
  COUNT(*) as booking_count
FROM bookings
GROUP BY consultation_date, consultation_time;

-- Grant access on the view
GRANT SELECT ON booking_availability TO anon;
GRANT SELECT ON booking_availability TO service_role;
```

4. Click **"Run"** button (or press `Ctrl+Enter`)
5. You should see: `Success. No rows returned` (this is normal!)

### Step 3: Verify the Setup

#### Check the Table:
1. Click **"Table Editor"** in the left sidebar
2. You should see `bookings` in the table list
3. Click on it to see the structure

#### Check Security Policies:
1. Click **"Authentication"** → **"Policies"**
2. Click on `bookings` table
3. You should see 4 policies:
   - ✅ Allow insert bookings
   - ✅ Allow service role to read all bookings
   - ✅ Allow service role to update bookings
   - ✅ Allow service role to delete bookings

### Step 4: Test the Connection

Run the test script:
```bash
node test-supabase.js
```

You should see:
```
✅ Bookings table is accessible!
✅ Can insert bookings!
✅ Test booking cleaned up
✅ All tests passed!
```

## 📊 Your Database Structure

### Main Table: `bookings`
```
┌─────────────────────┬───────────────┬────────────┐
│ Column              │ Type          │ Required   │
├─────────────────────┼───────────────┼────────────┤
│ id                  │ UUID          │ ✅ Auto    │
│ first_name          │ Text          │ ✅ Yes     │
│ last_name           │ Text          │ ✅ Yes     │
│ email               │ Text          │ ✅ Yes     │
│ phone               │ Text          │ ✅ Yes     │
│ consultation_date   │ Date          │ ✅ Yes     │
│ consultation_time   │ Text          │ ✅ Yes     │
│ event_date          │ Date          │ Optional   │
│ event_location      │ Text          │ Optional   │
│ event_types         │ Text[]        │ Optional   │
│ budget              │ Text          │ Optional   │
│ guests              │ Text          │ Optional   │
│ how_did_you_hear    │ Text          │ Optional   │
│ additional_details  │ Text          │ Optional   │
│ created_at          │ Timestamp     │ ✅ Auto    │
│ updated_at          │ Timestamp     │ ✅ Auto    │
└─────────────────────┴───────────────┴────────────┘
```

## 🔐 Security Explained

Your database uses **Row Level Security (RLS)** to protect data:

1. **Public (anon key)**: Can INSERT new bookings (form submissions)
2. **Service role**: Can do everything (read, update, delete)

This means:
- ✅ Website visitors can submit bookings
- ✅ Only your backend can view/manage bookings
- ❌ Public cannot directly access all booking data

## 📈 Performance Optimizations

These indexes make queries fast:
- `idx_bookings_consultation_date_time` - For availability checks
- `idx_bookings_email` - For customer lookups

## 🧹 Maintenance

### View All Bookings:
1. Go to **Table Editor**
2. Click `bookings` table
3. View all submissions

### Export Data:
1. In Table Editor, click `bookings`
2. Click **"Export"** button
3. Choose CSV or Excel

### Delete Test Data:
```sql
-- Delete bookings before a certain date
DELETE FROM bookings WHERE created_at < '2026-04-01';

-- Delete specific booking by ID
DELETE FROM bookings WHERE id = 'your-booking-id-here';
```

## 🐛 Troubleshooting

### "Table not found" error:
→ Run the SQL setup again (Step 2)

### "Permission denied" error:
→ Check RLS policies are enabled (Step 3)

### "Cannot insert" error:
→ Verify the "Allow insert bookings" policy exists

### Test script fails:
→ Verify your `.env.local` has correct Supabase credentials

## 🎉 You're Ready!

Once setup is complete:
1. Test the booking form at `/consultation`
2. Bookings appear in Supabase dashboard
3. Email notifications are sent
4. Google Calendar events are created

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- Your Project: https://supabase.com/dashboard/project/vxzagfvbnfgipoqlpjel
- SQL Reference: https://supabase.com/docs/guides/database
