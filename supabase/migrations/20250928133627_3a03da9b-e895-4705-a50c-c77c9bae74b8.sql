-- Add new columns to launch_plans table for Firecrawl integration
ALTER TABLE public.launch_plans 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'static',
ADD COLUMN IF NOT EXISTS scraped_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS excel_url text,
ADD COLUMN IF NOT EXISTS product_count integer,
ADD COLUMN IF NOT EXISTS description text;