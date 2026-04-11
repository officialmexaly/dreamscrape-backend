-- Add blog-specific fields to portfolio_items table
-- Run this in your Supabase Dashboard SQL Editor

-- Add missing fields if they don't exist
ALTER TABLE portfolio_items 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Dreamscape Team',
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_status ON portfolio_items(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug ON portfolio_items(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON portfolio_items(created_at DESC);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'portfolio_items' 
  AND column_name IN ('subtitle', 'excerpt', 'author', 'categories', 'tags', 'content')
ORDER BY ordinal_position;
