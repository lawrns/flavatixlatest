-- AI-Powered Flavor Wheels - Database Schema Migration
-- This migration creates tables for AI descriptor extraction and custom category taxonomies

-- ============================================================================
-- TABLE: category_taxonomies
-- Stores AI-generated flavor taxonomies for custom categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS category_taxonomies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Category information
    category_name TEXT NOT NULL UNIQUE,
    normalized_name TEXT NOT NULL,

    -- AI-generated taxonomy
    taxonomy_data JSONB NOT NULL,
    -- Structure:
    -- {
    --   "baseTemplate": "spirits",
    --   "aromaCategories": ["Fruity", "Floral", "Fermented", "Herbal"],
    --   "flavorCategories": ["Sweet", "Sour", "Tart", "Effervescent"],
    --   "typicalDescriptors": ["vinegary", "apple cider", "yeasty", "tangy"],
    --   "textureNotes": ["carbonated", "effervescent", "acidic mouthfeel"],
    --   "aiModel": "claude-haiku-3.5",
    --   "generatedAt": "2025-10-15T12:00:00Z"
    -- }

    -- Usage statistics
    usage_count INTEGER DEFAULT 1,
    first_used_by UUID REFERENCES auth.users(id),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_extraction_logs
-- Track AI processing for monitoring and debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_extraction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Request info
    user_id UUID REFERENCES auth.users(id),
    tasting_id UUID,
    source_type TEXT,

    -- Input data
    input_text TEXT NOT NULL,
    input_category TEXT,

    -- AI processing
    model_used TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,

    -- Output
    descriptors_extracted INTEGER,
    extraction_successful BOOLEAN DEFAULT true,
    error_message TEXT,

    -- Result data (for debugging)
    raw_ai_response JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for category_taxonomies
CREATE INDEX IF NOT EXISTS idx_category_taxonomies_normalized ON category_taxonomies(normalized_name);
CREATE INDEX IF NOT EXISTS idx_category_taxonomies_usage ON category_taxonomies(usage_count DESC);

-- Indexes for ai_extraction_logs
CREATE INDEX IF NOT EXISTS idx_ai_extraction_logs_user ON ai_extraction_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_extraction_logs_tasting ON ai_extraction_logs(tasting_id);
CREATE INDEX IF NOT EXISTS idx_ai_extraction_logs_created ON ai_extraction_logs(created_at DESC);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add AI-related columns to flavor_descriptors
ALTER TABLE flavor_descriptors
ADD COLUMN IF NOT EXISTS normalized_form TEXT,
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extraction_model TEXT;

-- Add category taxonomy reference to quick_tastings
ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS taxonomy_id UUID REFERENCES category_taxonomies(id),
ADD COLUMN IF NOT EXISTS auto_flavor_wheel BOOLEAN DEFAULT true;

-- Add aggregation scope to flavor_wheels
ALTER TABLE flavor_wheels
ADD COLUMN IF NOT EXISTS aggregation_scope TEXT DEFAULT 'all_categories',
ADD COLUMN IF NOT EXISTS descriptor_limit INTEGER DEFAULT 30;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on category_taxonomies
CREATE OR REPLACE TRIGGER set_updated_at_category_taxonomies
    BEFORE UPDATE ON category_taxonomies
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE category_taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extraction_logs ENABLE ROW LEVEL SECURITY;

-- Policies for category_taxonomies (public read, authenticated write)
CREATE POLICY "Anyone can view category taxonomies"
    ON category_taxonomies FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create category taxonomies"
    ON category_taxonomies FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own category taxonomies"
    ON category_taxonomies FOR UPDATE
    USING (first_used_by = auth.uid());

-- Policies for ai_extraction_logs (users can only see their own logs)
CREATE POLICY "Users can view their own extraction logs"
    ON ai_extraction_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extraction logs"
    ON ai_extraction_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin users can see all logs (if user_roles table exists)
-- Note: This policy will be skipped if user_roles doesn't exist yet
-- You can add it later once user_roles table is created
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_roles'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins can view all extraction logs"
            ON ai_extraction_logs FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM user_roles
                    WHERE user_id = auth.uid() AND role = ''admin''
                )
            )';
    END IF;
END $$;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON TABLE category_taxonomies TO authenticated;
GRANT SELECT ON TABLE category_taxonomies TO anon;

GRANT ALL ON TABLE ai_extraction_logs TO authenticated;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get unified flavor wheel data (all categories)
CREATE OR REPLACE FUNCTION get_unified_flavor_wheel_data(
    p_user_id UUID,
    p_descriptor_limit INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH category_stats AS (
        SELECT
            COALESCE(category, 'Uncategorized') as category_name,
            COUNT(*) as total_count,
            COUNT(DISTINCT descriptor_text) as unique_count
        FROM flavor_descriptors
        WHERE user_id = p_user_id
        GROUP BY category
    ),
    category_descriptors AS (
        SELECT
            COALESCE(fd.category, 'Uncategorized') as category_name,
            jsonb_agg(
                jsonb_build_object(
                    'text', fd.descriptor_text,
                    'count', descriptor_stats.descriptor_count,
                    'avgIntensity', ROUND(descriptor_stats.avg_intensity::numeric, 1),
                    'type', fd.descriptor_type
                ) ORDER BY descriptor_stats.descriptor_count DESC
            ) as descriptors
        FROM flavor_descriptors fd
        INNER JOIN (
            SELECT
                category,
                descriptor_text,
                descriptor_type,
                COUNT(*) as descriptor_count,
                AVG(intensity) as avg_intensity
            FROM flavor_descriptors
            WHERE user_id = p_user_id
            GROUP BY category, descriptor_text, descriptor_type
        ) descriptor_stats
        ON fd.category = descriptor_stats.category
        AND fd.descriptor_text = descriptor_stats.descriptor_text
        AND fd.descriptor_type = descriptor_stats.descriptor_type
        WHERE fd.user_id = p_user_id
        GROUP BY fd.category
    )
    SELECT jsonb_build_object(
        'categories', COALESCE(jsonb_agg(
            jsonb_build_object(
                'name', cs.category_name,
                'count', cs.total_count,
                'uniqueCount', cs.unique_count,
                'descriptors', cd.descriptors
            ) ORDER BY cs.total_count DESC
        ), '[]'::jsonb),
        'totalDescriptors', COALESCE(SUM(cs.total_count), 0),
        'uniqueDescriptors', COALESCE(SUM(cs.unique_count), 0),
        'generatedAt', now()
    )
    INTO v_result
    FROM category_stats cs
    LEFT JOIN category_descriptors cd ON cs.category_name = cd.category_name;

    RETURN v_result;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE category_taxonomies IS 'Stores AI-generated flavor taxonomies for custom beverage/food categories';
COMMENT ON TABLE ai_extraction_logs IS 'Tracks AI descriptor extraction requests for monitoring and cost analysis';

COMMENT ON COLUMN category_taxonomies.taxonomy_data IS 'JSONB structure containing AI-generated aroma categories, flavor categories, and typical descriptors';
COMMENT ON COLUMN ai_extraction_logs.raw_ai_response IS 'Full AI response for debugging and improvement';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'AI Flavor Wheels schema migration completed successfully!';
END $$;
