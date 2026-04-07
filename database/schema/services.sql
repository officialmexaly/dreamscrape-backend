-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~* '^[a-z0-9-]+$'),
  category TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image TEXT,
  list_items JSONB DEFAULT '[]'::jsonb,
  cta_text TEXT,
  cta_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order ASC);

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to services" ON services
  FOR SELECT USING (true);
CREATE POLICY "Allow insert to services" ON services
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update services" ON services
  FOR UPDATE USING (true);
CREATE POLICY "Allow delete services" ON services
  FOR DELETE USING (true);
