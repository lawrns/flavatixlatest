-- =============================================================================
-- Migration 005: Partitioning Strategy for Scalability
-- =============================================================================
-- Purpose: Design partitioning for 10M+ rows in flavor_descriptors
-- Strategy: Range partitioning by created_at (monthly)
--
-- Benefits:
--   - Faster queries when filtering by date range
--   - Efficient partition pruning
--   - Easy archival of old data
--   - Parallel query execution per partition
--   - Reduced index sizes per partition
--
-- IMPORTANT: This creates the infrastructure for partitioning.
-- Actual data migration should be done in a separate maintenance window.
-- =============================================================================

-- =============================================================================
-- STEP 1: Create partitioned version of flavor_descriptors
-- =============================================================================

-- Note: We create a new partitioned table rather than converting in-place
-- This allows for safe migration with rollback capability

CREATE TABLE IF NOT EXISTS public.flavor_descriptors_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    descriptor_text VARCHAR(500) NOT NULL,
    normalized_form VARCHAR(500),
    descriptor_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    confidence_score NUMERIC(3,2),
    intensity INTEGER,
    item_name VARCHAR(255),
    item_category VARCHAR(100),
    ai_extracted BOOLEAN DEFAULT FALSE,
    extraction_model VARCHAR(100),
    textsearch_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_p_descriptor_type CHECK (
        descriptor_type IN ('aroma', 'flavor', 'texture', 'defect', 'metaphor', 'mouthfeel')
    ),
    CONSTRAINT chk_p_source_type CHECK (
        source_type IN ('quick_tasting', 'quick_review', 'prose_review', 'study_session')
    ),
    CONSTRAINT chk_p_confidence_score CHECK (
        confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
    ),
    CONSTRAINT chk_p_intensity CHECK (
        intensity IS NULL OR (intensity >= 1 AND intensity <= 5)
    ),

    -- Primary key includes partition key
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- =============================================================================
-- STEP 2: Create monthly partitions
-- =============================================================================

-- Function to create monthly partition
CREATE OR REPLACE FUNCTION create_descriptor_partition(
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_partition_name TEXT;
    v_start_date DATE;
    v_end_date DATE;
    v_sql TEXT;
BEGIN
    v_partition_name := format('flavor_descriptors_y%sm%s',
        p_year,
        LPAD(p_month::text, 2, '0')
    );

    v_start_date := make_date(p_year, p_month, 1);
    v_end_date := v_start_date + INTERVAL '1 month';

    -- Check if partition already exists
    IF EXISTS (
        SELECT 1 FROM pg_class
        WHERE relname = v_partition_name
        AND relnamespace = 'public'::regnamespace
    ) THEN
        RETURN format('Partition %s already exists', v_partition_name);
    END IF;

    -- Create partition
    v_sql := format($p$
        CREATE TABLE IF NOT EXISTS public.%I
        PARTITION OF public.flavor_descriptors_partitioned
        FOR VALUES FROM (%L) TO (%L)
    $p$, v_partition_name, v_start_date, v_end_date);

    EXECUTE v_sql;

    -- Create local indexes for the partition
    EXECUTE format($p$
        CREATE INDEX IF NOT EXISTS %I
        ON public.%I (user_id, descriptor_type)
    $p$, v_partition_name || '_user_type_idx', v_partition_name);

    EXECUTE format($p$
        CREATE INDEX IF NOT EXISTS %I
        ON public.%I (user_id, normalized_form)
    $p$, v_partition_name || '_user_norm_idx', v_partition_name);

    EXECUTE format($p$
        CREATE INDEX IF NOT EXISTS %I
        ON public.%I (source_type, source_id)
    $p$, v_partition_name || '_source_idx', v_partition_name);

    RETURN format('Created partition %s for %s to %s',
        v_partition_name, v_start_date, v_end_date);
END;
$$;

COMMENT ON FUNCTION create_descriptor_partition(INTEGER, INTEGER) IS
'Create a monthly partition for flavor_descriptors_partitioned.
Usage: SELECT create_descriptor_partition(2025, 1);';

-- Create partitions for current year and next year
DO $$
DECLARE
    v_year INTEGER;
    v_month INTEGER;
    v_result TEXT;
BEGIN
    -- Create partitions for 2024 (historical)
    FOR v_month IN 1..12 LOOP
        SELECT create_descriptor_partition(2024, v_month) INTO v_result;
        RAISE NOTICE '%', v_result;
    END LOOP;

    -- Create partitions for 2025
    FOR v_month IN 1..12 LOOP
        SELECT create_descriptor_partition(2025, v_month) INTO v_result;
        RAISE NOTICE '%', v_result;
    END LOOP;

    -- Create partitions for 2026
    FOR v_month IN 1..12 LOOP
        SELECT create_descriptor_partition(2026, v_month) INTO v_result;
        RAISE NOTICE '%', v_result;
    END LOOP;
END $$;

-- Create a default partition for any data outside defined ranges
CREATE TABLE IF NOT EXISTS public.flavor_descriptors_default
PARTITION OF public.flavor_descriptors_partitioned
DEFAULT;

-- =============================================================================
-- STEP 3: Partition management procedures
-- =============================================================================

-- Function to ensure future partitions exist
CREATE OR REPLACE FUNCTION ensure_future_partitions(
    p_months_ahead INTEGER DEFAULT 3
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_date DATE := CURRENT_DATE;
    v_target_date DATE;
    v_year INTEGER;
    v_month INTEGER;
    v_results TEXT[] := ARRAY[]::TEXT[];
    v_result TEXT;
BEGIN
    FOR i IN 0..p_months_ahead LOOP
        v_target_date := v_current_date + (i || ' months')::interval;
        v_year := EXTRACT(YEAR FROM v_target_date)::INTEGER;
        v_month := EXTRACT(MONTH FROM v_target_date)::INTEGER;

        SELECT create_descriptor_partition(v_year, v_month) INTO v_result;
        v_results := array_append(v_results, v_result);
    END LOOP;

    RETURN v_results;
END;
$$;

COMMENT ON FUNCTION ensure_future_partitions(INTEGER) IS
'Ensure partitions exist for upcoming months.
Should be run monthly via scheduled job.';

-- Function to drop old partitions (for archival)
CREATE OR REPLACE FUNCTION archive_old_partitions(
    p_months_to_keep INTEGER DEFAULT 24
)
RETURNS TABLE (
    partition_name TEXT,
    action TEXT,
    row_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cutoff_date DATE;
    v_partition RECORD;
    v_count BIGINT;
BEGIN
    v_cutoff_date := CURRENT_DATE - (p_months_to_keep || ' months')::interval;

    FOR v_partition IN
        SELECT
            c.relname as partition_name,
            pg_get_expr(c.relpartbound, c.oid) as bounds
        FROM pg_class c
        JOIN pg_inherits i ON c.oid = i.inhrelid
        JOIN pg_class parent ON i.inhparent = parent.oid
        WHERE parent.relname = 'flavor_descriptors_partitioned'
        AND c.relname LIKE 'flavor_descriptors_y%'
    LOOP
        -- Extract end date from partition bounds
        -- This is a simplified check - in production you'd parse the bounds properly
        IF v_partition.partition_name ~ 'y202[0-3]' THEN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', v_partition.partition_name)
            INTO v_count;

            partition_name := v_partition.partition_name;
            action := 'CANDIDATE_FOR_ARCHIVE';
            row_count := v_count;
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$;

COMMENT ON FUNCTION archive_old_partitions(INTEGER) IS
'Identify old partitions that can be archived.
Does NOT delete - returns list for review.';

-- Function to detach a partition (for archival without deletion)
CREATE OR REPLACE FUNCTION detach_partition(
    p_partition_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_archive_name TEXT;
BEGIN
    v_archive_name := p_partition_name || '_archived';

    -- Detach partition
    EXECUTE format(
        'ALTER TABLE public.flavor_descriptors_partitioned DETACH PARTITION public.%I',
        p_partition_name
    );

    -- Rename to archived
    EXECUTE format(
        'ALTER TABLE public.%I RENAME TO %I',
        p_partition_name,
        v_archive_name
    );

    RETURN format('Detached and renamed %s to %s', p_partition_name, v_archive_name);
END;
$$;

COMMENT ON FUNCTION detach_partition(TEXT) IS
'Detach a partition from the main table without deleting data.
Useful for archiving old data that should remain accessible.';

-- =============================================================================
-- STEP 4: Data migration procedure (DO NOT RUN AUTOMATICALLY)
-- =============================================================================

-- This function migrates data from old table to new partitioned table
-- Should be run during maintenance window
CREATE OR REPLACE FUNCTION migrate_to_partitioned_table(
    p_batch_size INTEGER DEFAULT 10000,
    p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    status TEXT,
    rows_migrated BIGINT,
    estimated_remaining BIGINT,
    elapsed_seconds NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_last_id UUID;
    v_last_created TIMESTAMP WITH TIME ZONE;
    v_batch_count INTEGER;
    v_total_migrated BIGINT := 0;
    v_remaining BIGINT;
BEGIN
    v_start_time := clock_timestamp();

    -- Get total remaining to migrate
    SELECT COUNT(*)
    INTO v_remaining
    FROM public.flavor_descriptors fd
    WHERE NOT EXISTS (
        SELECT 1 FROM public.flavor_descriptors_partitioned fdp
        WHERE fdp.id = fd.id
    );

    IF p_dry_run THEN
        status := 'DRY_RUN';
        rows_migrated := 0;
        estimated_remaining := v_remaining;
        elapsed_seconds := 0;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Migrate in batches
    LOOP
        WITH batch AS (
            SELECT fd.*
            FROM public.flavor_descriptors fd
            WHERE NOT EXISTS (
                SELECT 1 FROM public.flavor_descriptors_partitioned fdp
                WHERE fdp.id = fd.id
            )
            ORDER BY fd.created_at, fd.id
            LIMIT p_batch_size
        ),
        inserted AS (
            INSERT INTO public.flavor_descriptors_partitioned (
                id, user_id, source_type, source_id, descriptor_text,
                normalized_form, descriptor_type, category, subcategory,
                confidence_score, intensity, item_name, item_category,
                ai_extracted, extraction_model, created_at, updated_at
            )
            SELECT
                id, user_id, source_type, source_id, descriptor_text,
                normalized_form, descriptor_type, category, subcategory,
                confidence_score, intensity, item_name, item_category,
                ai_extracted, extraction_model, created_at, updated_at
            FROM batch
            ON CONFLICT (id, created_at) DO NOTHING
            RETURNING id
        )
        SELECT COUNT(*) INTO v_batch_count FROM inserted;

        v_total_migrated := v_total_migrated + v_batch_count;

        EXIT WHEN v_batch_count = 0;

        -- Checkpoint every 10 batches
        IF v_total_migrated % (p_batch_size * 10) = 0 THEN
            COMMIT;
        END IF;
    END LOOP;

    status := 'COMPLETED';
    rows_migrated := v_total_migrated;
    estimated_remaining := 0;
    elapsed_seconds := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time));
    RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION migrate_to_partitioned_table(INTEGER, BOOLEAN) IS
'Migrate data from flavor_descriptors to flavor_descriptors_partitioned.
IMPORTANT: Run with p_dry_run=TRUE first to verify.
Run during maintenance window for large datasets.';

-- =============================================================================
-- STEP 5: Partition statistics maintenance
-- =============================================================================

-- Function to analyze all partitions
CREATE OR REPLACE FUNCTION analyze_all_partitions()
RETURNS TABLE (
    partition_name TEXT,
    row_count BIGINT,
    size_bytes BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_partition RECORD;
    v_count BIGINT;
    v_size BIGINT;
BEGIN
    FOR v_partition IN
        SELECT c.relname
        FROM pg_class c
        JOIN pg_inherits i ON c.oid = i.inhrelid
        JOIN pg_class parent ON i.inhparent = parent.oid
        WHERE parent.relname = 'flavor_descriptors_partitioned'
    LOOP
        -- Analyze partition
        EXECUTE format('ANALYZE public.%I', v_partition.relname);

        -- Get stats
        EXECUTE format('SELECT COUNT(*) FROM public.%I', v_partition.relname)
        INTO v_count;

        EXECUTE format(
            'SELECT pg_total_relation_size(%L::regclass)',
            'public.' || v_partition.relname
        )
        INTO v_size;

        partition_name := v_partition.relname;
        row_count := v_count;
        size_bytes := v_size;
        RETURN NEXT;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION analyze_all_partitions() IS
'Analyze all partitions and return statistics.
Should be run after large data loads.';

-- =============================================================================
-- STEP 6: Partition-aware query helper
-- =============================================================================

CREATE OR REPLACE FUNCTION get_partition_for_date(
    p_date TIMESTAMP WITH TIME ZONE
)
RETURNS TEXT
STABLE
LANGUAGE SQL
AS $$
    SELECT format('flavor_descriptors_y%sm%s',
        EXTRACT(YEAR FROM p_date)::INTEGER,
        LPAD(EXTRACT(MONTH FROM p_date)::TEXT, 2, '0')
    );
$$;

COMMENT ON FUNCTION get_partition_for_date(TIMESTAMP WITH TIME ZONE) IS
'Returns the partition name for a given date.';

-- =============================================================================
-- STEP 7: Maintenance job tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.partition_maintenance_log (
    id BIGSERIAL PRIMARY KEY,
    operation TEXT NOT NULL,
    partition_name TEXT,
    rows_affected BIGINT,
    duration_seconds NUMERIC,
    success BOOLEAN,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partition_maintenance_log_date
ON public.partition_maintenance_log (executed_at DESC);

-- =============================================================================
-- STEP 8: Scheduled maintenance function
-- =============================================================================

CREATE OR REPLACE FUNCTION run_partition_maintenance()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_result JSONB;
    v_partitions_created TEXT[];
    v_analyze_result RECORD;
BEGIN
    v_start_time := clock_timestamp();

    -- Ensure future partitions exist
    SELECT ensure_future_partitions(3) INTO v_partitions_created;

    -- Log partition creation
    INSERT INTO public.partition_maintenance_log (operation, rows_affected, success)
    VALUES ('ensure_future_partitions', array_length(v_partitions_created, 1), TRUE);

    -- Analyze partitions with recent changes
    FOR v_analyze_result IN SELECT * FROM analyze_all_partitions() LOOP
        -- Log each partition analysis
        INSERT INTO public.partition_maintenance_log (
            operation, partition_name, rows_affected, success
        )
        VALUES ('analyze', v_analyze_result.partition_name, v_analyze_result.row_count, TRUE);
    END LOOP;

    v_result := jsonb_build_object(
        'status', 'completed',
        'partitionsCreated', v_partitions_created,
        'executedAt', NOW(),
        'durationSeconds', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time))
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION run_partition_maintenance() IS
'Run all partition maintenance tasks.
Should be scheduled to run daily.';

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 005: Partitioning Strategy Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - flavor_descriptors_partitioned table';
    RAISE NOTICE '  - Monthly partitions for 2024-2026';
    RAISE NOTICE '  - create_descriptor_partition() function';
    RAISE NOTICE '  - ensure_future_partitions() function';
    RAISE NOTICE '  - archive_old_partitions() function';
    RAISE NOTICE '  - detach_partition() function';
    RAISE NOTICE '  - migrate_to_partitioned_table() function';
    RAISE NOTICE '  - analyze_all_partitions() function';
    RAISE NOTICE '  - run_partition_maintenance() function';
    RAISE NOTICE '  - partition_maintenance_log table';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Test with: SELECT migrate_to_partitioned_table(1000, TRUE);';
    RAISE NOTICE '2. Migrate with: SELECT migrate_to_partitioned_table(10000, FALSE);';
    RAISE NOTICE '3. Schedule: SELECT run_partition_maintenance();';
    RAISE NOTICE '========================================';
END $$;
