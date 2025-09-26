-- Add columns for wine review data enrichment
ALTER TABLE public.wines 
ADD COLUMN review_points integer,
ADD COLUMN review_description text,
ADD COLUMN taster_name text;