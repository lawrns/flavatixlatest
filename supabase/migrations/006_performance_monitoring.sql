-- =============================================================================
-- Migration 006: Performance Monitoring Infrastructure
-- =============================================================================
-- Purpose: Enable comprehensive query performance monitoring
-- Features:
--   - pg_stat_statements extension
--   - Custom monitoring views
--   - Performance baseline tracking
--   - Index usage analysis
--   - Slow query detection
--   - Dashboard-ready metrics
-- =============================================================================

-- =============================================================================
-- STEP 1: Enable pg_stat_statements extension
-- =============================================================================

-- Note: This may require superuser privileges
-- If running on Supabase, this is pre-enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Reset statistics to start fresh baseline
-- SELECT pg_stat_statements_reset(); -- Uncomment to reset

-- =============================================================================
-- STEP 2: Performance baseline table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.performance_baselines (
    id SERIAL PRIMARY KEY,
    baseline_name TEXT NOT NULL,
    query_pattern TEXT NOT NULL,
    target_p50_ms NUMERIC,
    target_p95_ms NUMERIC,
    target_p99_ms NUMERIC,
    max_rows_scanned BIGINT,
    max_buffers_hit BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(baseline_name)
);

-- Insert performance baselines for key queries
INSERT INTO public.performance_baselines (
    baseline_name, query_pattern, target_p50_ms, target_p95_ms, target_p99_ms
) VALUES
    ('wheel_generation', 'generate_wheel_data%', 50, 200, 500),
    ('descriptor_fetch', 'get_descriptors_paginated%', 20, 100, 250),
    ('autocomplete', 'autocomplete_descriptors%', 30, 100, 200),
    ('user_stats', 'get_user_descriptor_stats%', 10, 50, 100),
    ('similarity_search', 'find_similar_descriptors%', 50, 200, 500),
    ('duplicate_detection', 'find_duplicate_descriptors%', 100, 500, 1000)
ON CONFLICT (baseline_name) DO NOTHING;

-- =============================================================================
-- STEP 3: Query performance monitoring view
-- =============================================================================

CREATE OR REPLACE VIEW v_query_performance AS
SELECT
    queryid,
    LEFT(query, 100) as query_preview,
    calls,
    ROUND((total_exec_time / NULLIF(calls, 0))::numeric, 2) as avg_time_ms,
    ROUND(min_exec_time::numeric, 2) as min_time_ms,
    ROUND(max_exec_time::numeric, 2) as max_time_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
    ROUND(stddev_exec_time::numeric, 2) as stddev_time_ms,
    rows as total_rows,
    ROUND((rows::numeric / NULLIF(calls, 0)), 2) as avg_rows,
    shared_blks_hit,
    shared_blks_read,
    ROUND(
        (shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0) * 100),
        2
    ) as cache_hit_ratio,
    temp_blks_written,
    local_blks_hit,
    local_blks_read
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
AND query NOT LIKE '%performance_baselines%'
ORDER BY total_exec_time DESC;

COMMENT ON VIEW v_query_performance IS
'Query performance metrics from pg_stat_statements.
Shows avg time, cache hit ratio, and I/O statistics.';

-- =============================================================================
-- STEP 4: Slow query detection view
-- =============================================================================

CREATE OR REPLACE VIEW v_slow_queries AS
SELECT
    queryid,
    LEFT(query, 200) as query_text,
    calls,
    ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
    ROUND(max_exec_time::numeric, 2) as max_time_ms,
    ROUND(
        (shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0) * 100),
        2
    ) as cache_hit_ratio,
    rows / NULLIF(calls, 0) as avg_rows,
    CASE
        WHEN mean_exec_time > 1000 THEN 'CRITICAL'
        WHEN mean_exec_time > 500 THEN 'HIGH'
        WHEN mean_exec_time > 100 THEN 'MEDIUM'
        ELSE 'LOW'
    END as severity
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries averaging over 100ms
AND calls > 10  -- Called at least 10 times
AND query NOT LIKE '%pg_%'
ORDER BY mean_exec_time DESC
LIMIT 50;

COMMENT ON VIEW v_slow_queries IS
'Queries exceeding performance thresholds.
Severity: CRITICAL (>1s), HIGH (>500ms), MEDIUM (>100ms).';

-- =============================================================================
-- STEP 5: Index usage analysis view
-- =============================================================================

CREATE OR REPLACE VIEW v_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'RARELY_USED'
        WHEN idx_scan < 1000 THEN 'MODERATELY_USED'
        ELSE 'HEAVILY_USED'
    END as usage_category
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

COMMENT ON VIEW v_index_usage IS
'Index usage statistics. Identifies unused indexes that can be dropped.';

-- View for missing indexes (tables with lots of sequential scans)
CREATE OR REPLACE VIEW v_missing_indexes AS
SELECT
    schemaname,
    relname as table_name,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    ROUND(
        (seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100),
        2
    ) as seq_scan_pct,
    pg_size_pretty(pg_relation_size(relid)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND seq_scan > 1000  -- More than 1000 sequential scans
AND seq_scan > idx_scan  -- More seq scans than index scans
ORDER BY seq_scan DESC;

COMMENT ON VIEW v_missing_indexes IS
'Tables with high sequential scan ratios - candidates for new indexes.';

-- =============================================================================
-- STEP 6: Table statistics view
-- =============================================================================

CREATE OR REPLACE VIEW v_table_stats AS
SELECT
    schemaname,
    relname as table_name,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    ROUND(
        (n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100),
        2
    ) as dead_row_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

COMMENT ON VIEW v_table_stats IS
'Table statistics including row counts, dead tuples, and maintenance info.';

-- =============================================================================
-- STEP 7: Connection and lock monitoring
-- =============================================================================

CREATE OR REPLACE VIEW v_active_connections AS
SELECT
    datname as database,
    usename as username,
    application_name,
    client_addr,
    state,
    wait_event_type,
    wait_event,
    query_start,
    NOW() - query_start as query_duration,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
AND state != 'idle'
AND pid != pg_backend_pid()
ORDER BY query_start;

COMMENT ON VIEW v_active_connections IS
'Currently active (non-idle) database connections.';

CREATE OR REPLACE VIEW v_lock_conflicts AS
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    LEFT(blocked_activity.query, 100) AS blocked_query,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    LEFT(blocking_activity.query, 100) AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
    ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity
    ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

COMMENT ON VIEW v_lock_conflicts IS
'Shows blocked queries and the queries blocking them.';

-- =============================================================================
-- STEP 8: Performance snapshot function
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.performance_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    total_query_time_ms NUMERIC,
    avg_query_time_ms NUMERIC,
    slow_query_count INTEGER,
    cache_hit_ratio NUMERIC,
    deadlock_count BIGINT,
    conflicts_count BIGINT,
    temp_files_created BIGINT,
    temp_bytes_written BIGINT,
    flavor_descriptors_count BIGINT,
    flavor_wheels_count BIGINT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_performance_snapshots_time
ON public.performance_snapshots (snapshot_time DESC);

-- Function to capture performance snapshot
CREATE OR REPLACE FUNCTION capture_performance_snapshot()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_snapshot_id BIGINT;
BEGIN
    INSERT INTO public.performance_snapshots (
        total_connections,
        active_connections,
        idle_connections,
        total_query_time_ms,
        avg_query_time_ms,
        slow_query_count,
        cache_hit_ratio,
        deadlock_count,
        conflicts_count,
        temp_files_created,
        temp_bytes_written,
        flavor_descriptors_count,
        flavor_wheels_count,
        metadata
    )
    SELECT
        (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()),
        (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND state = 'active'),
        (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database() AND state = 'idle'),
        (SELECT COALESCE(SUM(total_exec_time), 0) FROM pg_stat_statements),
        (SELECT COALESCE(AVG(mean_exec_time), 0) FROM pg_stat_statements WHERE calls > 0),
        (SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 100 AND calls > 10),
        (SELECT
            ROUND(
                (SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit + blks_read), 0) * 100),
                2
            )
         FROM pg_stat_database
         WHERE datname = current_database()
        ),
        (SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()),
        (SELECT conflicts FROM pg_stat_database WHERE datname = current_database()),
        (SELECT temp_files FROM pg_stat_database WHERE datname = current_database()),
        (SELECT temp_bytes FROM pg_stat_database WHERE datname = current_database()),
        (SELECT COUNT(*) FROM public.flavor_descriptors),
        (SELECT COUNT(*) FROM public.flavor_wheels),
        jsonb_build_object(
            'pg_version', version(),
            'database', current_database(),
            'server_time', NOW()
        )
    RETURNING id INTO v_snapshot_id;

    RETURN v_snapshot_id;
END;
$$;

COMMENT ON FUNCTION capture_performance_snapshot() IS
'Capture a point-in-time performance snapshot.
Should be called periodically (e.g., every 5 minutes).';

-- =============================================================================
-- STEP 9: Monitoring dashboard query
-- =============================================================================

CREATE OR REPLACE FUNCTION get_monitoring_dashboard()
RETURNS JSONB
STABLE
LANGUAGE SQL
AS $$
    SELECT jsonb_build_object(
        'overview', (
            SELECT jsonb_build_object(
                'totalConnections', COUNT(*),
                'activeConnections', COUNT(*) FILTER (WHERE state = 'active'),
                'idleConnections', COUNT(*) FILTER (WHERE state = 'idle'),
                'longRunningQueries', COUNT(*) FILTER (
                    WHERE state = 'active' AND NOW() - query_start > INTERVAL '5 seconds'
                )
            )
            FROM pg_stat_activity
            WHERE datname = current_database()
        ),
        'cache', (
            SELECT jsonb_build_object(
                'hitRatio', ROUND(
                    (blks_hit::numeric / NULLIF(blks_hit + blks_read, 0) * 100),
                    2
                ),
                'blocksHit', blks_hit,
                'blocksRead', blks_read
            )
            FROM pg_stat_database
            WHERE datname = current_database()
        ),
        'slowQueries', (
            SELECT jsonb_agg(row_to_json(sq))
            FROM (SELECT * FROM v_slow_queries LIMIT 10) sq
        ),
        'unusedIndexes', (
            SELECT jsonb_agg(indexname)
            FROM v_index_usage
            WHERE usage_category = 'UNUSED'
            LIMIT 10
        ),
        'tableStats', (
            SELECT jsonb_agg(jsonb_build_object(
                'table', table_name,
                'liveRows', live_rows,
                'deadRowPct', dead_row_pct,
                'lastAnalyze', last_autoanalyze
            ))
            FROM v_table_stats
            WHERE table_name IN ('flavor_descriptors', 'flavor_wheels', 'quick_tastings')
        ),
        'recentSnapshots', (
            SELECT jsonb_agg(row_to_json(ps))
            FROM (
                SELECT
                    snapshot_time,
                    active_connections,
                    avg_query_time_ms,
                    slow_query_count,
                    cache_hit_ratio
                FROM public.performance_snapshots
                ORDER BY snapshot_time DESC
                LIMIT 10
            ) ps
        ),
        'generatedAt', NOW()
    );
$$;

COMMENT ON FUNCTION get_monitoring_dashboard() IS
'Get comprehensive monitoring dashboard data as JSON.
Suitable for API endpoints and admin dashboards.';

-- =============================================================================
-- STEP 10: Alert thresholds and checking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.performance_alerts (
    id SERIAL PRIMARY KEY,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    message TEXT NOT NULL,
    details JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_unacked
ON public.performance_alerts (created_at DESC)
WHERE acknowledged = FALSE;

-- Function to check performance thresholds and create alerts
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_alerts_created INTEGER := 0;
    v_cache_hit_ratio NUMERIC;
    v_active_connections INTEGER;
    v_slow_query_count INTEGER;
    v_dead_row_pct NUMERIC;
BEGIN
    -- Check cache hit ratio
    SELECT ROUND(
        (blks_hit::numeric / NULLIF(blks_hit + blks_read, 0) * 100),
        2
    )
    INTO v_cache_hit_ratio
    FROM pg_stat_database
    WHERE datname = current_database();

    IF v_cache_hit_ratio < 90 THEN
        INSERT INTO public.performance_alerts (alert_type, severity, message, details)
        VALUES (
            'CACHE_HIT_RATIO',
            CASE WHEN v_cache_hit_ratio < 80 THEN 'CRITICAL' ELSE 'WARNING' END,
            format('Cache hit ratio is %.2f%% (target: >95%%)', v_cache_hit_ratio),
            jsonb_build_object('value', v_cache_hit_ratio, 'threshold', 95)
        );
        v_alerts_created := v_alerts_created + 1;
    END IF;

    -- Check active connections
    SELECT COUNT(*)
    INTO v_active_connections
    FROM pg_stat_activity
    WHERE datname = current_database()
    AND state = 'active';

    IF v_active_connections > 50 THEN
        INSERT INTO public.performance_alerts (alert_type, severity, message, details)
        VALUES (
            'HIGH_CONNECTIONS',
            CASE WHEN v_active_connections > 100 THEN 'CRITICAL' ELSE 'WARNING' END,
            format('%s active connections', v_active_connections),
            jsonb_build_object('value', v_active_connections, 'threshold', 50)
        );
        v_alerts_created := v_alerts_created + 1;
    END IF;

    -- Check slow queries
    SELECT COUNT(*)
    INTO v_slow_query_count
    FROM pg_stat_statements
    WHERE mean_exec_time > 500
    AND calls > 10;

    IF v_slow_query_count > 5 THEN
        INSERT INTO public.performance_alerts (alert_type, severity, message, details)
        VALUES (
            'SLOW_QUERIES',
            CASE WHEN v_slow_query_count > 10 THEN 'CRITICAL' ELSE 'WARNING' END,
            format('%s queries averaging >500ms', v_slow_query_count),
            jsonb_build_object('value', v_slow_query_count, 'threshold', 5)
        );
        v_alerts_created := v_alerts_created + 1;
    END IF;

    -- Check dead tuple ratio on flavor_descriptors
    SELECT ROUND(
        (n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100),
        2
    )
    INTO v_dead_row_pct
    FROM pg_stat_user_tables
    WHERE relname = 'flavor_descriptors';

    IF v_dead_row_pct > 10 THEN
        INSERT INTO public.performance_alerts (alert_type, severity, message, details)
        VALUES (
            'HIGH_DEAD_TUPLES',
            CASE WHEN v_dead_row_pct > 20 THEN 'CRITICAL' ELSE 'WARNING' END,
            format('flavor_descriptors has %.2f%% dead tuples', v_dead_row_pct),
            jsonb_build_object('value', v_dead_row_pct, 'threshold', 10, 'table', 'flavor_descriptors')
        );
        v_alerts_created := v_alerts_created + 1;
    END IF;

    RETURN v_alerts_created;
END;
$$;

COMMENT ON FUNCTION check_performance_alerts() IS
'Check performance thresholds and create alerts.
Should be run periodically (e.g., every 15 minutes).';

-- =============================================================================
-- STEP 11: Cleanup old data
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_monitoring_data(
    p_retention_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    table_name TEXT,
    rows_deleted BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cutoff TIMESTAMP WITH TIME ZONE;
    v_deleted BIGINT;
BEGIN
    v_cutoff := NOW() - (p_retention_days || ' days')::interval;

    -- Cleanup snapshots
    DELETE FROM public.performance_snapshots
    WHERE snapshot_time < v_cutoff;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    table_name := 'performance_snapshots';
    rows_deleted := v_deleted;
    RETURN NEXT;

    -- Cleanup acknowledged alerts
    DELETE FROM public.performance_alerts
    WHERE acknowledged = TRUE
    AND created_at < v_cutoff;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    table_name := 'performance_alerts';
    rows_deleted := v_deleted;
    RETURN NEXT;

    -- Cleanup old partition maintenance logs
    DELETE FROM public.partition_maintenance_log
    WHERE executed_at < v_cutoff;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    table_name := 'partition_maintenance_log';
    rows_deleted := v_deleted;
    RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION cleanup_monitoring_data(INTEGER) IS
'Cleanup old monitoring data. Run weekly.';

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 006: Performance Monitoring Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - pg_stat_statements extension enabled';
    RAISE NOTICE '  - performance_baselines table';
    RAISE NOTICE '  - v_query_performance view';
    RAISE NOTICE '  - v_slow_queries view';
    RAISE NOTICE '  - v_index_usage view';
    RAISE NOTICE '  - v_missing_indexes view';
    RAISE NOTICE '  - v_table_stats view';
    RAISE NOTICE '  - v_active_connections view';
    RAISE NOTICE '  - v_lock_conflicts view';
    RAISE NOTICE '  - performance_snapshots table';
    RAISE NOTICE '  - performance_alerts table';
    RAISE NOTICE '  - capture_performance_snapshot() function';
    RAISE NOTICE '  - get_monitoring_dashboard() function';
    RAISE NOTICE '  - check_performance_alerts() function';
    RAISE NOTICE '  - cleanup_monitoring_data() function';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEDULING RECOMMENDATIONS:';
    RAISE NOTICE '  - Every 5 min: SELECT capture_performance_snapshot();';
    RAISE NOTICE '  - Every 15 min: SELECT check_performance_alerts();';
    RAISE NOTICE '  - Weekly: SELECT cleanup_monitoring_data(30);';
    RAISE NOTICE '========================================';
END $$;
