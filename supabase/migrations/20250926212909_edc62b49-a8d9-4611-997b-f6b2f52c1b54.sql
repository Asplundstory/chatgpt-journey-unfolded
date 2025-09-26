-- Enhanced RLS policies for profiles table to protect sensitive data like email addresses

-- First, drop existing policies to replace them with more secure ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more explicit and secure policies for the profiles table

-- Policy for SELECT: Users can only view their own profile data
CREATE POLICY "Users can view own profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT: Users can only create their own profile
CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can only delete their own profile
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add a comment to document the security considerations
COMMENT ON TABLE public.profiles IS 'User profiles table with RLS policies to protect sensitive data including email addresses. Only authenticated users can access their own profile data.';