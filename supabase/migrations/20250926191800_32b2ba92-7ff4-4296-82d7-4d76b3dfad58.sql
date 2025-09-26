-- Fix security issue: Restrict profiles table access to own profile only
-- Drop the overly permissive policy that allows viewing all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a restrictive policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING ((auth.uid())::text = (user_id)::text);

-- Also fix sync_status table to be admin-only (for the secondary security issue)
DROP POLICY IF EXISTS "Anyone can view sync status" ON public.sync_status;

-- Create a more restrictive policy for sync_status (authenticated users only, can be further restricted to admins later)
CREATE POLICY "Authenticated users can view sync status" 
ON public.sync_status 
FOR SELECT 
TO authenticated
USING (true);