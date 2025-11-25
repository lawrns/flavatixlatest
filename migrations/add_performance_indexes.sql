-- Performance Indexes Migration
-- Run this migration to add indexes for common query patterns
-- This will significantly improve query performance for the most frequent operations

-- ============================================================================
-- USER & PROFILE INDEXES
-- ============================================================================

-- Index for profile lookups by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Index for username lookups (unique constraint may already create one)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- ============================================================================
-- TASTING INDEXES
-- ============================================================================

-- Index for user's tastings sorted by date (dashboard, my-tastings pages)
CREATE INDEX IF NOT EXISTS idx_quick_tastings_user_created 
ON quick_tastings(user_id, created_at DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_quick_tastings_category 
ON quick_tastings(category);

-- Index for active/incomplete tastings
CREATE INDEX IF NOT EXISTS idx_quick_tastings_user_incomplete 
ON quick_tastings(user_id, completed_at) 
WHERE completed_at IS NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_quick_tastings_user_category_created 
ON quick_tastings(user_id, category, created_at DESC);

-- Index for tasting mode filtering
CREATE INDEX IF NOT EXISTS idx_quick_tastings_mode 
ON quick_tastings(mode);

-- ============================================================================
-- TASTING ITEMS INDEXES
-- ============================================================================

-- Index for items by tasting (always joined with parent tasting)
CREATE INDEX IF NOT EXISTS idx_quick_tasting_items_tasting_id 
ON quick_tasting_items(tasting_id);

-- Index for items by tasting sorted by creation (for ordered display)
CREATE INDEX IF NOT EXISTS idx_quick_tasting_items_tasting_created 
ON quick_tasting_items(tasting_id, created_at);

-- Index for searching items by name
CREATE INDEX IF NOT EXISTS idx_quick_tasting_items_name_search 
ON quick_tasting_items USING gin(to_tsvector('english', item_name));

-- ============================================================================
-- TASTING PARTICIPANTS INDEXES
-- ============================================================================

-- Index for participants by tasting
CREATE INDEX IF NOT EXISTS idx_tasting_participants_tasting_id 
ON tasting_participants(tasting_id);

-- Index for user's participations
CREATE INDEX IF NOT EXISTS idx_tasting_participants_user_id 
ON tasting_participants(user_id);

-- Composite for looking up user's role in a tasting
CREATE INDEX IF NOT EXISTS idx_tasting_participants_tasting_user 
ON tasting_participants(tasting_id, user_id);

-- ============================================================================
-- FLAVOR WHEEL & DESCRIPTOR INDEXES
-- ============================================================================

-- Index for user's flavor wheels
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_user_id 
ON flavor_wheels(user_id) WHERE user_id IS NOT NULL;

-- Index for wheel lookups by type and scope
CREATE INDEX IF NOT EXISTS idx_flavor_wheels_type_scope 
ON flavor_wheels(wheel_type, scope_type);

-- Index for flavor descriptors by user
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_user_id 
ON flavor_descriptors(user_id);

-- Index for descriptors by tasting
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_tasting_id 
ON flavor_descriptors(tasting_id) WHERE tasting_id IS NOT NULL;

-- Index for descriptor category aggregation
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_category 
ON flavor_descriptors(category) WHERE category IS NOT NULL;

-- Full text search on descriptor text
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_text_search 
ON flavor_descriptors USING gin(to_tsvector('english', descriptor_text));

-- ============================================================================
-- REVIEWS INDEXES
-- ============================================================================

-- Index for user's reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON reviews(user_id);

-- Index for reviews by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews(created_at DESC);

-- Index for reviews by category
CREATE INDEX IF NOT EXISTS idx_reviews_category 
ON reviews(category);

-- ============================================================================
-- SOCIAL FEATURES INDEXES (if tables exist)
-- ============================================================================

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_tasting_comments_tasting_id 
ON tasting_comments(tasting_id);

CREATE INDEX IF NOT EXISTS idx_tasting_comments_user_id 
ON tasting_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_tasting_comments_parent_id 
ON tasting_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id 
ON comment_likes(comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user_comment 
ON comment_likes(user_id, comment_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id 
ON follows(follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following_id 
ON follows(following_id);

-- ============================================================================
-- PROSE REVIEWS INDEXES (if table exists)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_prose_reviews_user_id 
ON prose_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_prose_reviews_tasting_id 
ON prose_reviews(tasting_id) WHERE tasting_id IS NOT NULL;

-- Full text search on prose content
CREATE INDEX IF NOT EXISTS idx_prose_reviews_content_search 
ON prose_reviews USING gin(to_tsvector('english', content));

-- ============================================================================
-- TIMESTAMP INDEXES FOR CLEANUP/ARCHIVAL
-- ============================================================================

-- Index for finding old incomplete tastings (cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_quick_tastings_created_incomplete 
ON quick_tastings(created_at) 
WHERE completed_at IS NULL;

-- Index for audit/compliance queries by date range
CREATE INDEX IF NOT EXISTS idx_quick_tastings_updated_at 
ON quick_tastings(updated_at DESC);

-- ============================================================================
-- ANALYZE TABLES (update statistics after index creation)
-- ============================================================================

ANALYZE profiles;
ANALYZE quick_tastings;
ANALYZE quick_tasting_items;
ANALYZE tasting_participants;
ANALYZE flavor_wheels;
ANALYZE flavor_descriptors;
ANALYZE reviews;
