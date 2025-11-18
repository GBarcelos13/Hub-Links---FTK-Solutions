-- Fix Critical Security Issues

-- 1. Fix unauthorized link reordering vulnerability
-- Drop the overly permissive policy that allows any user to reorder any link
DROP POLICY IF EXISTS "All users can reorder links" ON public.links;

-- The existing "Users can update own links content" policy already provides
-- the correct authorization (owner or admin can update), so no new policy needed

-- 2. Fix profile visibility - restrict to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy allowing users to view only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);