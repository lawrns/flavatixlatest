-- Competition Mode Database Schema
-- Creates tables and functions for competition mode functionality
-- Author: Flavatix Development Team
-- Date: November 26, 2025

-- ============================================================================
-- COMPETITION ANSWER KEYS
-- Stores correct answers set by the host for each item and parameter
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competition_answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.quick_tasting_items(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  parameter_type TEXT NOT NULL CHECK (parameter_type IN ('multiple_choice', 'true_false', 'contains', 'exact_match', 'range', 'numeric')),
  correct_answer JSONB NOT NULL, -- Flexible storage for any answer type
  answer_options JSONB, -- For multiple choice: array of options
  points INTEGER NOT NULL DEFAULT 1 CHECK (points >= 1 AND points <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique parameter per item
  UNIQUE(tasting_id, item_id, parameter_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competition_answer_keys_tasting 
  ON public.competition_answer_keys(tasting_id);
CREATE INDEX IF NOT EXISTS idx_competition_answer_keys_item 
  ON public.competition_answer_keys(item_id);

-- ============================================================================
-- COMPETITION RESPONSES
-- Stores participant answers to competition parameters
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competition_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_key_id UUID NOT NULL REFERENCES public.competition_answer_keys(id) ON DELETE CASCADE,
  tasting_id UUID NOT NULL REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one response per participant per answer key
  UNIQUE(answer_key_id, participant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competition_responses_tasting 
  ON public.competition_responses(tasting_id);
CREATE INDEX IF NOT EXISTS idx_competition_responses_participant 
  ON public.competition_responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_competition_responses_answer_key 
  ON public.competition_responses(answer_key_id);

-- ============================================================================
-- COMPETITION LEADERBOARD
-- Aggregated scores and rankings for participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  max_possible_points INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one leaderboard entry per participant per tasting
  UNIQUE(tasting_id, participant_id)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_competition_leaderboard_tasting 
  ON public.competition_leaderboard(tasting_id);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboard_rank 
  ON public.competition_leaderboard(tasting_id, rank);

-- ============================================================================
-- COMPETITION ITEM METADATA
-- Additional metadata for competition items (correct item info)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competition_item_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES public.quick_tastings(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.quick_tasting_items(id) ON DELETE CASCADE,
  correct_item_name TEXT,
  correct_category TEXT,
  correct_brand TEXT,
  correct_origin TEXT,
  correct_vintage TEXT,
  additional_info JSONB, -- Flexible field for any extra correct information
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(tasting_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_item_metadata_tasting 
  ON public.competition_item_metadata(tasting_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate and update leaderboard for a tasting
CREATE OR REPLACE FUNCTION public.update_competition_leaderboard(p_tasting_id UUID)
RETURNS void AS $$
DECLARE
  v_participant RECORD;
  v_rank INTEGER := 1;
  v_prev_points INTEGER := NULL;
  v_current_rank INTEGER := 1;
BEGIN
  -- Calculate scores for each participant
  FOR v_participant IN
    SELECT 
      cr.participant_id,
      COALESCE(SUM(cr.points_earned), 0) AS total_points,
      COALESCE(SUM(ak.points), 0) AS max_possible_points,
      COUNT(*) FILTER (WHERE cr.is_correct = TRUE) AS correct_answers,
      COUNT(*) AS total_answers
    FROM public.competition_responses cr
    JOIN public.competition_answer_keys ak ON cr.answer_key_id = ak.id
    WHERE cr.tasting_id = p_tasting_id
    GROUP BY cr.participant_id
    ORDER BY total_points DESC, correct_answers DESC
  LOOP
    -- Assign rank (handle ties)
    IF v_prev_points IS NULL OR v_participant.total_points < v_prev_points THEN
      v_rank := v_current_rank;
    END IF;
    
    -- Insert or update leaderboard entry
    INSERT INTO public.competition_leaderboard (
      tasting_id,
      participant_id,
      total_points,
      max_possible_points,
      accuracy_percentage,
      correct_answers,
      total_answers,
      rank,
      updated_at
    ) VALUES (
      p_tasting_id,
      v_participant.participant_id,
      v_participant.total_points,
      v_participant.max_possible_points,
      CASE 
        WHEN v_participant.max_possible_points > 0 
        THEN (v_participant.total_points::DECIMAL / v_participant.max_possible_points * 100)
        ELSE 0 
      END,
      v_participant.correct_answers,
      v_participant.total_answers,
      v_rank,
      NOW()
    )
    ON CONFLICT (tasting_id, participant_id)
    DO UPDATE SET
      total_points = EXCLUDED.total_points,
      max_possible_points = EXCLUDED.max_possible_points,
      accuracy_percentage = EXCLUDED.accuracy_percentage,
      correct_answers = EXCLUDED.correct_answers,
      total_answers = EXCLUDED.total_answers,
      rank = EXCLUDED.rank,
      updated_at = NOW();
    
    v_prev_points := v_participant.total_points;
    v_current_rank := v_current_rank + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to score a response
CREATE OR REPLACE FUNCTION public.score_competition_response(
  p_response_id UUID
)
RETURNS TABLE(is_correct BOOLEAN, points_earned INTEGER) AS $$
DECLARE
  v_response RECORD;
  v_answer_key RECORD;
  v_is_correct BOOLEAN := FALSE;
  v_points INTEGER := 0;
BEGIN
  -- Get response and answer key
  SELECT cr.*, ak.*
  INTO v_response
  FROM public.competition_responses cr
  JOIN public.competition_answer_keys ak ON cr.answer_key_id = ak.id
  WHERE cr.id = p_response_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response not found';
  END IF;
  
  -- Score based on parameter type
  CASE v_response.parameter_type
    WHEN 'exact_match' THEN
      v_is_correct := LOWER(v_response.answer::TEXT) = LOWER(v_response.correct_answer::TEXT);
      
    WHEN 'true_false' THEN
      v_is_correct := v_response.answer::BOOLEAN = v_response.correct_answer::BOOLEAN;
      
    WHEN 'multiple_choice' THEN
      v_is_correct := v_response.answer::TEXT = v_response.correct_answer::TEXT;
      
    WHEN 'contains' THEN
      v_is_correct := LOWER(v_response.answer::TEXT) LIKE '%' || LOWER(v_response.correct_answer::TEXT) || '%';
      
    WHEN 'range' THEN
      v_is_correct := (v_response.answer::NUMERIC >= (v_response.correct_answer->>'min')::NUMERIC) AND
                      (v_response.answer::NUMERIC <= (v_response.correct_answer->>'max')::NUMERIC);
      
    WHEN 'numeric' THEN
      v_is_correct := ABS((v_response.answer::NUMERIC - v_response.correct_answer::NUMERIC)) < 0.01;
      
    ELSE
      v_is_correct := FALSE;
  END CASE;
  
  -- Assign points
  IF v_is_correct THEN
    v_points := v_response.points;
  END IF;
  
  -- Update response
  UPDATE public.competition_responses
  SET 
    is_correct = v_is_correct,
    points_earned = v_points
  WHERE id = p_response_id;
  
  RETURN QUERY SELECT v_is_correct, v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.competition_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_item_metadata ENABLE ROW LEVEL SECURITY;

-- Answer Keys: Only host can create/update, participants can't see
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

-- Responses: Participants can create their own, view their own, hosts can view all
CREATE POLICY "competition_responses_participant_insert"
  ON public.competition_responses
  FOR INSERT
  WITH CHECK (auth.uid() = participant_id);

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

-- Leaderboard: Everyone in the tasting can view
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

-- Item Metadata: Only host can manage
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
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competition_answer_keys_updated_at
  BEFORE UPDATE ON public.competition_answer_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competition_item_metadata_updated_at
  BEFORE UPDATE ON public.competition_item_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update leaderboard when response is scored
CREATE OR REPLACE FUNCTION public.trigger_update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_competition_leaderboard(NEW.tasting_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaderboard_on_response
  AFTER INSERT OR UPDATE ON public.competition_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_leaderboard();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.competition_answer_keys IS 'Stores correct answers set by host for competition mode';
COMMENT ON TABLE public.competition_responses IS 'Stores participant answers and scoring results';
COMMENT ON TABLE public.competition_leaderboard IS 'Aggregated participant scores and rankings';
COMMENT ON TABLE public.competition_item_metadata IS 'Correct information about competition items';

COMMENT ON FUNCTION public.update_competition_leaderboard IS 'Recalculates and updates leaderboard for a competition';
COMMENT ON FUNCTION public.score_competition_response IS 'Scores a single response and returns correctness and points';

