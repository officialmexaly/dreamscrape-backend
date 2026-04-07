-- Update all services CTA text to "Start Planning"
UPDATE services
SET cta_text = 'Start Planning'
WHERE cta_text = 'See Details' OR cta_text IS NULL;

-- Verify the update
SELECT title, cta_text FROM services;