-- Add Missing Foreign Key Indexes
-- This migration adds indexes on foreign keys that are missing indexes
-- Generated: 2025-12-23

-- Index on notifications.related_user_id
CREATE INDEX IF NOT EXISTS idx_notifications_related_user_id
  ON public.notifications(related_user_id);

-- Index on quick_tastings.taxonomy_id
CREATE INDEX IF NOT EXISTS idx_quick_tastings_taxonomy_id
  ON public.quick_tastings(taxonomy_id);

-- Index on study_ai_cache.participant_id
CREATE INDEX IF NOT EXISTS idx_study_ai_cache_participant_id
  ON public.study_ai_cache(participant_id);

