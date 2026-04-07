-- Site Content Table
-- Stores all editable content for the website

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  content_key VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'text', 'richtext', 'image', 'number', 'json', 'array'
  content TEXT,
  content_json JSONB,
  content_number NUMERIC,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_site_content_content_key ON site_content(content_key);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content for Home page
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  -- Hero Section
  ('home', 'hero', 'slides', 'json', '[
    {
      "id": "1",
      "image": "https://images.unsplash.com/photo-1769812343775-85a27e6a076c?auto=format&fit=crop&fm=jpg&q=80&w=2200",
      "headline": "More Than Events.",
      "subheadline": "We Curate Experiences.",
      "description": "Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.",
      "primaryCta": {"text": "Book a Consultation", "link": "/consultation-editorial"},
      "secondaryCta": {"text": "View Blog", "link": "/portfolio"},
      "bookingNote": "Now booking 2026 & 2027 events"
    },
    {
      "id": "2",
      "image": "https://images.unsplash.com/photo-1773005695300-14b62bc85ba0?auto=format&fit=crop&fm=jpg&q=80&w=2200",
      "headline": "More Than Events.",
      "subheadline": "We Curate Experiences.",
      "description": "Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.",
      "primaryCta": {"text": "Book a Consultation", "link": "/consultation-editorial"},
      "secondaryCta": {"text": "View Blog", "link": "/portfolio"},
      "bookingNote": "Now booking 2026 & 2027 events"
    },
    {
      "id": "3",
      "image": "https://images.unsplash.com/photo-1744389481598-9779b474f557?auto=format&fit=crop&fm=jpg&q=80&w=2200",
      "headline": "More Than Events.",
      "subheadline": "We Curate Experiences.",
      "description": "Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.",
      "primaryCta": {"text": "Book a Consultation", "link": "/consultation-editorial"},
      "secondaryCta": {"text": "View Blog", "link": "/portfolio"},
      "bookingNote": "Now booking 2026 & 2027 events"
    }
  ]'::jsonb, 1)

ON CONFLICT DO NOTHING;

-- Brand Intro Section
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'brandIntro', 'label', 'text', 'Welcome to Dreamscape', 1),
  ('home', 'brandIntro', 'headline', 'text', 'Intentional design meets structured coordination.', 2),
  ('home', 'brandIntro', 'paragraph1', 'text', 'Dreamscape Curated Events is a Toronto-based planning and production company specializing in weddings, milestone celebrations, corporate events, and bespoke experiences.', 3),
  ('home', 'brandIntro', 'paragraph2', 'text', 'We blend intentional design with structured coordination systems to deliver seamless, elevated events from concept to execution.', 4),
  ('home', 'brandIntro', 'locationNote', 'text', 'Toronto-based | Available Worldwide', 5),
  ('home', 'brandIntro', 'image', 'text', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1974&auto=format&fit=crop', 6)

ON CONFLICT DO NOTHING;

-- Statistics Section
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'statistics', 'stats', 'json', '[
    {"id": "1", "value": "30+", "label": "Events Completed"},
    {"id": "2", "value": "30+", "label": "Clients Served"},
    {"id": "3", "value": "10+", "label": "Years Experience"},
    {"id": "4", "value": "20+", "label": "Vendor Partners"}
  ]'::jsonb, 1)

ON CONFLICT DO NOTHING;

-- Services Preview Section
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'servicesPreview', 'label', 'text', 'Our Expertise', 1),
  ('home', 'servicesPreview', 'headline', 'text', 'Curated Experiences', 2),
  ('home', 'servicesPreview', 'ctaText', 'text', 'Explore Services', 3),
  ('home', 'servicesPreview', 'ctaLink', 'text', '/services', 4)

ON CONFLICT DO NOTHING;

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'servicesPreview', 'services', 'json', '[
    {"id": "1", "title": "Weddings", "description": "Curated planning for timeless, detail-driven wedding experiences."},
    {"id": "2", "title": "Private & Social Events", "description": "Milestones and intimate celebrations designed with intention and elegance."},
    {"id": "3", "title": "Corporate & Brand Events", "description": "Strategic, polished experiences that elevate your brand presence."},
    {"id": "4", "title": "Destination Experiences", "description": "From international weddings to luxury travel-based celebrations."}
  ]'::jsonb, 5)

ON CONFLICT DO NOTHING;

-- Featured Events Section
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'featuredEvents', 'label', 'text', 'Featured Work', 1),
  ('home', 'featuredEvents', 'headline', 'text', 'Recent Celebrations', 2),
  ('home', 'featuredEvents', 'viewAllText', 'text', 'View All Events', 3),
  ('home', 'featuredEvents', 'viewAllLink', 'text', '/portfolio', 4)

ON CONFLICT DO NOTHING;

-- About Page
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'hero', 'headline', 'text', 'About Dreamscape', 1),
  ('about', 'hero', 'subheadline', 'text', 'Creating unforgettable moments since 2015', 2),
  ('about', 'story', 'title', 'text', 'Our Story', 3),
  ('about', 'story', 'content', 'richtext', 'Dreamscape Curated Events was founded on the belief that every celebration should be a masterpiece. We blend meticulous planning with visionary design to create unforgettable moments.', 4),
  ('about', 'philosophy', 'title', 'text', 'Our Philosophy', 5),
  ('about', 'philosophy', 'content', 'richtext', 'We believe that great events are built on intentional design, seamless coordination, and attention to every detail.', 6),
  ('about', 'team', 'title', 'text', 'Our Team', 7),
  ('about', 'team', 'description', 'text', 'A passionate group of designers, planners, and coordinators dedicated to exceeding expectations.', 8)

ON CONFLICT DO NOTHING;

-- Services Page
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  -- Page Intro
  ('services', 'page_intro', 'headline', 'text', 'Curated Experiences for Every Occasion', 1),
  ('services', 'page_intro', 'description', 'richtext', 'Dreamscape delivers full-service planning, coordination, and production across weddings, private celebrations, corporate events, and large-scale experiences all executed with structure, creativity, and precision.', 2),

  -- Weddings
  ('services', 'weddings', 'label', 'text', 'Weddings', 3),
  ('services', 'weddings', 'title', 'text', 'Luxury Wedding Planning & Production', 4),
  ('services', 'weddings', 'image', 'text', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop', 5),
  ('services', 'weddings', 'description', 'richtext', 'From intimate ceremonies to full wedding weekends, every detail is thoughtfully curated to reflect your vision with elegance and intention.', 6),

  -- Private Events
  ('services', 'private_events', 'label', 'text', 'Private & Social Events', 7),
  ('services', 'private_events', 'title', 'text', 'Elevated Personal Celebrations', 8),
  ('services', 'private_events', 'image', 'text', 'https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop', 9),
  ('services', 'private_events', 'description', 'richtext', 'From milestone birthdays to bridal showers and intimate dinners, we curate experiences that feel refined, seamless, and unforgettable.', 10),

  -- Corporate Events
  ('services', 'corporate_events', 'label', 'text', 'Corporate, Brand & Industry Events', 11),
  ('services', 'corporate_events', 'title', 'text', 'Strategy Meets Sophistication', 12),
  ('services', 'corporate_events', 'image', 'text', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop', 13),
  ('services', 'corporate_events', 'description', 'richtext', 'We partner with brands, entrepreneurs, and organizations to create experiences that communicate vision, elevate presence, and engage audiences.', 14),

  -- Special Events
  ('services', 'special_events', 'label', 'text', 'Special & Public Events', 15),
  ('services', 'special_events', 'title', 'text', 'Large-Scale, Seamlessly Executed', 16),
  ('services', 'special_events', 'image', 'text', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop', 17),
  ('services', 'special_events', 'description', 'richtext', 'From cultural celebrations to charity galas and public showcases, Dreamscape delivers structured planning and smooth execution at scale.', 18),

  -- Destination
  ('services', 'destination', 'label', 'text', 'Destination & Luxury Experiences', 19),
  ('services', 'destination', 'title', 'text', 'Luxury Without Borders', 20),
  ('services', 'destination', 'image', 'text', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop', 21),
  ('services', 'destination', 'description', 'richtext', 'From yachts to villas to international celebrations, we curate destination experiences that are immersive, seamless, and unforgettable.', 22),

  -- Final CTA
  ('services', 'final_cta', 'headline', 'text', 'Not sure where to start? Let''s create something unforgettable together.', 23),
  ('services', 'final_cta', 'button_text', 'text', 'Book a Consultation', 24),
  ('services', 'final_cta', 'button_link', 'text', '/consultation-editorial', 25)

ON CONFLICT DO NOTHING;

-- Services Page - JSON Arrays
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('services', 'weddings', 'planning_options', 'json', '[
    "Month-of Coordination",
    "Partial Planning",
    "Full Planning & Design",
    "Dreamscape Exclusive",
    "Destination Weddings (including international experiences such as Dallas, USA)"
  ]'::jsonb, 1),

  ('services', 'private_events', 'includes_list', 'json', '[
    "Concept & mood board",
    "Vendor sourcing & coordination",
    "Styling guidance",
    "Timeline & logistics",
    "Full day-of execution"
  ]'::jsonb, 2),

  ('services', 'corporate_events', 'services_list', 'json', '[
    "Brand activations & launches",
    "Corporate events & retreats",
    "Expos, showcases & industry events"
  ]'::jsonb, 3)

ON CONFLICT DO NOTHING;

-- Contact Page
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('contact', 'hero', 'headline', 'text', 'Get in Touch', 1),
  ('contact', 'hero', 'subheadline', 'text', 'Let''s create something extraordinary together', 2),
  ('contact', 'information', 'title', 'text', 'Contact Information', 3),
  ('contact', 'information', 'email', 'text', 'dreamscapeventts@gmail.com', 4),
  ('contact', 'information', 'location', 'text', 'Toronto, Canada', 5),
  ('contact', 'information', 'availability', 'text', 'Available Worldwide', 6),
  ('contact', 'form', 'title', 'text', 'Send us a message', 7),
  ('contact', 'form', 'submitButton', 'text', 'Send Message', 8)

ON CONFLICT DO NOTHING;
