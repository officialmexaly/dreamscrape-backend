-- Insert Love Notes/Testimonials page content into site_content
-- First, delete any existing love_notes content to avoid duplicates
DELETE FROM site_content WHERE page = 'love_notes' AND section = 'testimonials';

-- Insert Testimonials (stored as JSON array)
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('love_notes', 'testimonials', 'items', 'json', '[
    {
      "name": "Nneoma Achioso",
      "quote": "Dreamscape truly made my dream birthday come true…",
      "img": "https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop"
    },
    {
      "name": "Dr. Chika Obetta",
      "quote": "My grad party turned out amazing…",
      "img": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop"
    }
  ]'::jsonb, 1);

-- Verify the insert
SELECT page, section, content_key, content_type, content_json::text as value
FROM site_content
WHERE page = 'love_notes' AND section = 'testimonials';