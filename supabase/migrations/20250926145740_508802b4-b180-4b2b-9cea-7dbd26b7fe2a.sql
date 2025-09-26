-- Create wine products table
CREATE TABLE public.wines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  producer TEXT,
  category TEXT,
  country TEXT,
  region TEXT,
  vintage INTEGER,
  alcohol_percentage DECIMAL(4,2),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  sales_start_date DATE,
  assortment TEXT,
  investment_score INTEGER CHECK (investment_score >= 0 AND investment_score <= 100),
  projected_return_1y DECIMAL(5,2),
  projected_return_3y DECIMAL(5,2),
  projected_return_5y DECIMAL(5,2),
  projected_return_10y DECIMAL(5,2),
  storage_time_months INTEGER,
  drinking_window_start INTEGER,
  drinking_window_end INTEGER,
  value_appreciation DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user wine favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wine_id UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, wine_id)
);

-- Create user wine portfolio table
CREATE TABLE public.user_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wine_id UUID NOT NULL REFERENCES public.wines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_price DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create launch plans table
CREATE TABLE public.launch_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  url TEXT,
  year INTEGER,
  quarter INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wines (public read access)
CREATE POLICY "Anyone can view wines" 
ON public.wines 
FOR SELECT 
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for user favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for user portfolio
CREATE POLICY "Users can view their own portfolio" 
ON public.user_portfolio 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own portfolio items" 
ON public.user_portfolio 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own portfolio items" 
ON public.user_portfolio 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own portfolio items" 
ON public.user_portfolio 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for launch plans (public read access)
CREATE POLICY "Anyone can view launch plans" 
ON public.launch_plans 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_wines_updated_at
  BEFORE UPDATE ON public.wines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_portfolio_updated_at
  BEFORE UPDATE ON public.user_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_wines_category ON public.wines(category);
CREATE INDEX idx_wines_country ON public.wines(country);
CREATE INDEX idx_wines_investment_score ON public.wines(investment_score);
CREATE INDEX idx_wines_price ON public.wines(price);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_portfolio_user_id ON public.user_portfolio(user_id);