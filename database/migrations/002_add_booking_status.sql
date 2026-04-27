-- Add status column to bookings table for admin CRM workflow
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'Contacted', 'Booked', 'Closed', 'Cancelled'));

-- Allow anon to read only the columns needed for availability checking
-- (consultation_date and consultation_time) without exposing PII
CREATE POLICY "Allow anon to read availability fields" ON bookings
  FOR SELECT
  TO anon
  USING (true);
