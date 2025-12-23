-- Auto-generated schema from production database
-- Generated at: 2025-12-23T17:20:14.343Z

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Table: ai_extraction_logs
CREATE TABLE IF NOT EXISTS public.ai_extraction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  tasting_id UUID,
  source_type TEXT,
  input_text TEXT NOT NULL,
  input_category TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  descriptors_extracted INTEGER,
  extraction_successful BOOLEAN DEFAULT true,
  error_message TEXT,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_extraction_logs ADD CONSTRAINT ai_extraction_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

CREATE INDEX idx_ai_extraction_logs_user ON public.ai_extraction_logs USING btree (user_id, created_at DESC);
CREATE INDEX idx_ai_extraction_logs_tasting ON public.ai_extraction_logs USING btree (tasting_id);
CREATE INDEX idx_ai_extraction_logs_created ON public.ai_extraction_logs USING btree (created_at DESC);

ALTER TABLE public.ai_extraction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can insert their own extraction logs ON public.ai_extraction_logs
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY Users can view their own extraction logs ON public.ai_extraction_logs
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;


-- Table: aroma_molecules
CREATE TABLE IF NOT EXISTS public.aroma_molecules (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  descriptor TEXT NOT NULL,
  descriptor_normalized TEXT NOT NULL,
  molecules JSONB NOT NULL,
  source TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.aroma_molecules ADD CONSTRAINT aroma_molecules_descriptor_key UNIQUE (descriptor);

CREATE INDEX idx_aroma_molecules_descriptor_normalized ON public.aroma_molecules USING btree (descriptor_normalized);
CREATE INDEX idx_aroma_molecules_molecules ON public.aroma_molecules USING gin (molecules);

ALTER TABLE public.aroma_molecules ENABLE ROW LEVEL SECURITY;

CREATE POLICY Anyone can view aroma molecules ON public.aroma_molecules
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;

CREATE POLICY Service role can manage aroma molecules ON public.aroma_molecules
  AS PERMISSIVE
  FOR ALL
  USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
  WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
;


-- Table: category_taxonomies
CREATE TABLE IF NOT EXISTS public.category_taxonomies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  taxonomy_data JSONB NOT NULL,
  usage_count INTEGER DEFAULT 1,
  first_used_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.category_taxonomies ADD CONSTRAINT category_taxonomies_category_name_key UNIQUE (category_name);
ALTER TABLE public.category_taxonomies ADD CONSTRAINT category_taxonomies_first_used_by_fkey FOREIGN KEY (first_used_by) REFERENCES auth.users(id);

CREATE INDEX idx_category_taxonomies_normalized ON public.category_taxonomies USING btree (normalized_name);
CREATE INDEX idx_category_taxonomies_usage ON public.category_taxonomies USING btree (usage_count DESC);

ALTER TABLE public.category_taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY Anyone can view category taxonomies ON public.category_taxonomies
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;

CREATE POLICY Authenticated users can create category taxonomies ON public.category_taxonomies
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL))
;

CREATE POLICY Users can update their own category taxonomies ON public.category_taxonomies
  AS PERMISSIVE
  FOR UPDATE
  USING ((first_used_by = auth.uid()))
;


-- Table: competition_answer_keys
CREATE TABLE IF NOT EXISTS public.competition_answer_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL,
  item_id UUID NOT NULL,
  parameter_name TEXT NOT NULL,
  parameter_type TEXT NOT NULL,
  correct_answer JSONB NOT NULL,
  answer_options JSONB,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_answer_keys ADD CONSTRAINT competition_answer_keys_item_id_fkey FOREIGN KEY (item_id) REFERENCES quick_tasting_items(id) ON DELETE CASCADE;
ALTER TABLE public.competition_answer_keys ADD CONSTRAINT competition_answer_keys_parameter_type_check CHECK ((parameter_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'contains'::text, 'exact_match'::text, 'range'::text, 'numeric'::text])));
ALTER TABLE public.competition_answer_keys ADD CONSTRAINT competition_answer_keys_points_check CHECK (((points >= 1) AND (points <= 100)));
ALTER TABLE public.competition_answer_keys ADD CONSTRAINT competition_answer_keys_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.competition_answer_keys ADD CONSTRAINT competition_answer_keys_tasting_id_item_id_parameter_name_key UNIQUE (tasting_id, item_id, parameter_name);

CREATE INDEX idx_competition_answer_keys_tasting ON public.competition_answer_keys USING btree (tasting_id);
CREATE INDEX idx_competition_answer_keys_item ON public.competition_answer_keys USING btree (item_id);

ALTER TABLE public.competition_answer_keys ENABLE ROW LEVEL SECURITY;


-- Table: competition_item_metadata
CREATE TABLE IF NOT EXISTS public.competition_item_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL,
  item_id UUID NOT NULL,
  correct_item_name TEXT,
  correct_category TEXT,
  correct_brand TEXT,
  correct_origin TEXT,
  correct_vintage TEXT,
  additional_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item_order INTEGER DEFAULT 0,
  is_blind BOOLEAN DEFAULT false
);

ALTER TABLE public.competition_item_metadata ADD CONSTRAINT competition_item_metadata_item_id_fkey FOREIGN KEY (item_id) REFERENCES quick_tasting_items(id) ON DELETE CASCADE;
ALTER TABLE public.competition_item_metadata ADD CONSTRAINT competition_item_metadata_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.competition_item_metadata ADD CONSTRAINT competition_item_metadata_tasting_id_item_id_key UNIQUE (tasting_id, item_id);

CREATE INDEX idx_competition_item_metadata_tasting ON public.competition_item_metadata USING btree (tasting_id);

ALTER TABLE public.competition_item_metadata ENABLE ROW LEVEL SECURITY;


-- Table: competition_leaderboard
CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  max_possible_points INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC NOT NULL DEFAULT 0.00,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_leaderboard ADD CONSTRAINT competition_leaderboard_accuracy_percentage_check CHECK (((accuracy_percentage >= (0)::numeric) AND (accuracy_percentage <= (100)::numeric)));
ALTER TABLE public.competition_leaderboard ADD CONSTRAINT competition_leaderboard_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.competition_leaderboard ADD CONSTRAINT competition_leaderboard_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.competition_leaderboard ADD CONSTRAINT competition_leaderboard_tasting_id_participant_id_key UNIQUE (tasting_id, participant_id);
ALTER TABLE public.competition_leaderboard ADD CONSTRAINT competition_leaderboard_total_points_check CHECK ((total_points >= 0));

CREATE INDEX idx_competition_leaderboard_tasting ON public.competition_leaderboard USING btree (tasting_id);
CREATE INDEX idx_competition_leaderboard_rank ON public.competition_leaderboard USING btree (tasting_id, rank);

ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;


-- Table: competition_responses
CREATE TABLE IF NOT EXISTS public.competition_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  answer_key_id UUID NOT NULL,
  tasting_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_responses ADD CONSTRAINT competition_responses_answer_key_id_fkey FOREIGN KEY (answer_key_id) REFERENCES competition_answer_keys(id) ON DELETE CASCADE;
ALTER TABLE public.competition_responses ADD CONSTRAINT competition_responses_answer_key_id_participant_id_key UNIQUE (answer_key_id, participant_id);
ALTER TABLE public.competition_responses ADD CONSTRAINT competition_responses_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.competition_responses ADD CONSTRAINT competition_responses_points_earned_check CHECK ((points_earned >= 0));
ALTER TABLE public.competition_responses ADD CONSTRAINT competition_responses_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;

CREATE INDEX idx_competition_responses_tasting ON public.competition_responses USING btree (tasting_id);
CREATE INDEX idx_competition_responses_participant ON public.competition_responses USING btree (participant_id);
CREATE INDEX idx_competition_responses_answer_key ON public.competition_responses USING btree (answer_key_id);

ALTER TABLE public.competition_responses ENABLE ROW LEVEL SECURITY;


-- Table: flavor_descriptors
CREATE TABLE IF NOT EXISTS public.flavor_descriptors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  descriptor_text TEXT NOT NULL,
  descriptor_type TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  confidence_score NUMERIC,
  intensity INTEGER,
  item_name TEXT,
  item_category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  normalized_form TEXT,
  ai_extracted BOOLEAN DEFAULT false,
  extraction_model TEXT
);

ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric)));
ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_descriptor_type_check CHECK ((descriptor_type = ANY (ARRAY['aroma'::text, 'flavor'::text, 'texture'::text, 'metaphor'::text])));
ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_intensity_check CHECK (((intensity >= 1) AND (intensity <= 5)));
ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_source_type_check CHECK ((source_type = ANY (ARRAY['quick_tasting'::text, 'quick_review'::text, 'prose_review'::text])));
ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_source_type_source_id_descriptor_text_de_key UNIQUE (source_type, source_id, descriptor_text, descriptor_type);
ALTER TABLE public.flavor_descriptors ADD CONSTRAINT flavor_descriptors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_flavor_descriptors_user_id ON public.flavor_descriptors USING btree (user_id);
CREATE INDEX idx_flavor_descriptors_source ON public.flavor_descriptors USING btree (source_type, source_id);
CREATE INDEX idx_flavor_descriptors_type ON public.flavor_descriptors USING btree (descriptor_type);
CREATE INDEX idx_flavor_descriptors_category ON public.flavor_descriptors USING btree (category);
CREATE INDEX idx_flavor_descriptors_user_created ON public.flavor_descriptors USING btree (user_id, created_at DESC);
CREATE INDEX idx_flavor_descriptors_item ON public.flavor_descriptors USING btree (item_name, item_category) WHERE (item_name IS NOT NULL);
CREATE INDEX idx_flavor_descriptors_created_at ON public.flavor_descriptors USING btree (created_at DESC);
CREATE INDEX idx_flavor_descriptors_user_type ON public.flavor_descriptors USING btree (user_id, descriptor_type, created_at DESC);
CREATE INDEX idx_flavor_descriptors_text_search ON public.flavor_descriptors USING gin (to_tsvector('english'::regconfig, descriptor_text));

ALTER TABLE public.flavor_descriptors ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users and service can delete descriptors ON public.flavor_descriptors
  AS PERMISSIVE
  FOR DELETE
  USING (((auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can insert descriptors ON public.flavor_descriptors
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (((auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can update descriptors ON public.flavor_descriptors
  AS PERMISSIVE
  FOR UPDATE
  USING (((auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can view descriptors ON public.flavor_descriptors
  AS PERMISSIVE
  FOR SELECT
  USING (((auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;


-- Table: flavor_wheels
CREATE TABLE IF NOT EXISTS public.flavor_wheels (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  wheel_type TEXT NOT NULL,
  scope_type TEXT NOT NULL,
  scope_filter JSONB DEFAULT '{}'::jsonb,
  wheel_data JSONB NOT NULL,
  total_descriptors INTEGER DEFAULT 0,
  unique_descriptors INTEGER DEFAULT 0,
  data_sources_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  aggregation_scope TEXT DEFAULT 'all_categories'::text,
  descriptor_limit INTEGER DEFAULT 30
);

ALTER TABLE public.flavor_wheels ADD CONSTRAINT flavor_wheels_scope_type_check CHECK ((scope_type = ANY (ARRAY['personal'::text, 'universal'::text, 'item'::text, 'category'::text, 'tasting'::text])));
ALTER TABLE public.flavor_wheels ADD CONSTRAINT flavor_wheels_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.flavor_wheels ADD CONSTRAINT flavor_wheels_wheel_type_check CHECK ((wheel_type = ANY (ARRAY['aroma'::text, 'flavor'::text, 'combined'::text, 'metaphor'::text])));

CREATE INDEX idx_flavor_wheels_user_id ON public.flavor_wheels USING btree (user_id);
CREATE INDEX idx_flavor_wheels_scope ON public.flavor_wheels USING btree (scope_type, wheel_type);
CREATE INDEX idx_flavor_wheels_generated_at ON public.flavor_wheels USING btree (generated_at DESC);
CREATE INDEX idx_flavor_wheels_scope_filter ON public.flavor_wheels USING gin (scope_filter);
CREATE INDEX idx_flavor_wheels_user_type_scope ON public.flavor_wheels USING btree (user_id, wheel_type, scope_type);
CREATE INDEX idx_flavor_wheels_type_scope ON public.flavor_wheels USING btree (wheel_type, scope_type);

ALTER TABLE public.flavor_wheels ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users and service can delete wheels ON public.flavor_wheels
  AS PERMISSIVE
  FOR DELETE
  USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can insert wheels ON public.flavor_wheels
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (((user_id = auth.uid()) OR ((user_id IS NULL) AND (scope_type = 'universal'::text)) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can update wheels ON public.flavor_wheels
  AS PERMISSIVE
  FOR UPDATE
  USING (((user_id = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;

CREATE POLICY Users and service can view wheels ON public.flavor_wheels
  AS PERMISSIVE
  FOR SELECT
  USING (((user_id = auth.uid()) OR (scope_type = 'universal'::text) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.role() = 'service_role'::text)))
;


-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  related_user_id UUID,
  related_tasting_id UUID,
  related_review_id UUID
);

ALTER TABLE public.notifications ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['follow'::text, 'like'::text, 'comment'::text, 'tasting_invite'::text, 'achievement'::text, 'system'::text, 'review'::text])));
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read) WHERE (read = false);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_insert_notifications ON public.notifications
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (true)
;

CREATE POLICY users_delete_own_notifications ON public.notifications
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY users_read_own_notifications ON public.notifications
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;

CREATE POLICY users_update_own_notifications ON public.notifications
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;


-- Table: predefined_flavor_categories
CREATE TABLE IF NOT EXISTS public.predefined_flavor_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  color_hex TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.predefined_flavor_categories ADD CONSTRAINT predefined_flavor_categories_name_key UNIQUE (name);



-- Table: predefined_metaphor_categories
CREATE TABLE IF NOT EXISTS public.predefined_metaphor_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  color_hex TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.predefined_metaphor_categories ADD CONSTRAINT predefined_metaphor_categories_name_key UNIQUE (name);



-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  username TEXT,
  bio TEXT,
  posts_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  preferred_category TEXT,
  last_tasted_at TIMESTAMPTZ,
  email_confirmed BOOLEAN NOT NULL DEFAULT false,
  tastings_count INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  total_tastings INTEGER DEFAULT 0
);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username) WHERE (username IS NOT NULL);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY delete_own_profile ON public.profiles
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY insert_own_profile ON public.profiles
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY read_all_profiles ON public.profiles
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;

CREATE POLICY update_own_profile ON public.profiles
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY user_view_profile ON public.profiles
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;


-- Table: prose_reviews
CREATE TABLE IF NOT EXISTS public.prose_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  picture_url TEXT,
  batch_lot_barcode VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  production_date DATE,
  review_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  review_id VARCHAR(100),
  brand VARCHAR(255),
  country VARCHAR(100),
  state VARCHAR(100),
  region VARCHAR(255),
  vintage VARCHAR(4),
  batch_id VARCHAR(255),
  upc_barcode VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'::character varying,
  barcode VARCHAR(255)
);

ALTER TABLE public.prose_reviews ADD CONSTRAINT prose_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'published'::character varying])::text[])));
ALTER TABLE public.prose_reviews ADD CONSTRAINT prose_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

CREATE INDEX idx_prose_reviews_brand ON public.prose_reviews USING btree (brand);
CREATE INDEX idx_prose_reviews_user_id ON public.prose_reviews USING btree (user_id);
CREATE INDEX idx_prose_reviews_category ON public.prose_reviews USING btree (category);
CREATE INDEX idx_prose_reviews_created_at ON public.prose_reviews USING btree (created_at DESC);
CREATE INDEX idx_prose_reviews_review_id ON public.prose_reviews USING btree (review_id);
CREATE INDEX idx_prose_reviews_status ON public.prose_reviews USING btree (status);
CREATE INDEX idx_prose_reviews_review_content_search ON public.prose_reviews USING gin (to_tsvector('english'::regconfig, review_content));

ALTER TABLE public.prose_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete own prose reviews ON public.prose_reviews
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can insert own prose reviews ON public.prose_reviews
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY Users can update own prose reviews ON public.prose_reviews
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can view own prose reviews ON public.prose_reviews
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;


-- Table: quick_reviews
CREATE TABLE IF NOT EXISTS public.quick_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  picture_url TEXT,
  batch_lot_barcode VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  production_date DATE,
  aroma_notes TEXT,
  aroma_intensity INTEGER,
  salt_score INTEGER,
  salt_notes TEXT,
  umami_score INTEGER,
  umami_notes TEXT,
  spiciness_score INTEGER,
  spiciness_notes TEXT,
  acidity_score INTEGER,
  acidity_notes TEXT,
  sweetness_score INTEGER,
  sweetness_notes TEXT,
  flavor_notes TEXT,
  flavor_intensity INTEGER,
  texture_notes TEXT,
  typicity_score INTEGER,
  complexity_score INTEGER,
  other_notes TEXT,
  overall_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  review_id VARCHAR(100),
  brand VARCHAR(255),
  country VARCHAR(100),
  state VARCHAR(100),
  region VARCHAR(255),
  vintage VARCHAR(4),
  batch_id VARCHAR(255),
  upc_barcode VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'::character varying,
  barcode VARCHAR(255)
);

ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_acidity_score_check CHECK (((acidity_score IS NULL) OR ((acidity_score >= 1) AND (acidity_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_aroma_intensity_check CHECK (((aroma_intensity IS NULL) OR ((aroma_intensity >= 1) AND (aroma_intensity <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_complexity_score_check CHECK (((complexity_score IS NULL) OR ((complexity_score >= 1) AND (complexity_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_flavor_intensity_check CHECK (((flavor_intensity IS NULL) OR ((flavor_intensity >= 1) AND (flavor_intensity <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_overall_score_check CHECK (((overall_score IS NULL) OR ((overall_score >= 1) AND (overall_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_salt_score_check CHECK (((salt_score IS NULL) OR ((salt_score >= 1) AND (salt_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_spiciness_score_check CHECK (((spiciness_score IS NULL) OR ((spiciness_score >= 1) AND (spiciness_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'published'::character varying])::text[])));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_sweetness_score_check CHECK (((sweetness_score IS NULL) OR ((sweetness_score >= 1) AND (sweetness_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_typicity_score_check CHECK (((typicity_score IS NULL) OR ((typicity_score >= 1) AND (typicity_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_umami_score_check CHECK (((umami_score IS NULL) OR ((umami_score >= 1) AND (umami_score <= 100))));
ALTER TABLE public.quick_reviews ADD CONSTRAINT quick_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

CREATE INDEX idx_quick_reviews_brand ON public.quick_reviews USING btree (brand);
CREATE INDEX idx_quick_reviews_user_id ON public.quick_reviews USING btree (user_id);
CREATE INDEX idx_quick_reviews_category ON public.quick_reviews USING btree (category);
CREATE INDEX idx_quick_reviews_created_at ON public.quick_reviews USING btree (created_at DESC);
CREATE INDEX idx_quick_reviews_overall_score ON public.quick_reviews USING btree (overall_score DESC);
CREATE INDEX idx_quick_reviews_review_id ON public.quick_reviews USING btree (review_id);
CREATE INDEX idx_quick_reviews_status ON public.quick_reviews USING btree (status);

ALTER TABLE public.quick_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete own quick reviews ON public.quick_reviews
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can insert own quick reviews ON public.quick_reviews
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY Users can update own quick reviews ON public.quick_reviews
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can view own quick reviews ON public.quick_reviews
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;


-- Table: quick_tasting_items
CREATE TABLE IF NOT EXISTS public.quick_tasting_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  notes TEXT,
  flavor_scores JSONB,
  overall_score INTEGER,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  correct_answers JSONB,
  include_in_ranking BOOLEAN DEFAULT false,
  aroma TEXT,
  flavor TEXT,
  study_category_data JSONB,
  item_order INTEGER DEFAULT 0
);

ALTER TABLE public.quick_tasting_items ADD CONSTRAINT quick_tasting_items_overall_score_check CHECK (((overall_score >= 1) AND (overall_score <= 100)));
ALTER TABLE public.quick_tasting_items ADD CONSTRAINT quick_tasting_items_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;

CREATE INDEX idx_quick_tasting_items_tasting_id ON public.quick_tasting_items USING btree (tasting_id);
CREATE INDEX idx_quick_tasting_items_created_at ON public.quick_tasting_items USING btree (created_at DESC);
CREATE INDEX idx_quick_tasting_items_overall_score ON public.quick_tasting_items USING btree (overall_score) WHERE (overall_score IS NOT NULL);
CREATE INDEX idx_quick_tasting_items_study_category_data ON public.quick_tasting_items USING gin (study_category_data);
CREATE INDEX idx_quick_tasting_items_order ON public.quick_tasting_items USING btree (tasting_id, item_order);
CREATE INDEX idx_quick_tasting_items_aroma ON public.quick_tasting_items USING btree (aroma);
CREATE INDEX idx_quick_tasting_items_flavor ON public.quick_tasting_items USING btree (flavor);
CREATE INDEX idx_quick_tasting_items_tasting_created ON public.quick_tasting_items USING btree (tasting_id, created_at);
CREATE INDEX idx_quick_tasting_items_name_search ON public.quick_tasting_items USING gin (to_tsvector('english'::regconfig, item_name));

ALTER TABLE public.quick_tasting_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete their own quick tasting items ON public.quick_tasting_items
  AS PERMISSIVE
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = quick_tasting_items.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can insert their own quick tasting items ON public.quick_tasting_items
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = quick_tasting_items.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can update their own quick tasting items ON public.quick_tasting_items
  AS PERMISSIVE
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = quick_tasting_items.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can view their own quick tasting items ON public.quick_tasting_items
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = quick_tasting_items.tasting_id) AND (qt.user_id = auth.uid())))))
;


-- Table: quick_tastings
CREATE TABLE IF NOT EXISTS public.quick_tastings (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  session_name TEXT,
  notes TEXT,
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  average_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  mode TEXT NOT NULL DEFAULT 'study'::text,
  rank_participants BOOLEAN DEFAULT false,
  ranking_type TEXT,
  is_blind_participants BOOLEAN DEFAULT false,
  is_blind_items BOOLEAN DEFAULT false,
  is_blind_attributes BOOLEAN DEFAULT false,
  study_approach TEXT,
  custom_category_name TEXT,
  taxonomy_id UUID,
  auto_flavor_wheel BOOLEAN DEFAULT true
);

ALTER TABLE public.quick_tastings ADD CONSTRAINT quick_tastings_mode_check CHECK ((mode = ANY (ARRAY['study'::text, 'competition'::text, 'quick'::text])));
ALTER TABLE public.quick_tastings ADD CONSTRAINT quick_tastings_study_approach_check CHECK ((study_approach = ANY (ARRAY['predefined'::text, 'collaborative'::text])));
ALTER TABLE public.quick_tastings ADD CONSTRAINT quick_tastings_taxonomy_id_fkey FOREIGN KEY (taxonomy_id) REFERENCES category_taxonomies(id);
ALTER TABLE public.quick_tastings ADD CONSTRAINT quick_tastings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.quick_tastings ADD CONSTRAINT quick_tastings_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

CREATE INDEX idx_quick_tastings_created_incomplete ON public.quick_tastings USING btree (created_at) WHERE (completed_at IS NULL);
CREATE INDEX idx_quick_tastings_updated_at ON public.quick_tastings USING btree (updated_at DESC);
CREATE INDEX idx_quick_tastings_user_id ON public.quick_tastings USING btree (user_id);
CREATE INDEX idx_quick_tastings_category ON public.quick_tastings USING btree (category);
CREATE INDEX idx_quick_tastings_created_at ON public.quick_tastings USING btree (created_at DESC);
CREATE INDEX idx_quick_tastings_completed_at ON public.quick_tastings USING btree (completed_at DESC) WHERE (completed_at IS NOT NULL);
CREATE INDEX idx_quick_tastings_user_created ON public.quick_tastings USING btree (user_id, created_at DESC);
CREATE INDEX idx_quick_tastings_user_incomplete ON public.quick_tastings USING btree (user_id, completed_at) WHERE (completed_at IS NULL);
CREATE INDEX idx_quick_tastings_user_category_created ON public.quick_tastings USING btree (user_id, category, created_at DESC);
CREATE INDEX idx_quick_tastings_mode ON public.quick_tastings USING btree (mode);

ALTER TABLE public.quick_tastings ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete their own quick tastings ON public.quick_tastings
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can insert their own quick tastings ON public.quick_tastings
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY Users can update their own quick tastings ON public.quick_tastings
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can view their own quick tastings ON public.quick_tastings
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;


-- Table: study_ai_cache
CREATE TABLE IF NOT EXISTS public.study_ai_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  participant_id UUID,
  item_id UUID,
  input_text TEXT NOT NULL,
  input_hash TEXT,
  extracted_descriptors JSONB NOT NULL,
  method TEXT NOT NULL DEFAULT 'llm'::text,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_ai_cache ADD CONSTRAINT study_ai_cache_input_hash_key UNIQUE (input_hash);
ALTER TABLE public.study_ai_cache ADD CONSTRAINT study_ai_cache_item_id_fkey FOREIGN KEY (item_id) REFERENCES study_items(id) ON DELETE SET NULL;
ALTER TABLE public.study_ai_cache ADD CONSTRAINT study_ai_cache_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES study_participants(id) ON DELETE SET NULL;
ALTER TABLE public.study_ai_cache ADD CONSTRAINT study_ai_cache_session_id_fkey FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_study_ai_cache_session_id ON public.study_ai_cache USING btree (session_id);
CREATE INDEX idx_study_ai_cache_item_id ON public.study_ai_cache USING btree (item_id);
CREATE INDEX idx_study_ai_cache_session ON public.study_ai_cache USING btree (session_id);

ALTER TABLE public.study_ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY Service role can manage AI cache ON public.study_ai_cache
  AS PERMISSIVE
  FOR ALL
  USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
;

CREATE POLICY Users can view AI cache for sessions they can access ON public.study_ai_cache
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_ai_cache.session_id) AND ((ss.host_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM study_participants sp
          WHERE ((sp.session_id = ss.id) AND (sp.user_id = auth.uid())))))))))
;

CREATE POLICY study_ai_cache_host_read ON public.study_ai_cache
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_ai_cache.session_id) AND (study_sessions.host_id = auth.uid())))))
;

CREATE POLICY study_ai_cache_participant_read_self ON public.study_ai_cache
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.id = study_ai_cache.participant_id) AND (study_participants.user_id = auth.uid())))))
;

CREATE POLICY study_ai_cache_system_write ON public.study_ai_cache
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (true)
;


-- Table: study_categories
CREATE TABLE IF NOT EXISTS public.study_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  name TEXT NOT NULL,
  has_text BOOLEAN DEFAULT false,
  has_scale BOOLEAN DEFAULT false,
  has_boolean BOOLEAN DEFAULT false,
  scale_max INTEGER DEFAULT 100,
  rank_in_summary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.study_categories ADD CONSTRAINT study_categories_scale_max_check CHECK (((scale_max >= 5) AND (scale_max <= 100)));
ALTER TABLE public.study_categories ADD CONSTRAINT study_categories_session_id_fkey FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_study_categories_session_id ON public.study_categories USING btree (session_id);
CREATE INDEX idx_study_categories_sort_order ON public.study_categories USING btree (session_id, sort_order);

ALTER TABLE public.study_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY Hosts can manage categories for their sessions ON public.study_categories
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_categories.session_id) AND (ss.host_id = auth.uid())))))
;

CREATE POLICY Users can view categories for sessions they can access ON public.study_categories
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_categories.session_id) AND ((ss.host_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM study_participants sp
          WHERE ((sp.session_id = ss.id) AND (sp.user_id = auth.uid())))))))))
;

CREATE POLICY study_categories_host_manage ON public.study_categories
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_categories.session_id) AND (study_sessions.host_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_categories.session_id) AND (study_sessions.host_id = auth.uid())))))
;

CREATE POLICY study_categories_participants_read ON public.study_categories
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.session_id = study_categories.session_id) AND (study_participants.user_id = auth.uid())))))
;


-- Table: study_items
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_by UUID
);

ALTER TABLE public.study_items ADD CONSTRAINT study_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.study_items ADD CONSTRAINT study_items_session_id_fkey FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_study_items_session_id ON public.study_items USING btree (session_id);

ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY Hosts can manage items in their sessions ON public.study_items
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_items.session_id) AND (ss.host_id = auth.uid())))))
;

CREATE POLICY Users can view items in sessions they can access ON public.study_items
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_items.session_id) AND ((ss.host_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM study_participants sp
          WHERE ((sp.session_id = ss.id) AND (sp.user_id = auth.uid())))))))))
;

CREATE POLICY study_items_host_manage ON public.study_items
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_items.session_id) AND (study_sessions.host_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_items.session_id) AND (study_sessions.host_id = auth.uid())))))
;

CREATE POLICY study_items_participants_read ON public.study_items
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.session_id = study_items.session_id) AND (study_participants.user_id = auth.uid())))))
;


-- Table: study_participants
CREATE TABLE IF NOT EXISTS public.study_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'participant'::text,
  joined_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0
);

ALTER TABLE public.study_participants ADD CONSTRAINT study_participants_role_check CHECK ((role = ANY (ARRAY['host'::text, 'participant'::text])));
ALTER TABLE public.study_participants ADD CONSTRAINT study_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.study_participants ADD CONSTRAINT study_participants_session_id_user_id_key UNIQUE (session_id, user_id);
ALTER TABLE public.study_participants ADD CONSTRAINT study_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

CREATE INDEX idx_study_participants_session_id ON public.study_participants USING btree (session_id);
CREATE INDEX idx_study_participants_user_id ON public.study_participants USING btree (user_id);

ALTER TABLE public.study_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can join sessions ON public.study_participants
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;

CREATE POLICY Users can leave sessions ON public.study_participants
  AS PERMISSIVE
  FOR DELETE
  USING ((user_id = auth.uid()))
;

CREATE POLICY Users can view participants in sessions they can access ON public.study_participants
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_participants.session_id) AND ((ss.host_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM study_participants sp
          WHERE ((sp.session_id = ss.id) AND (sp.user_id = auth.uid())))))))))
;

CREATE POLICY study_participants_host_manage ON public.study_participants
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_participants.session_id) AND (study_sessions.host_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_participants.session_id) AND (study_sessions.host_id = auth.uid())))))
;

CREATE POLICY study_participants_join ON public.study_participants
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((user_id = auth.uid()))
;

CREATE POLICY study_participants_self_read ON public.study_participants
  AS PERMISSIVE
  FOR SELECT
  USING ((user_id = auth.uid()))
;


-- Table: study_responses
CREATE TABLE IF NOT EXISTS public.study_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  item_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  category_id UUID NOT NULL,
  text_value TEXT,
  scale_value INTEGER,
  bool_value BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_responses ADD CONSTRAINT study_responses_category_id_fkey FOREIGN KEY (category_id) REFERENCES study_categories(id) ON DELETE CASCADE;
ALTER TABLE public.study_responses ADD CONSTRAINT study_responses_item_id_fkey FOREIGN KEY (item_id) REFERENCES study_items(id) ON DELETE CASCADE;
ALTER TABLE public.study_responses ADD CONSTRAINT study_responses_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES study_participants(id) ON DELETE CASCADE;
ALTER TABLE public.study_responses ADD CONSTRAINT study_responses_scale_value_check CHECK (((scale_value >= 0) AND (scale_value <= 100)));
ALTER TABLE public.study_responses ADD CONSTRAINT study_responses_session_id_fkey FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_responses_session_item_participant_cat ON public.study_responses USING btree (session_id, item_id, participant_id, category_id);
CREATE INDEX idx_study_responses_session_item ON public.study_responses USING btree (session_id, item_id);
CREATE INDEX idx_study_responses_participant ON public.study_responses USING btree (participant_id);

ALTER TABLE public.study_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can manage their own responses ON public.study_responses
  AS PERMISSIVE
  FOR ALL
  USING ((participant_id IN ( SELECT study_participants.id
   FROM study_participants
  WHERE (study_participants.user_id = auth.uid()))))
;

CREATE POLICY Users can view responses in sessions they can access ON public.study_responses
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions ss
  WHERE ((ss.id = study_responses.session_id) AND ((ss.host_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM study_participants sp
          WHERE ((sp.session_id = ss.id) AND (sp.user_id = auth.uid())))))))))
;

CREATE POLICY study_responses_host_read ON public.study_responses
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_sessions
  WHERE ((study_sessions.id = study_responses.session_id) AND (study_sessions.host_id = auth.uid())))))
;

CREATE POLICY study_responses_self_manage ON public.study_responses
  AS PERMISSIVE
  FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.id = study_responses.participant_id) AND (study_participants.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.id = study_responses.participant_id) AND (study_participants.user_id = auth.uid())))))
;


-- Table: study_sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_category TEXT NOT NULL,
  host_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'::text,
  session_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_sessions ADD CONSTRAINT study_sessions_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.study_sessions ADD CONSTRAINT study_sessions_session_code_key UNIQUE (session_code);
ALTER TABLE public.study_sessions ADD CONSTRAINT study_sessions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'finished'::text])));

CREATE INDEX idx_study_sessions_host_id ON public.study_sessions USING btree (host_id);
CREATE INDEX idx_study_sessions_status ON public.study_sessions USING btree (status);
CREATE INDEX idx_study_sessions_code ON public.study_sessions USING btree (session_code);
CREATE INDEX idx_study_sessions_session_code ON public.study_sessions USING btree (session_code);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY Hosts can delete their sessions ON public.study_sessions
  AS PERMISSIVE
  FOR DELETE
  USING ((host_id = auth.uid()))
;

CREATE POLICY Hosts can update their sessions ON public.study_sessions
  AS PERMISSIVE
  FOR UPDATE
  USING ((host_id = auth.uid()))
;

CREATE POLICY Users can create their own sessions ON public.study_sessions
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((host_id = auth.uid()))
;

CREATE POLICY Users can view sessions they host or participate in ON public.study_sessions
  AS PERMISSIVE
  FOR SELECT
  USING (((host_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM study_participants sp
  WHERE ((sp.session_id = study_sessions.id) AND (sp.user_id = auth.uid()))))))
;

CREATE POLICY study_sessions_host_manage ON public.study_sessions
  AS PERMISSIVE
  FOR ALL
  USING ((auth.uid() = host_id))
  WITH CHECK ((auth.uid() = host_id))
;

CREATE POLICY study_sessions_participants_read ON public.study_sessions
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM study_participants
  WHERE ((study_participants.session_id = study_sessions.id) AND (study_participants.user_id = auth.uid())))))
;


-- Table: study_templates
CREATE TABLE IF NOT EXISTS public.study_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  base_category TEXT NOT NULL,
  categories JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_templates ADD CONSTRAINT study_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


ALTER TABLE public.study_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete their own templates ON public.study_templates
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can insert their own templates ON public.study_templates
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY Users can update their own templates ON public.study_templates
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;

CREATE POLICY Users can view their own templates ON public.study_templates
  AS PERMISSIVE
  FOR SELECT
  USING ((auth.uid() = user_id))
;


-- Table: tasting_comments
CREATE TABLE IF NOT EXISTS public.tasting_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tasting_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasting_comments ADD CONSTRAINT tasting_comments_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.tasting_comments ADD CONSTRAINT tasting_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_tasting_comments_tasting_id ON public.tasting_comments USING btree (tasting_id);
CREATE INDEX idx_tasting_comments_user_id ON public.tasting_comments USING btree (user_id);

ALTER TABLE public.tasting_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasting_comments_delete_policy ON public.tasting_comments
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY tasting_comments_insert_policy ON public.tasting_comments
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY tasting_comments_select_policy ON public.tasting_comments
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;

CREATE POLICY tasting_comments_update_policy ON public.tasting_comments
  AS PERMISSIVE
  FOR UPDATE
  USING ((auth.uid() = user_id))
;


-- Table: tasting_item_suggestions
CREATE TABLE IF NOT EXISTS public.tasting_item_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL,
  suggested_item_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'::text,
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tasting_item_suggestions ADD CONSTRAINT tasting_item_suggestions_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES auth.users(id);
ALTER TABLE public.tasting_item_suggestions ADD CONSTRAINT tasting_item_suggestions_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES tasting_participants(id) ON DELETE CASCADE;
ALTER TABLE public.tasting_item_suggestions ADD CONSTRAINT tasting_item_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

CREATE INDEX idx_tasting_item_suggestions_participant_id ON public.tasting_item_suggestions USING btree (participant_id);
CREATE INDEX idx_tasting_item_suggestions_status ON public.tasting_item_suggestions USING btree (status);

ALTER TABLE public.tasting_item_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY Hosts can moderate suggestions for their tastings ON public.tasting_item_suggestions
  AS PERMISSIVE
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM (tasting_participants tp
     JOIN quick_tastings qt ON ((qt.id = tp.tasting_id)))
  WHERE ((tp.id = tasting_item_suggestions.participant_id) AND (qt.user_id = auth.uid()) AND (tp.can_moderate = true)))))
;

CREATE POLICY Users can create suggestions for tastings they participate in ON public.tasting_item_suggestions
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM tasting_participants tp
  WHERE ((tp.id = tasting_item_suggestions.participant_id) AND (tp.user_id = auth.uid()) AND (tp.can_add_items = true)))))
;

CREATE POLICY Users can view suggestions for tastings they participate in ON public.tasting_item_suggestions
  AS PERMISSIVE
  FOR SELECT
  USING (((EXISTS ( SELECT 1
   FROM tasting_participants tp
  WHERE ((tp.id = tasting_item_suggestions.participant_id) AND (tp.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (tasting_participants tp
     JOIN quick_tastings qt ON ((qt.id = tp.tasting_id)))
  WHERE ((tp.id = tasting_item_suggestions.participant_id) AND (qt.user_id = auth.uid()))))))
;


-- Table: tasting_likes
CREATE TABLE IF NOT EXISTS public.tasting_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tasting_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasting_likes ADD CONSTRAINT tasting_likes_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.tasting_likes ADD CONSTRAINT tasting_likes_unique UNIQUE (user_id, tasting_id);
ALTER TABLE public.tasting_likes ADD CONSTRAINT tasting_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_tasting_likes_tasting_id ON public.tasting_likes USING btree (tasting_id);
CREATE INDEX idx_tasting_likes_user_id ON public.tasting_likes USING btree (user_id);
CREATE INDEX idx_tasting_likes_user_tasting ON public.tasting_likes USING btree (user_id, tasting_id);

ALTER TABLE public.tasting_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasting_likes_delete_policy ON public.tasting_likes
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY tasting_likes_insert_policy ON public.tasting_likes
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY tasting_likes_select_policy ON public.tasting_likes
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;


-- Table: tasting_participants
CREATE TABLE IF NOT EXISTS public.tasting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL,
  user_id UUID NOT NULL,
  score INTEGER,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'participant'::text,
  can_moderate BOOLEAN DEFAULT false,
  can_add_items BOOLEAN DEFAULT false
);

ALTER TABLE public.tasting_participants ADD CONSTRAINT tasting_participants_role_check CHECK ((role = ANY (ARRAY['host'::text, 'participant'::text, 'both'::text])));
ALTER TABLE public.tasting_participants ADD CONSTRAINT tasting_participants_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.tasting_participants ADD CONSTRAINT tasting_participants_tasting_id_user_id_key UNIQUE (tasting_id, user_id);
ALTER TABLE public.tasting_participants ADD CONSTRAINT tasting_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_tasting_participants_tasting_id ON public.tasting_participants USING btree (tasting_id);
CREATE INDEX idx_tasting_participants_user_id ON public.tasting_participants USING btree (user_id);
CREATE INDEX idx_tasting_participants_tasting_user ON public.tasting_participants USING btree (tasting_id, user_id);

ALTER TABLE public.tasting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY Users can delete participants for tastings they own ON public.tasting_participants
  AS PERMISSIVE
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = tasting_participants.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can insert participants for tastings they own ON public.tasting_participants
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = tasting_participants.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can update participants for tastings they own ON public.tasting_participants
  AS PERMISSIVE
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = tasting_participants.tasting_id) AND (qt.user_id = auth.uid())))))
;

CREATE POLICY Users can view participants of tastings they can access ON public.tasting_participants
  AS PERMISSIVE
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM quick_tastings qt
  WHERE ((qt.id = tasting_participants.tasting_id) AND (qt.user_id = auth.uid())))))
;


-- Table: tasting_shares
CREATE TABLE IF NOT EXISTS public.tasting_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tasting_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasting_shares ADD CONSTRAINT tasting_shares_tasting_id_fkey FOREIGN KEY (tasting_id) REFERENCES quick_tastings(id) ON DELETE CASCADE;
ALTER TABLE public.tasting_shares ADD CONSTRAINT tasting_shares_unique UNIQUE (user_id, tasting_id);
ALTER TABLE public.tasting_shares ADD CONSTRAINT tasting_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_tasting_shares_tasting_id ON public.tasting_shares USING btree (tasting_id);
CREATE INDEX idx_tasting_shares_user_id ON public.tasting_shares USING btree (user_id);

ALTER TABLE public.tasting_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasting_shares_delete_policy ON public.tasting_shares
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = user_id))
;

CREATE POLICY tasting_shares_insert_policy ON public.tasting_shares
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id))
;

CREATE POLICY tasting_shares_select_policy ON public.tasting_shares
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;


-- Table: user_follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_follows ADD CONSTRAINT no_self_follow CHECK ((follower_id <> following_id));
ALTER TABLE public.user_follows ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_follows ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_follows ADD CONSTRAINT user_follows_unique UNIQUE (follower_id, following_id);

CREATE INDEX idx_user_follows_follower_id ON public.user_follows USING btree (follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows USING btree (following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_follows_delete_policy ON public.user_follows
  AS PERMISSIVE
  FOR DELETE
  USING ((auth.uid() = follower_id))
;

CREATE POLICY user_follows_insert_policy ON public.user_follows
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK ((auth.uid() = follower_id))
;

CREATE POLICY user_follows_select_policy ON public.user_follows
  AS PERMISSIVE
  FOR SELECT
  USING (true)
;



