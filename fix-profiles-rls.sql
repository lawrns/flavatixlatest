-- Fix RLS policies on profiles table to allow anon access for social feed
-- This is necessary because the SocialFeedWidget loads before authentication completes

-- Drop the existing SELECT policies that might be conflicting
DROP POLICY IF EXISTS "read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "user_view_profile" ON public.profiles;

-- Create a single, clear SELECT policy that allows both anon and authenticated users
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  USING (true);

-- Verify the policy is created
SELECT policyname, roles, permissive, qual
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'SELECT';
