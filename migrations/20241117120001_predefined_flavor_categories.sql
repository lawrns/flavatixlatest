-- Predefined Flavor Categories Migration
-- Adds structured categories for Flavor & Aroma (14) and Metaphor (10) wheels
-- This provides the foundation for AI categorization and mobile-friendly display

-- ============================================================================
-- PREDEFINED CATEGORY TABLES
-- ============================================================================

-- Table: predefined_flavor_categories
-- Stores the 14 predefined Flavor & Aroma categories
CREATE TABLE IF NOT EXISTS predefined_flavor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL,
    color_hex TEXT NOT NULL, -- For visualization
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: predefined_metaphor_categories  
-- Stores the 10 predefined Metaphor categories
CREATE TABLE IF NOT EXISTS predefined_metaphor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL,
    color_hex TEXT NOT NULL, -- For visualization
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INSERT PREDEFINED CATEGORIES
-- ============================================================================

-- Insert Flavor & Aroma Categories (14)
INSERT INTO predefined_flavor_categories (name, display_order, color_hex) VALUES
    ('Fruit', 1, '#FF6B6B'),
    ('Floral', 2, '#FF8E8E'),
    ('Herbal', 3, '#4ECDC4'),
    ('Spice', 4, '#FFD93D'),
    ('Sweetness / Sugary / Confection', 5, '#95E77E'),
    ('Earthy / Mineral', 6, '#8B7355'),
    ('Vegetal / Green', 7, '#6BCF7F'),
    ('Nutty / Grain / Cereal', 8, '#D4A574'),
    ('Ferment / Funky', 9, '#B19CD9'),
    ('Roasted / Toasted / Smoke', 10, '#8B4513'),
    ('Chemical', 11, '#FF69B4'),
    ('Animal / Must', 12, '#CD853F'),
    ('Dairy / Fatty', 13, '#F0E68C'),
    ('Wood / Resin', 14, '#654321')
ON CONFLICT (name) DO NOTHING;

-- Insert Metaphor Categories (10)
INSERT INTO predefined_metaphor_categories (name, display_order, color_hex) VALUES
    ('Emotion', 1, '#FF6B9D'),
    ('Texture', 2, '#C9E4CA'),
    ('Color/Light', 3, '#FFD93D'),
    ('Place', 4, '#6C5CE7'),
    ('Temporal', 5, '#A8E6CF'),
    ('Personality / Archetype', 6, '#FFB6C1'),
    ('Shape', 7, '#87CEEB'),
    ('Weight', 8, '#DDA0DD'),
    ('Sound', 9, '#F0E68C'),
    ('Movement', 10, '#98D8C8')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- UPDATE FLAVOR_DESCRIPTORS TABLE
-- ============================================================================

-- Add foreign key references to predefined categories
ALTER TABLE flavor_descriptors 
ADD COLUMN IF NOT EXISTS predefined_flavor_category_id UUID REFERENCES predefined_flavor_categories(id),
ADD COLUMN IF NOT EXISTS predefined_metaphor_category_id UUID REFERENCES predefined_metaphor_categories(id);

-- Add constraint to ensure only one predefined category is set per descriptor type
ALTER TABLE flavor_descriptors 
ADD CONSTRAINT check_predefined_category_type 
CHECK (
    (descriptor_type IN ('aroma', 'flavor', 'texture') AND predefined_flavor_category_id IS NOT NULL AND predefined_metaphor_category_id IS NULL) OR
    (descriptor_type = 'metaphor' AND predefined_metaphor_category_id IS NOT NULL AND predefined_flavor_category_id IS NULL) OR
    (predefined_flavor_category_id IS NULL AND predefined_metaphor_category_id IS NULL) -- Allow null for backward compatibility
);

-- ============================================================================
-- VIEWS FOR EASY ACCESS
-- ============================================================================

-- View: active_flavor_categories
-- For easy access to active predefined flavor categories
CREATE OR REPLACE VIEW active_flavor_categories AS
SELECT id, name, display_order, color_hex
FROM predefined_flavor_categories 
WHERE is_active = true
ORDER BY display_order;

-- View: active_metaphor_categories
-- For easy access to active predefined metaphor categories  
CREATE OR REPLACE VIEW active_metaphor_categories AS
SELECT id, name, display_order, color_hex
FROM predefined_metaphor_categories 
WHERE is_active = true
ORDER BY display_order;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for predefined category tables
CREATE INDEX IF NOT EXISTS idx_predefined_flavor_categories_order ON predefined_flavor_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_predefined_metaphor_categories_order ON predefined_metaphor_categories(display_order);

-- Indexes for flavor_descriptors foreign keys
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_predefined_flavor ON flavor_descriptors(predefined_flavor_category_id);
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_predefined_metaphor ON flavor_descriptors(predefined_metaphor_category_id);

-- ============================================================================
-- FUNCTIONS FOR CATEGORY MAPPING
-- ============================================================================

-- Function: map_descriptor_to_predefined_category
-- AI helper function to map descriptor text to predefined category
CREATE OR REPLACE FUNCTION map_descriptor_to_predefined_category(
    descriptor_text TEXT,
    descriptor_type TEXT
) RETURNS TABLE(category_id UUID, category_name TEXT) AS $$
BEGIN
    -- This function will be enhanced with AI logic later
    -- For now, return empty result - AI will populate these fields
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT WHERE false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- This migration:
-- 1. Creates structured tables for predefined categories
-- 2. Populates them with the 24 categories specified in the November plan
-- 3. Updates flavor_descriptors to reference predefined categories
-- 4. Maintains backward compatibility with existing category/subcategory text fields
-- 5. Provides views and functions for easy access and future AI integration

-- Next steps:
-- 1. Update AI extraction logic to use predefined categories
-- 2. Build mobile UI components that use these structured categories
-- 3. Implement PDF export using the predefined color scheme
-- 4. Add migration logic to backfill existing descriptors with predefined categories
