-- Insert Portfolio/Blog page hero content into site_content
-- First, delete any existing portfolio hero content to avoid duplicates
DELETE FROM site_content WHERE page = 'portfolio' AND section = 'hero';

-- Insert Portfolio Hero Slides (stored as JSON array)
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('portfolio', 'hero', 'slides', 'json', '[
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
  ]'::jsonb, 1);

-- Insert Portfolio Hero Text
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('portfolio', 'hero', 'headline', 'text', 'Curated Experiences for Every Occasion', 2),
  ('portfolio', 'hero', 'subheadline', 'text', 'Real weddings. Authentic celebrations. Unforgettable moments.', 3);

-- Verify the insert
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_type = 'json' THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'portfolio' AND section = 'hero'
ORDER BY display_order;