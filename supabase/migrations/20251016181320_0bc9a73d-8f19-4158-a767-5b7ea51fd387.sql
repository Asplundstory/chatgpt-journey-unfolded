-- Add new columns to wines table for multi-source support
ALTER TABLE wines 
  ADD COLUMN source_country TEXT DEFAULT 'SE',
  ADD COLUMN source_monopoly TEXT DEFAULT 'Systembolaget',
  ADD COLUMN currency TEXT DEFAULT 'SEK',
  ADD COLUMN external_product_url TEXT;

-- Create indexes for faster filtering
CREATE INDEX idx_wines_source_country ON wines(source_country);
CREATE INDEX idx_wines_source_monopoly ON wines(source_monopoly);

-- Update existing wines with correct metadata
UPDATE wines 
SET 
  source_country = 'SE',
  source_monopoly = 'Systembolaget',
  currency = 'SEK'
WHERE source_country IS NULL;