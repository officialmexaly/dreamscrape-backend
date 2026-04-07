-- Complete About Page Content for Dreamscape Curated Events
-- Using PostgreSQL JSON functions to avoid string parsing issues

-- First, delete any existing about content to avoid duplicates
DELETE FROM site_content WHERE page = 'about';

-- HERO SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'hero', 'headline', 'text', 'About Dreamscape', 1),
  ('about', 'hero', 'subheadline', 'text', 'Creating unforgettable moments since 2015', 2);

-- FOUNDER SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'founder', 'label', 'text', 'Meet The Executive Planner', 3),
  ('about', 'founder', 'name', 'text', 'Oseremen Ohiku', 4),
  ('about', 'founder', 'role', 'text', 'Founder & Executive Planner', 5),
  ('about', 'founder', 'bio1', 'richtext', 'Oseremen Ohiku is the Founder and Executive Planner of Dreamscape Curated Events Inc. Known for her structured planning approach and refined aesthetic direction, she specializes in curating elevated celebrations that are both beautifully designed and seamlessly executed.', 6),
  ('about', 'founder', 'bio2', 'richtext', 'With a strong foundation in organization, leadership, and precision, Oseremen brings clarity and calm to every event she manages. She believes meaningful celebrations deserve thoughtful coordination and intentional design.', 7),
  ('about', 'founder', 'quote', 'text', 'Her philosophy is simple: every event should feel effortless for the client and unforgettable for the guests.', 8),
  ('about', 'founder', 'image', 'image', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop', 9);

-- STORY SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'story', 'title', 'text', 'Our Story', 10),
  ('about', 'story', 'content', 'richtext', 'Dreamscape was born from a desire to create experiences that feel meaningful, organized, and unforgettable. What began as planning celebrations for friends and family quickly revealed itself as something deeper, a calling rooted in creativity, faith, and a passion for beautifully executed events.

Today, Dreamscape stands on a foundation of structure, intentional design, and excellence, delivering elevated experiences that leave lasting impressions.', 11);

-- PHILOSOPHY SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'philosophy', 'title', 'text', 'Our Philosophy', 12),
  ('about', 'philosophy', 'content', 'richtext', 'We believe that every celebration deserves intentional design and flawless execution. Our approach combines structured planning systems with refined aesthetics, ensuring that each event we touch is both beautifully designed and seamlessly coordinated.

From concept to completion, we bring clarity to chaos and transform vision into reality. We don''t just plan events—we craft experiences that tell your story with elegance and precision.', 13);

-- TEAM SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'team', 'title', 'text', 'Our Team', 14),
  ('about', 'team', 'description', 'text', 'A dedicated team of planners and coordinators committed to excellence in every detail.', 15);

-- Verify the insert
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_json IS NOT NULL THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'about'
ORDER BY display_order;
