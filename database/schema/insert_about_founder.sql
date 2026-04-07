-- About Page - Founder Section Content
-- Insert or update founder information

-- Delete existing founder content to avoid duplicates
DELETE FROM site_content WHERE page = 'about' AND section = 'founder';

-- Insert founder content
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('about', 'founder', 'label', 'text', 'Meet The Executive Planner', 1),
  ('about', 'founder', 'name', 'text', 'Oseremen Ohiku', 2),
  ('about', 'founder', 'role', 'text', 'Founder & Executive Planner', 3),
  ('about', 'founder', 'bio1', 'richtext', 'Oseremen Ohiku is the Founder and Executive Planner of Dreamscape Curated Events Inc. Known for her structured planning approach and refined aesthetic direction, she specializes in curating elevated celebrations that are both beautifully designed and seamlessly executed.', 4),
  ('about', 'founder', 'bio2', 'richtext', 'With a strong foundation in organization, leadership, and precision, Oseremen brings clarity and calm to every event she manages. She believes meaningful celebrations deserve thoughtful coordination and intentional design.', 5),
  ('about', 'founder', 'quote', 'text', 'Her philosophy is simple: every event should feel effortless for the client and unforgettable for the guests.', 6);

-- Verify the insert
SELECT page, section, content_key, content_type, content
FROM site_content
WHERE page = 'about' AND section = 'founder'
ORDER BY display_order;
