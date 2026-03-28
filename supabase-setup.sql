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
