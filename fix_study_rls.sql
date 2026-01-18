-- Create a security definer function to check study participation without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_study_participant(session_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM study_participants
    WHERE session_id = $1
    AND user_id = auth.uid()
  );
$$;

-- Drop existing potentially recursive policies on study_sessions
DROP POLICY IF EXISTS "Users can view sessions they host or participate in" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_participants_read" ON study_sessions;

-- Update study_sessions policy to use the security definer function
CREATE POLICY "Users can view sessions they host or participate in" ON study_sessions
FOR SELECT
USING (
  (host_id = auth.uid()) OR  -- Host
  is_study_participant(id)   -- Participant (via secure function)
);

-- Fix study_participants policies
-- We need to ensure we don't cause recursion when checking if someone is a host
-- We can create a helper for checking host status too, or just accept that breaking the loop in study_sessions is enough.
-- However, strict security suggests using a function for the host check too if we want to be safe.

CREATE OR REPLACE FUNCTION public.is_study_host(target_session_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM study_sessions
    WHERE id = $1
    AND host_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "study_participants_host_manage" ON study_participants;

CREATE POLICY "Hosts can manage participants" ON study_participants
FOR ALL
USING (
  is_study_host(session_id)
);

-- Ensure basic participant policies exist and are simple
-- study_participants_self_read usually exists (user_id = auth.uid())
-- study_participants_join usually exists (user_id = auth.uid() for insert)

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_study_participant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_study_participant(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_study_host(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_study_host(uuid) TO service_role;
