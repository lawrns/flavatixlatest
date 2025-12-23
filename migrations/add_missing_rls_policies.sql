-- Add Missing RLS Policies
-- This migration adds RLS policies that are missing from the database
-- Generated: 2025-12-23

-- ============================================================================
-- COMPETITION TABLES - CRITICAL: These tables have RLS enabled but no policies
-- ============================================================================

-- Competition Answer Keys: Only host can manage
DROP POLICY IF EXISTS "competition_answer_keys_host_full_access" ON public.competition_answer_keys;
CREATE POLICY "competition_answer_keys_host_full_access"
  ON public.competition_answer_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_tastings qt
      WHERE qt.id = competition_answer_keys.tasting_id
      AND qt.user_id = auth.uid()
    )
  );

-- Competition Responses: Participants can create their own, view their own, hosts can view all
DROP POLICY IF EXISTS "competition_responses_participant_insert" ON public.competition_responses;
CREATE POLICY "competition_responses_participant_insert"
  ON public.competition_responses
  FOR INSERT
  WITH CHECK (auth.uid() = participant_id);

DROP POLICY IF EXISTS "competition_responses_participant_select" ON public.competition_responses;
CREATE POLICY "competition_responses_participant_select"
  ON public.competition_responses
  FOR SELECT
  USING (
    auth.uid() = participant_id
    OR EXISTS (
      SELECT 1 FROM public.quick_tastings qt
      WHERE qt.id = competition_responses.tasting_id
      AND qt.user_id = auth.uid()
    )
  );

-- Competition Leaderboard: Everyone in the tasting can view
DROP POLICY IF EXISTS "competition_leaderboard_select" ON public.competition_leaderboard;
CREATE POLICY "competition_leaderboard_select"
  ON public.competition_leaderboard
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_tastings qt
      WHERE qt.id = competition_leaderboard.tasting_id
      AND (
        qt.user_id = auth.uid()
        OR auth.uid() IN (
          SELECT participant_id FROM public.competition_responses
          WHERE tasting_id = qt.id
        )
      )
    )
  );

-- Competition Item Metadata: Only host can manage
DROP POLICY IF EXISTS "competition_item_metadata_host_full_access" ON public.competition_item_metadata;
CREATE POLICY "competition_item_metadata_host_full_access"
  ON public.competition_item_metadata
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_tastings qt
      WHERE qt.id = competition_item_metadata.tasting_id
      AND qt.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ADDITIONAL POLICIES FOR OTHER TABLES
-- ============================================================================

-- AI Extraction Logs: Allow users to update/delete their own logs
DROP POLICY IF EXISTS "Users can update their own extraction logs" ON public.ai_extraction_logs;
CREATE POLICY "Users can update their own extraction logs"
  ON public.ai_extraction_logs
  FOR UPDATE
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users can delete their own extraction logs" ON public.ai_extraction_logs;
CREATE POLICY "Users can delete their own extraction logs"
  ON public.ai_extraction_logs
  FOR DELETE
  USING ((auth.uid() = user_id));

-- Category Taxonomies: Allow users to delete their own taxonomies
DROP POLICY IF EXISTS "Users can delete their own category taxonomies" ON public.category_taxonomies;
CREATE POLICY "Users can delete their own category taxonomies"
  ON public.category_taxonomies
  FOR DELETE
  USING ((first_used_by = auth.uid()));

-- Tasting Item Suggestions: Allow users to delete their own suggestions
DROP POLICY IF EXISTS "Users can delete their own suggestions" ON public.tasting_item_suggestions;
CREATE POLICY "Users can delete their own suggestions"
  ON public.tasting_item_suggestions
  FOR DELETE
  USING ((
    EXISTS (
      SELECT 1 FROM tasting_participants tp
      WHERE tp.id = tasting_item_suggestions.participant_id
      AND tp.user_id = auth.uid()
    )
  ));

-- Note: Tables like tasting_likes, tasting_shares, user_follows don't need UPDATE policies
-- as they are insert-only relationships (you insert to follow/like, delete to unfollow/unlike)

