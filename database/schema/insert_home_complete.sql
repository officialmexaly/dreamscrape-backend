-- Complete Home Page Content for Dreamscape Curated Events
-- Using PostgreSQL JSON functions to avoid string parsing issues

-- First, delete any existing home content to avoid duplicates
DELETE FROM site_content WHERE page = 'home';

-- HERO SECTION
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'hero', 'slides', 'json',
    jsonb_build_array(
      'https://images.unsplash.com/photo-1769812343775-85a27e6a076c?auto=format&fit=crop&fm=jpg&q=80&w=2200',
      'https://images.unsplash.com/photo-1773005695300-14b62bc85ba0?auto=format&fit=crop&fm=jpg&q=80&w=2200',
      'https://images.unsplash.com/photo-1744389481598-9779b474f557?auto=format&fit=crop&fm=jpg&q=80&w=2200'
    ),
    1);

INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'hero', 'headline', 'text', 'More Than Events.', 2),
  ('home', 'hero', 'subheadline', 'text', 'We Curate Experiences.', 3),
  ('home', 'hero', 'description', 'text', 'Luxury weddings, private celebrations, and elevated brand experiences thoughtfully designed, seamlessly coordinated, and beautifully executed.', 4),
  ('home', 'hero', 'bookingNote', 'text', 'Now booking 2026 & 2027 events', 5);

-- BRAND INTRO
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'brandIntro', 'label', 'text', 'Welcome to Dreamscape', 6),
  ('home', 'brandIntro', 'headline', 'text', 'Intentional design meets structured coordination.', 7),
  ('home', 'brandIntro', 'paragraph1', 'richtext', 'Dreamscape Curated Events is a Toronto-based planning and production company specializing in weddings, milestone celebrations, corporate events, and bespoke experiences.', 8),
  ('home', 'brandIntro', 'paragraph2', 'richtext', 'We blend intentional design with structured coordination systems to deliver seamless, elevated events from concept to execution.', 9),
  ('home', 'brandIntro', 'locationNote', 'text', 'Toronto-based | Available Worldwide', 10),
  ('home', 'brandIntro', 'image', 'image', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1974&auto=format&fit=crop', 11);

-- STATISTICS
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'statistics', 'stats', 'json',
    jsonb_build_array(
      jsonb_build_object('id', '1', 'value', '30+', 'label', 'Events Completed'),
      jsonb_build_object('id', '2', 'value', '30+', 'label', 'Clients Served'),
      jsonb_build_object('id', '3', 'value', '10+', 'label', 'Years Experience'),
      jsonb_build_object('id', '4', 'value', '20+', 'label', 'Vendor Partners')
    ),
    12);

-- SERVICES PREVIEW
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'servicesPreview', 'label', 'text', 'Our Expertise', 13),
  ('home', 'servicesPreview', 'headline', 'text', 'Curated Experiences', 14),
  ('home', 'servicesPreview', 'ctaText', 'text', 'Explore Services', 15),
  ('home', 'servicesPreview', 'ctaLink', 'text', '/services', 16);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'servicesPreview', 'services', 'json',
    jsonb_build_array(
      jsonb_build_object('id', '1', 'title', 'Weddings', 'description', 'Curated planning for timeless, detail-driven wedding experiences.'),
      jsonb_build_object('id', '2', 'title', 'Private & Social Events', 'description', 'Milestones and intimate celebrations designed with intention and elegance.'),
      jsonb_build_object('id', '3', 'title', 'Corporate & Brand Events', 'description', 'Strategic, polished experiences that elevate your brand presence.'),
      jsonb_build_object('id', '4', 'title', 'Destination Experiences', 'description', 'From international weddings to luxury travel-based celebrations.')
    ),
    17);

-- FEATURED EVENTS
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'featuredEvents', 'label', 'text', 'Blog', 18),
  ('home', 'featuredEvents', 'headline', 'text', 'Featured Events', 19),
  ('home', 'featuredEvents', 'viewAllText', 'text', 'View Experience', 20),
  ('home', 'featuredEvents', 'viewAllLink', 'text', '/portfolio', 21),
  ('home', 'featuredEvents', 'description', 'text', 'A refined destination wedding experience blending culture, elegance, and intentional design. From planning to execution, every detail was curated to deliver a seamless and unforgettable celebration.', 22);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'featuredEvents', 'events', 'json',
    jsonb_build_array(
      jsonb_build_object('id', 'nneoma-25', 'title', 'Nneoma''s 25th Birthday', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1530103862676-de8892b07439?q=80&w=2070&auto=format&fit=crop'),
      jsonb_build_object('id', 'chika-grad', 'title', 'Dr. Chika''s Graduation Celebration', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop'),
      jsonb_build_object('id', 'troy-1st', 'title', 'Troy''s 1st Birthday', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?q=80&w=1974&auto=format&fit=crop'),
      jsonb_build_object('id', 'pearl-donald', 'title', 'Pearl & Donald''s Wedding', 'location', 'Dallas', 'image', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')
    ),
    23);

-- WHY DREAMSCAPE
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'whyDreamscape', 'headline', 'text', 'Why Dreamscape', 24),
  ('home', 'whyDreamscape', 'description', 'text', 'Intentional design from concept to execution', 25);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'whyDreamscape', 'features', 'json',
    jsonb_build_array(
      'Structured planning systems that eliminate stress',
      'Trusted and curated vendor network',
      'Seamless guest experience from start to finish'
    ),
    26);

-- CTA SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'cta', 'headline', 'text', 'Ready to bring your vision to life?', 27),
  ('home', 'cta', 'description', 'text', 'Let''s create something extraordinary together', 28);

-- Verify the insert
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_json IS NOT NULL THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'home'
ORDER BY display_order;
