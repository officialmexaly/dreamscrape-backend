-- ============================================================================
-- EVENTS TABLE (Portfolio-style)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
  title TEXT NOT NULL,
  client_name TEXT,
  event_date DATE,
  event_type TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  featured_image TEXT NOT NULL DEFAULT '',
  gallery_images JSONB DEFAULT '[]'::jsonb,
  budget TEXT,
  guest_count INTEGER,
  vendors JSONB DEFAULT '[]'::jsonb,
  testimonial TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order ASC);

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to events" ON events
  FOR SELECT USING (true);
CREATE POLICY "Allow insert to events" ON events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update events" ON events
  FOR UPDATE USING (true);
CREATE POLICY "Allow delete events" ON events
  FOR DELETE USING (true);
