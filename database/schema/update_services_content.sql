-- Migration: Update Services Page Content
-- This script removes old Services page content and inserts the comprehensive structure
-- Run this in your Supabase SQL editor or via psql

-- Step 1: Remove old Services page content
DELETE FROM site_content WHERE page = 'services';

-- Step 2: Insert new comprehensive Services page content

-- Page Intro
INSERT INTO site_content (page, section, content_key, content_type, content, display_order) VALUES
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
  ('services', 'final_cta', 'button_link', 'text', '/consultation-editorial', 25);

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
  ]'::jsonb, 3);

-- Verify the data was inserted
SELECT page, section, content_key, content_type,
  CASE
    WHEN content_type = 'json' THEN content_json::text
    ELSE content
  END as value
FROM site_content
WHERE page = 'services'
ORDER BY section, display_order;
