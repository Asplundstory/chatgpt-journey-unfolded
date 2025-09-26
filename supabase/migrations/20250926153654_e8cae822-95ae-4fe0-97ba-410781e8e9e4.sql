-- Create sync status table to track import progress
CREATE TABLE public.sync_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type text NOT NULL, -- 'full_import', 'incremental_update'
  status text NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'paused'
  total_products integer DEFAULT 0,
  processed_products integer DEFAULT 0,
  wines_inserted integer DEFAULT 0,
  wines_updated integer DEFAULT 0,
  last_product_processed text,
  error_message text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing sync status (everyone can see)
CREATE POLICY "Anyone can view sync status" 
ON public.sync_status 
FOR SELECT 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_sync_status_updated_at
BEFORE UPDATE ON public.sync_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_sync_status_type_status ON public.sync_status(sync_type, status);
CREATE INDEX idx_sync_status_started_at ON public.sync_status(started_at DESC);