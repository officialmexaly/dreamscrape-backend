-- Insert Home page hero content into site_content
-- First, delete any existing home hero content to avoid duplicates
DELETE FROM site_content WHERE page = 'home' AND section = 'hero';

-- Insert Hero Slides (stored as JSON array)
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'hero', 'slides', 'json', '[
    "https://images.unsplash.com/photo-1769812343775-85a27e6a076c?auto=format&fit=crop&fm=jpg&q=80&w=2200",
    "https://images.unsplash.com/photo-1773005695300-14b62bc85ba0?auto=format&fit=crop&fm=jpg&q=80&w=2200",
    "https://images.unsplash.com/photo-1744389481598-9779b474f557?auto=format&fit=crop&fm=jpg&q=80&w=2200"
  ]'::jsonb, 1);

-- Insert Hero Text content
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'hero', 'headline', 'text', 'More Than Events.', 2),
  ('home', 'hero', 'subheadline', 'text', 'We Curate Experiences.', 3),
  ('home', 'hero', 'description', 'richtext', 'Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.', 4),
  ('home', 'hero', 'primary_cta_text', 'text', 'Book a Consultation', 5),
  ('home', 'hero', 'primary_cta_link', 'text', '/consultation-editorial', 6),
  ('home', 'hero', 'secondary_cta_text', 'text', 'View Blog', 7),
  ('home', 'hero', 'secondary_cta_link', 'text', '/blog', 8),
  ('home', 'hero', 'booking_note', 'text', 'Now booking 2026 & 2027 events', 9);

-- Verify the insert
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_type = 'json' THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'home' AND section = 'hero'
ORDER BY display_order;