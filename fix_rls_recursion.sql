-- Create a security definer function to check participation without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_tasting_participant(tasting_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tasting_participants
    WHERE tasting_id = $1
    AND user_id = auth.uid()
  );
$$;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Participants can view tastings" ON quick_tastings;
DROP POLICY IF EXISTS "Users can view participants of tastings they can access" ON tasting_participants;

-- Update quick_tastings policy to use the security definer function
CREATE POLICY "Participants can view tastings" ON quick_tastings
FOR SELECT
USING (
  (user_id = auth.uid()) OR  -- Owner
  is_tasting_participant(id) -- Participant (via secure function)
);

-- Update tasting_participants policy
-- Split into two simple policies to avoid complex OR logic that might confuse the planner
CREATE POLICY "Users can view own participation" ON tasting_participants
FOR SELECT
USING (
  user_id = auth.uid()
);

-- For hosts to view participants, we can check quick_tastings ownership.
-- To avoid recursion if the planner checks this policy while evaluating quick_tastings RLS:
-- We can use a security definer function for ownership too, or rely on the fact that
-- quick_tastings RLS now uses a function for participation check, breaking the loop.
-- But safest is to use a function or direct ownership check.
CREATE POLICY "Hosts can view participants" ON tasting_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM quick_tastings qt
    WHERE qt.id = tasting_participants.tasting_id
    AND qt.user_id = auth.uid()
  )
);
