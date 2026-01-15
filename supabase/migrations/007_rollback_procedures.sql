-- =============================================================================
-- Migration 007: Rollback Procedures
-- =============================================================================
-- Purpose: Safe rollback procedures for all migrations
-- Usage: Run specific rollback functions if migration causes issues
--
-- IMPORTANT: These are NOT meant to be run automatically.
-- Review carefully before executing any rollback.
-- =============================================================================

-- =============================================================================
-- STEP 1: Migration tracking table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.migration_history (
    id SERIAL PRIMARY KEY,
    migration_name TEXT NOT NULL,
    migration_version TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    rollback_reason TEXT,
    applied_by TEXT DEFAULT current_user,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'rolled_back', 'partial')),
    notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_migration_history_name
ON public.migration_history (migration_name);

-- Record this migration
INSERT INTO public.migration_history (migration_name, migration_version, notes)
VALUES
    ('001_schema_optimization', '1.0.0', 'Schema optimization with indexes and constraints'),
    ('002_trigram_fuzzy_search', '1.0.0', 'GIN trigram indexes for fuzzy matching'),
    ('003_materialized_views', '1.0.0', 'Materialized views for performance'),
    ('004_query_optimization', '1.0.0', 'Optimized query functions'),
    ('005_partitioning_strategy', '1.0.0', 'Table partitioning infrastructure'),
    ('006_performance_monitoring', '1.0.0', 'Performance monitoring setup'),
    ('007_rollback_procedures', '1.0.0', 'Rollback procedures')
ON CONFLICT (migration_name) DO NOTHING;

-- =============================================================================
-- STEP 2: Rollback for Migration 001 (Schema Optimization)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_001_schema_optimization(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop indexes
    IF NOT p_dry_run THEN
        DROP INDEX IF EXISTS idx_flavor_descriptors_user_normalized;
        DROP INDEX IF EXISTS idx_flavor_descriptors_user_type;
        DROP INDEX IF EXISTS idx_flavor_descriptors_item;
        DROP INDEX IF EXISTS idx_flavor_descriptors_category;
        DROP INDEX IF EXISTS idx_flavor_descriptors_source;
        DROP INDEX IF EXISTS idx_flavor_descriptors_created;
        DROP INDEX IF EXISTS idx_flavor_descriptors_ai_extracted;
        DROP INDEX IF EXISTS idx_flavor_descriptors_source_unique;
        DROP INDEX IF EXISTS idx_flavor_wheels_user_type;
        DROP INDEX IF EXISTS idx_flavor_wheels_expires;
        DROP INDEX IF EXISTS idx_flavor_wheels_generated;
    END IF;

    action := 'DROP INDEX';
    object_name := 'idx_flavor_descriptors_*';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop constraints
    IF NOT p_dry_run THEN
        ALTER TABLE public.flavor_descriptors DROP CONSTRAINT IF EXISTS chk_descriptor_type;
        ALTER TABLE public.flavor_descriptors DROP CONSTRAINT IF EXISTS chk_source_type;
        ALTER TABLE public.flavor_descriptors DROP CONSTRAINT IF EXISTS chk_confidence_score;
        ALTER TABLE public.flavor_descriptors DROP CONSTRAINT IF EXISTS chk_intensity;
        ALTER TABLE public.flavor_wheels DROP CONSTRAINT IF EXISTS chk_wheel_type;
        ALTER TABLE public.flavor_wheels DROP CONSTRAINT IF EXISTS chk_scope_type;
    END IF;

    action := 'DROP CONSTRAINT';
    object_name := 'chk_*';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop columns (WARNING: Data loss!)
    IF NOT p_dry_run THEN
        ALTER TABLE public.flavor_descriptors DROP COLUMN IF EXISTS normalized_form;
        ALTER TABLE public.flavor_descriptors DROP COLUMN IF EXISTS ai_extracted;
        ALTER TABLE public.flavor_descriptors DROP COLUMN IF EXISTS extraction_model;
    END IF;

    action := 'DROP COLUMN';
    object_name := 'normalized_form, ai_extracted, extraction_model';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS normalize_descriptor_text(TEXT);
        DROP FUNCTION IF EXISTS descriptor_exists(UUID, TEXT, TEXT);
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'normalize_descriptor_text, descriptor_exists';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '001_schema_optimization';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_001_schema_optimization(BOOLEAN) IS
'Rollback Migration 001: Schema Optimization
WARNING: Removes columns, indexes, and constraints.
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 3: Rollback for Migration 002 (Trigram Fuzzy Search)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_002_trigram_fuzzy_search(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop indexes
    IF NOT p_dry_run THEN
        DROP INDEX IF EXISTS idx_flavor_descriptors_text_trgm;
        DROP INDEX IF EXISTS idx_flavor_descriptors_normalized_trgm;
        DROP INDEX IF EXISTS idx_flavor_descriptors_category_trgm;
        DROP INDEX IF EXISTS idx_flavor_descriptors_subcategory_trgm;
        DROP INDEX IF EXISTS idx_flavor_descriptors_textsearch;
    END IF;

    action := 'DROP INDEX';
    object_name := 'idx_flavor_descriptors_*_trgm, idx_flavor_descriptors_textsearch';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop column
    IF NOT p_dry_run THEN
        ALTER TABLE public.flavor_descriptors DROP COLUMN IF EXISTS textsearch_vector;
    END IF;

    action := 'DROP COLUMN';
    object_name := 'textsearch_vector';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS find_similar_descriptors(TEXT, UUID, TEXT, FLOAT, INTEGER);
        DROP FUNCTION IF EXISTS find_duplicate_descriptors(UUID, FLOAT, INTEGER);
        DROP FUNCTION IF EXISTS autocomplete_descriptors(TEXT, UUID, TEXT, TEXT, INTEGER);
        DROP FUNCTION IF EXISTS suggest_descriptor_category(TEXT, FLOAT);
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'find_similar_descriptors, find_duplicate_descriptors, autocomplete_descriptors, suggest_descriptor_category';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '002_trigram_fuzzy_search';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_002_trigram_fuzzy_search(BOOLEAN) IS
'Rollback Migration 002: Trigram Fuzzy Search
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 4: Rollback for Migration 003 (Materialized Views)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_003_materialized_views(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop materialized views
    IF NOT p_dry_run THEN
        DROP MATERIALIZED VIEW IF EXISTS mv_user_descriptor_summary CASCADE;
        DROP MATERIALIZED VIEW IF EXISTS mv_global_descriptor_stats CASCADE;
        DROP MATERIALIZED VIEW IF EXISTS mv_category_descriptor_summary CASCADE;
        DROP MATERIALIZED VIEW IF EXISTS mv_wheel_generation_stats CASCADE;
    END IF;

    action := 'DROP MATERIALIZED VIEW';
    object_name := 'mv_user_descriptor_summary, mv_global_descriptor_stats, mv_category_descriptor_summary, mv_wheel_generation_stats';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop tracking table
    IF NOT p_dry_run THEN
        DROP TABLE IF EXISTS public.mv_refresh_status CASCADE;
    END IF;

    action := 'DROP TABLE';
    object_name := 'mv_refresh_status';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop trigger
    IF NOT p_dry_run THEN
        DROP TRIGGER IF EXISTS trg_track_descriptor_changes ON public.flavor_descriptors;
    END IF;

    action := 'DROP TRIGGER';
    object_name := 'trg_track_descriptor_changes';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS generate_wheel_data_optimized(UUID, TEXT, INTEGER, INTEGER);
        DROP FUNCTION IF EXISTS refresh_descriptor_views();
        DROP FUNCTION IF EXISTS refresh_user_descriptor_summary();
        DROP FUNCTION IF EXISTS track_descriptor_changes();
        DROP FUNCTION IF EXISTS should_refresh_views(INTEGER);
        DROP FUNCTION IF EXISTS mark_views_refreshed();
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'generate_wheel_data_optimized, refresh_descriptor_views, etc.';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '003_materialized_views';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_003_materialized_views(BOOLEAN) IS
'Rollback Migration 003: Materialized Views
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 5: Rollback for Migration 004 (Query Optimization)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_004_query_optimization(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS get_descriptors_paginated(UUID, TEXT, TEXT, UUID, TIMESTAMP WITH TIME ZONE, INTEGER, TEXT);
        DROP FUNCTION IF EXISTS wheel_needs_regeneration(UUID, INTEGER);
        DROP FUNCTION IF EXISTS get_wheel_data_fast(UUID, TEXT, TEXT, TEXT);
        DROP FUNCTION IF EXISTS batch_insert_descriptors(JSONB, UUID, TEXT, UUID);
        DROP FUNCTION IF EXISTS get_user_descriptor_stats(UUID);
        DROP FUNCTION IF EXISTS get_top_descriptors(UUID, TEXT, TEXT, INTEGER);
        DROP FUNCTION IF EXISTS get_descriptor_timeline(UUID, INTEGER, TEXT);
        DROP FUNCTION IF EXISTS estimate_descriptor_count(UUID);
        DROP FUNCTION IF EXISTS analyze_query_performance(TEXT, JSONB);
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'get_descriptors_paginated, wheel_needs_regeneration, get_wheel_data_fast, etc.';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop table
    IF NOT p_dry_run THEN
        DROP TABLE IF EXISTS public.query_performance_hints CASCADE;
    END IF;

    action := 'DROP TABLE';
    object_name := 'query_performance_hints';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '004_query_optimization';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_004_query_optimization(BOOLEAN) IS
'Rollback Migration 004: Query Optimization
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 6: Rollback for Migration 005 (Partitioning Strategy)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_005_partitioning_strategy(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_partition RECORD;
BEGIN
    -- Note: This does NOT migrate data back - just removes partitioning infrastructure

    -- Drop partition management functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS create_descriptor_partition(INTEGER, INTEGER);
        DROP FUNCTION IF EXISTS ensure_future_partitions(INTEGER);
        DROP FUNCTION IF EXISTS archive_old_partitions(INTEGER);
        DROP FUNCTION IF EXISTS detach_partition(TEXT);
        DROP FUNCTION IF EXISTS migrate_to_partitioned_table(INTEGER, BOOLEAN);
        DROP FUNCTION IF EXISTS analyze_all_partitions();
        DROP FUNCTION IF EXISTS get_partition_for_date(TIMESTAMP WITH TIME ZONE);
        DROP FUNCTION IF EXISTS run_partition_maintenance();
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'create_descriptor_partition, ensure_future_partitions, etc.';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop partitioned table and all partitions
    IF NOT p_dry_run THEN
        -- Drop default partition first
        DROP TABLE IF EXISTS public.flavor_descriptors_default CASCADE;

        -- Drop each monthly partition
        FOR v_partition IN
            SELECT c.relname
            FROM pg_class c
            JOIN pg_inherits i ON c.oid = i.inhrelid
            JOIN pg_class parent ON i.inhparent = parent.oid
            WHERE parent.relname = 'flavor_descriptors_partitioned'
        LOOP
            EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', v_partition.relname);
        END LOOP;

        -- Drop main partitioned table
        DROP TABLE IF EXISTS public.flavor_descriptors_partitioned CASCADE;
    END IF;

    action := 'DROP TABLE';
    object_name := 'flavor_descriptors_partitioned (and all partitions)';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop maintenance log table
    IF NOT p_dry_run THEN
        DROP TABLE IF EXISTS public.partition_maintenance_log CASCADE;
    END IF;

    action := 'DROP TABLE';
    object_name := 'partition_maintenance_log';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '005_partitioning_strategy';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_005_partitioning_strategy(BOOLEAN) IS
'Rollback Migration 005: Partitioning Strategy
WARNING: Drops all partition infrastructure. Does NOT migrate data back.
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 7: Rollback for Migration 006 (Performance Monitoring)
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_006_performance_monitoring(
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop views
    IF NOT p_dry_run THEN
        DROP VIEW IF EXISTS v_query_performance CASCADE;
        DROP VIEW IF EXISTS v_slow_queries CASCADE;
        DROP VIEW IF EXISTS v_index_usage CASCADE;
        DROP VIEW IF EXISTS v_missing_indexes CASCADE;
        DROP VIEW IF EXISTS v_table_stats CASCADE;
        DROP VIEW IF EXISTS v_active_connections CASCADE;
        DROP VIEW IF EXISTS v_lock_conflicts CASCADE;
    END IF;

    action := 'DROP VIEW';
    object_name := 'v_query_performance, v_slow_queries, v_index_usage, etc.';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop functions
    IF NOT p_dry_run THEN
        DROP FUNCTION IF EXISTS capture_performance_snapshot();
        DROP FUNCTION IF EXISTS get_monitoring_dashboard();
        DROP FUNCTION IF EXISTS check_performance_alerts();
        DROP FUNCTION IF EXISTS cleanup_monitoring_data(INTEGER);
    END IF;

    action := 'DROP FUNCTION';
    object_name := 'capture_performance_snapshot, get_monitoring_dashboard, etc.';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Drop tables
    IF NOT p_dry_run THEN
        DROP TABLE IF EXISTS public.performance_baselines CASCADE;
        DROP TABLE IF EXISTS public.performance_snapshots CASCADE;
        DROP TABLE IF EXISTS public.performance_alerts CASCADE;
    END IF;

    action := 'DROP TABLE';
    object_name := 'performance_baselines, performance_snapshots, performance_alerts';
    status := CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROPPED' END;
    RETURN NEXT;

    -- Note: We do NOT drop pg_stat_statements extension

    -- Update migration history
    IF NOT p_dry_run THEN
        UPDATE public.migration_history
        SET rolled_back_at = NOW(), status = 'rolled_back'
        WHERE migration_name = '006_performance_monitoring';
    END IF;
END;
$$;

COMMENT ON FUNCTION rollback_006_performance_monitoring(BOOLEAN) IS
'Rollback Migration 006: Performance Monitoring
Note: Does NOT drop pg_stat_statements extension.
Run with p_dry_run=TRUE first to see what will be changed.';

-- =============================================================================
-- STEP 8: Complete rollback function
-- =============================================================================

CREATE OR REPLACE FUNCTION rollback_all_migrations(
    p_dry_run BOOLEAN DEFAULT TRUE,
    p_confirm TEXT DEFAULT NULL
)
RETURNS TABLE (
    migration TEXT,
    action TEXT,
    object_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Safety check
    IF p_confirm != 'I_UNDERSTAND_THIS_IS_DESTRUCTIVE' THEN
        RAISE EXCEPTION 'Must confirm with p_confirm = ''I_UNDERSTAND_THIS_IS_DESTRUCTIVE''';
    END IF;

    -- Rollback in reverse order
    FOR migration, action, object_name, status IN
        SELECT '006' as mig, * FROM rollback_006_performance_monitoring(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;

    FOR migration, action, object_name, status IN
        SELECT '005' as mig, * FROM rollback_005_partitioning_strategy(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;

    FOR migration, action, object_name, status IN
        SELECT '004' as mig, * FROM rollback_004_query_optimization(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;

    FOR migration, action, object_name, status IN
        SELECT '003' as mig, * FROM rollback_003_materialized_views(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;

    FOR migration, action, object_name, status IN
        SELECT '002' as mig, * FROM rollback_002_trigram_fuzzy_search(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;

    FOR migration, action, object_name, status IN
        SELECT '001' as mig, * FROM rollback_001_schema_optimization(p_dry_run)
    LOOP
        RETURN NEXT;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION rollback_all_migrations(BOOLEAN, TEXT) IS
'Rollback ALL migrations in reverse order.
EXTREMELY DESTRUCTIVE - requires explicit confirmation.
Always run with p_dry_run=TRUE first.';

-- =============================================================================
-- STEP 9: Migration verification function
-- =============================================================================

CREATE OR REPLACE FUNCTION verify_migrations()
RETURNS TABLE (
    migration_name TEXT,
    status TEXT,
    verification_result TEXT,
    details JSONB
)
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check 001: Schema Optimization
    migration_name := '001_schema_optimization';
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'flavor_descriptors' AND column_name = 'normalized_form'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'normalized_form column exists';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'normalized_form column missing';
    END IF;
    details := jsonb_build_object('checked', 'normalized_form column');
    RETURN NEXT;

    -- Check 002: Trigram Fuzzy Search
    migration_name := '002_trigram_fuzzy_search';
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_flavor_descriptors_text_trgm'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'trigram index exists';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'trigram index missing';
    END IF;
    details := jsonb_build_object('checked', 'idx_flavor_descriptors_text_trgm');
    RETURN NEXT;

    -- Check 003: Materialized Views
    migration_name := '003_materialized_views';
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE matviewname = 'mv_user_descriptor_summary'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'materialized view exists';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'materialized view missing';
    END IF;
    details := jsonb_build_object('checked', 'mv_user_descriptor_summary');
    RETURN NEXT;

    -- Check 004: Query Optimization
    migration_name := '004_query_optimization';
    IF EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'get_descriptors_paginated'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'pagination function exists';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'pagination function missing';
    END IF;
    details := jsonb_build_object('checked', 'get_descriptors_paginated function');
    RETURN NEXT;

    -- Check 005: Partitioning Strategy
    migration_name := '005_partitioning_strategy';
    IF EXISTS (
        SELECT 1 FROM pg_class
        WHERE relname = 'flavor_descriptors_partitioned'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'partitioned table exists';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'partitioned table missing';
    END IF;
    details := jsonb_build_object('checked', 'flavor_descriptors_partitioned table');
    RETURN NEXT;

    -- Check 006: Performance Monitoring
    migration_name := '006_performance_monitoring';
    IF EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename = 'performance_snapshots'
    ) THEN
        status := 'VERIFIED';
        verification_result := 'monitoring tables exist';
    ELSE
        status := 'NOT_APPLIED';
        verification_result := 'monitoring tables missing';
    END IF;
    details := jsonb_build_object('checked', 'performance_snapshots table');
    RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION verify_migrations() IS
'Verify which migrations have been applied to the database.';

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 007: Rollback Procedures Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - migration_history tracking table';
    RAISE NOTICE '  - rollback_001_schema_optimization() function';
    RAISE NOTICE '  - rollback_002_trigram_fuzzy_search() function';
    RAISE NOTICE '  - rollback_003_materialized_views() function';
    RAISE NOTICE '  - rollback_004_query_optimization() function';
    RAISE NOTICE '  - rollback_005_partitioning_strategy() function';
    RAISE NOTICE '  - rollback_006_performance_monitoring() function';
    RAISE NOTICE '  - rollback_all_migrations() function';
    RAISE NOTICE '  - verify_migrations() function';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USAGE:';
    RAISE NOTICE '  DRY RUN: SELECT * FROM rollback_001_schema_optimization(TRUE);';
    RAISE NOTICE '  EXECUTE: SELECT * FROM rollback_001_schema_optimization(FALSE);';
    RAISE NOTICE '  VERIFY:  SELECT * FROM verify_migrations();';
    RAISE NOTICE '========================================';
END $$;
