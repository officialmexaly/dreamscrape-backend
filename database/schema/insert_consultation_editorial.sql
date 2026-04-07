-- Insert Consultation Editorial page content into site_content
-- Using PostgreSQL JSON functions to avoid string parsing issues

-- First, delete any existing consultation_editorial content to avoid duplicates
DELETE FROM site_content WHERE page = 'consultation_editorial';

-- Hero Content
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation_editorial', 'hero', 'content', 'json',
    jsonb_build_object(
      'background_image', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop',
      'subtitle', 'Dreamscape Curated Events',
      'title', 'Schedule A Consultation'
    ),
    1);

-- Consultation Options
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation_editorial', 'options', 'options', 'json',
    jsonb_build_array(
      jsonb_build_object(
        'slug', 'wedding-destination-social',
        'title', 'Wedding / Destination Planning',
        'image', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
        'description', 'For couples seeking full planning, design direction, and seamless coordination for wedding celebrations, destination events, and refined guest experiences from beginning to final execution.'
      ),
      jsonb_build_object(
        'slug', 'event-design-styling',
        'title', 'Event Design & Styling',
        'image', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
        'description', 'A consultation focused on visual storytelling, styling direction, tablescape decisions, ambiance, and the design details that shape how your event feels from first impression to final reveal.'
      ),
      jsonb_build_object(
        'slug', 'pick-my-brain',
        'title', 'Pick My Brain Session (1-Hour Virtual Consultation)',
        'image', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop',
        'description', 'For clients who need strategic event guidance, vendor advice, or professional clarity before moving forward. Ideal for a focused conversation around planning decisions and next steps.'
      ),
      jsonb_build_object(
        'slug', 'real-time-assessment',
        'title', 'Real-Time Event Assessment',
        'image', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200&auto=format&fit=crop',
        'description', 'A consultation designed to review your current event progress, identify what is missing, and recommend the structure, support, and production touchpoints needed to move the experience forward with confidence.'
      )
    ),
    2);

-- Verify the insert
SELECT page, section, content_key, content_type, content_json::text as value FROM site_content WHERE page = 'consultation_editorial' ORDER BY display_order;
