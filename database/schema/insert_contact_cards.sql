-- Insert Contact page contact information into site_content
-- First, delete any existing contact contact_info to avoid duplicates
DELETE FROM site_content WHERE page = 'contact' AND section = 'contact_info';

-- Insert Contact Cards (stored as JSON array)
INSERT INTO site_content (page, section, content_key, content_type, content_json, display_order) VALUES
  ('contact', 'contact_info', 'cards', 'json', '[
    {
      "label": "Email Address",
      "value": "dreamscapeventts@gmail.com",
      "href": "mailto:dreamscapeventts@gmail.com"
    },
    {
      "label": "Phone Number",
      "value": "+1 (365) 987-9393",
      "href": "tel:+13659879393"
    },
    {
      "label": "Our Location",
      "value": "Serving the Greater Toronto Area (GTA), Canada & Worldwide.",
      "href": "/consultation-editorial"
    }
  ]'::jsonb, 1);

-- Verify the insert
SELECT page, section, content_key, content_type, content_json::text as value
FROM site_content
WHERE page = 'contact' AND section = 'contact_info';