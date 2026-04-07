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
  ('home', 'hero', 'primary_cta_text', 'text', 'Book a Consultation', 5),
  ('home', 'hero', 'primary_cta_link', 'text', '/consultation-editorial', 6),
  ('home', 'hero', 'secondary_cta_text', 'text', 'View Blog', 7),
  ('home', 'hero', 'secondary_cta_link', 'text', '/blog', 8),
  ('home', 'hero', 'booking_note', 'text', 'Now booking 2026 & 2027 events', 9);

-- BRAND INTRO
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'brandIntro', 'label', 'text', 'Welcome to Dreamscape', 10),
  ('home', 'brandIntro', 'headline', 'text', 'Intentional design meets structured coordination.', 11),
  ('home', 'brandIntro', 'paragraph1', 'richtext', 'Dreamscape Curated Events is a Toronto-based planning and production company specializing in weddings, milestone celebrations, corporate events, and bespoke experiences.', 12),
  ('home', 'brandIntro', 'paragraph2', 'richtext', 'We blend intentional design with structured coordination systems to deliver seamless, elevated events from concept to execution.', 13),
  ('home', 'brandIntro', 'locationNote', 'text', 'Toronto-based | Available Worldwide', 14),
  ('home', 'brandIntro', 'image', 'image', 'https://images.unsplash.com/photo-1779434542504-8c63c8c8174a?auto=format&fit=crop&fm=jpg&q=80&w=1200', 15);

-- STATISTICS
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'statistics', 'stats', 'json',
    jsonb_build_array(
      jsonb_build_object('id', '1', 'value', '30+', 'label', 'Events Completed'),
      jsonb_build_object('id', '2', 'value', '30+', 'label', 'Clients Served'),
      jsonb_build_object('id', '3', 'value', '10+', 'label', 'Years Experience'),
      jsonb_build_object('id', '4', 'value', '20+', 'label', 'Vendor Partners')
    ),
    16);

-- SERVICES PREVIEW
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'servicesPreview', 'label', 'text', 'Our Expertise', 17),
  ('home', 'servicesPreview', 'headline', 'text', 'Curated Experiences', 18),
  ('home', 'servicesPreview', 'ctaText', 'text', 'Explore Services', 19),
  ('home', 'servicesPreview', 'ctaLink', 'text', '/services', 20);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'servicesPreview', 'services', 'json',
    jsonb_build_array(
      jsonb_build_object('id', '1', 'title', 'Weddings', 'description', 'Curated planning for timeless, detail-driven wedding experiences.'),
      jsonb_build_object('id', '2', 'title', 'Private & Social Events', 'description', 'Milestones and intimate celebrations designed with intention and elegance.'),
      jsonb_build_object('id', '3', 'title', 'Corporate & Brand Events', 'description', 'Strategic, polished experiences that elevate your brand presence.'),
      jsonb_build_object('id', '4', 'title', 'Destination Experiences', 'description', 'From international weddings to luxury travel-based celebrations.')
    ),
    21);

-- FEATURED EVENTS
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'featuredEvents', 'label', 'text', 'Featured Events', 22),
  ('home', 'featuredEvents', 'headline', 'text', 'Recent Celebrations', 23),
  ('home', 'featuredEvents', 'viewAllText', 'text', 'View All Events', 24),
  ('home', 'featuredEvents', 'viewAllLink', 'text', '/portfolio', 25),
  ('home', 'featuredEvents', 'description', 'text', 'A refined destination wedding experience blending culture, elegance, and intentional design. From planning to execution, every detail was curated to deliver a seamless and unforgettable celebration.', 26);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'featuredEvents', 'events', 'json',
    jsonb_build_array(
      jsonb_build_object('id', '1', 'title', 'Nneoma''s 25th Birthday', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&fm=jpg&q=80&w=800'),
      jsonb_build_object('id', '2', 'title', 'Dr. Chika''s Graduation Celebration', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&fm=jpg&q=80&w=800'),
      jsonb_build_object('id', '3', 'title', 'Troy''s 1st Birthday', 'location', 'Toronto', 'image', 'https://images.unsplash.com/photo-1530103862676-de8892b07439?auto=format&fit=crop&fm=jpg&q=80&w=800'),
      jsonb_build_object('id', '4', 'title', 'Pearl & Donald''s Wedding', 'location', 'Dallas', 'image', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&fm=jpg&q=80&w=800')
    ),
    27);

-- WHY DREAMSCAPE
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'whyDreamscape', 'label', 'text', 'Why Dreamscape', 28),
  ('home', 'whyDreamscape', 'headline', 'text', 'Intentional design from concept to execution', 29);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'whyDreamscape', 'features', 'json',
    jsonb_build_array(
      'Structured planning systems that eliminate stress',
      'Trusted and curated vendor network',
      'Seamless guest experience from start to finish'
    ),
    30);

-- CTA SECTION
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'cta', 'headline', 'text', 'Ready to bring your vision to life?', 31),
  ('home', 'cta', 'subheadline', 'text', 'Dreamscape Curated Events', 32),
  ('home', 'cta', 'description', 'text', 'Toronto-based | Available Worldwide', 33),
  ('home', 'cta', 'details', 'text', 'Luxury weddings, private celebrations, and elevated brand experiences.', 34);

-- NEWSLETTER
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'newsletter', 'headline', 'text', 'Enter your email', 35),
  ('home', 'newsletter', 'buttonText', 'text', 'Submit', 36),
  ('home', 'newsletter', 'disclaimer', 'text', 'By subscribing you agree to receive updates from Dreamscape Curated Events.', 37);

-- FOOTER
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'footer', 'exploreLinks', 'json',
    jsonb_build_array(
      jsonb_build_object('label', 'Home', 'href', '/'),
      jsonb_build_object('label', 'Services', 'href', '/services'),
      jsonb_build_object('label', 'Blog', 'href', '/portfolio')
    ),
    38);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'footer', 'companyLinks', 'json',
    jsonb_build_array(
      jsonb_build_object('label', 'About', 'href', '/about'),
      jsonb_build_object('label', 'Love Notes', 'href', '/love-notes'),
      jsonb_build_object('label', 'Contact', 'href', '/contact')
    ),
    39);

INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('home', 'footer', 'connectLinks', 'json',
    jsonb_build_array(
      jsonb_build_object('label', 'Instagram', 'href', 'https://instagram.com', 'icon', 'instagram'),
      jsonb_build_object('label', 'Email', 'href', 'mailto:dreamscapeventts@gmail.com', 'icon', 'email'),
      jsonb_build_object('label', 'Consultation', 'href', '/consultation-editorial', 'icon', 'calendar')
    ),
    40);

INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('home', 'footer', 'copyright', 'text', '© 2026 Dreamscape Curated Events Inc. All rights reserved.', 41);

-- Verify the insert
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_json IS NOT NULL THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'home'
ORDER BY display_order;
