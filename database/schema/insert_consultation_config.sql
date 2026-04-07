-- Insert Consultation page configuration into site_content
-- Using PostgreSQL JSON functions to avoid string parsing issues

-- First, delete any existing consultation content to avoid duplicates
DELETE FROM site_content WHERE page = 'consultation';

-- Time Options
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation', 'time_options', 'options', 'json',
    jsonb_build_array('08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'),
    1);

-- Event Type Options
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation', 'event_types', 'options', 'json',
    jsonb_build_array(
      jsonb_build_object('id', 'wedding-destination-social', 'label', 'Wedding / Destination Planning'),
      jsonb_build_object('id', 'design-styling', 'label', 'Event Design & Styling'),
      jsonb_build_object('id', 'corporate-brand', 'label', 'Corporate & Brand Events'),
      jsonb_build_object('id', 'private-social', 'label', 'Private & Social Events'),
      jsonb_build_object('id', 'pick-my-brain', 'label', 'Pick My Brain Session')
    ),
    2);

-- Consultation Types
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation', 'consultation_types', 'types', 'json',
    jsonb_build_object(
      'wedding-destination-social', 'Comprehensive planning support for destination weddings and large social celebrations.',
      'design-styling', 'Design-focused consultation for event aesthetics, styling, and visual direction.',
      'corporate-brand', 'Strategic planning for corporate events, brand activations, and professional gatherings.',
      'private-social', 'Planning support for private parties, milestones, and intimate social gatherings.',
      'pick-my-brain', 'A focused one-hour session to brainstorm ideas and get expert guidance on your event vision.'
    ),
    3);

-- Date Range
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('consultation', 'date_range', 'config', 'json',
    jsonb_build_object(
      'start_date', '2026-03-01',
      'end_date', '2026-12-31'
    ),
    4);

-- Consultation Page Content
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('consultation', 'page_content', 'headline', 'text', 'Begin Your Event Journey', 5);

INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('consultation', 'page_content', 'subheadline', 'text', 'Schedule a consultation with Dreamscape Curated Events to discuss your vision and explore how we can bring your celebration to life.', 6);

INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
  ('consultation', 'page_content', 'description', 'text', 'Whether you''re planning a wedding, corporate event, or private celebration, our team is here to guide you through every step of the process.', 7);

-- Verify the insert
SELECT page, section, content_key, content_type, CASE WHEN content_json IS NOT NULL THEN content_json::text ELSE content END as value FROM site_content WHERE page = 'consultation' ORDER BY display_order;
