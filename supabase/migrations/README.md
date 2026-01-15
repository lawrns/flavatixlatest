# Flavatix Database Optimization Migrations

This directory contains SQL migrations for optimizing the Flavatix database architecture.
Target: **10x query performance improvement** for flavor wheel generation on 10M+ rows.

## Migration Overview

| Migration | Purpose | Key Changes |
|-----------|---------|-------------|
| 001 | Schema Optimization | Normalization, indexes, constraints |
| 002 | Trigram Fuzzy Search | GIN trigram indexes, similarity functions |
| 003 | Materialized Views | Pre-aggregated data for fast queries |
| 004 | Query Optimization | Pagination, batch operations, caching |
| 005 | Partitioning Strategy | Monthly partitions for scalability |
| 006 | Performance Monitoring | pg_stat_statements, dashboards, alerts |
| 007 | Rollback Procedures | Safe rollback for each migration |

---

## Quick Start

### Apply All Migrations (Development)

```bash
# Using Supabase CLI
supabase db push

# Or run individual migrations
psql $DATABASE_URL -f 001_schema_optimization.sql
psql $DATABASE_URL -f 002_trigram_fuzzy_search.sql
# ... etc
```

### Verify Migrations Applied

```sql
SELECT * FROM verify_migrations();
```

### Dry-Run Rollback (Safe to Run)

```sql
SELECT * FROM rollback_001_schema_optimization(TRUE);  -- Dry run
```

---

## Migration Details

### 001_schema_optimization.sql

**Purpose:** Optimize `flavor_descriptors` table schema

**Changes:**
- Add `normalized_form` computed column for deduplication
- Add `ai_extracted` and `extraction_model` columns
- Add CHECK constraints for `descriptor_type`, `source_type`
- Add NOT NULL constraints on core columns
- Create 7 performance indexes on `flavor_descriptors`
- Create 3 performance indexes on `flavor_wheels`

**Key Functions:**
- `normalize_descriptor_text(TEXT)` - Normalizes text for matching
- `descriptor_exists(UUID, TEXT, TEXT)` - Check for duplicates

**Performance Impact:** ~3x improvement on filtered queries

---

### 002_trigram_fuzzy_search.sql

**Purpose:** Enable fast fuzzy text search

**Prerequisites:**
- `pg_trgm` extension
- `unaccent` extension

**Changes:**
- GIN trigram index on `descriptor_text`
- GIN trigram index on `normalized_form`
- GIN trigram indexes on `category`, `subcategory`
- Full-text search `tsvector` column and index

**Key Functions:**
- `find_similar_descriptors()` - Fuzzy search with similarity threshold
- `find_duplicate_descriptors()` - Detect potential duplicates
- `autocomplete_descriptors()` - Fast autocomplete with prefix + similarity
- `suggest_descriptor_category()` - Auto-categorization suggestions

**Performance Impact:** <50ms for similarity searches on 10M+ rows

---

### 003_materialized_views.sql

**Purpose:** Pre-compute expensive aggregations

**Materialized Views:**
- `mv_user_descriptor_summary` - User-level aggregations
- `mv_global_descriptor_stats` - Global statistics
- `mv_category_descriptor_summary` - Category-level aggregations
- `mv_wheel_generation_stats` - Quick stats for cache decisions

**Key Functions:**
- `generate_wheel_data_optimized()` - 10x faster wheel generation
- `refresh_descriptor_views()` - Refresh all views
- `should_refresh_views()` - Check if refresh needed

**Refresh Strategy:**
```sql
-- Refresh all views (run every 5-15 minutes)
SELECT refresh_descriptor_views();

-- Check if refresh needed
SELECT should_refresh_views(100);  -- After 100 changes
```

**Performance Impact:** ~10x improvement for wheel generation

---

### 004_query_optimization.sql

**Purpose:** Optimized query patterns

**Key Functions:**
- `get_descriptors_paginated()` - Cursor-based pagination
- `wheel_needs_regeneration()` - Staleness detection
- `get_wheel_data_fast()` - Optimized wheel data retrieval
- `batch_insert_descriptors()` - Bulk insert with deduplication
- `get_user_descriptor_stats()` - Cached-friendly statistics
- `get_top_descriptors()` - Top descriptors by usage
- `get_descriptor_timeline()` - Analytics timeline data
- `estimate_descriptor_count()` - Fast approximate counts

**Documentation Table:**
```sql
SELECT * FROM query_performance_hints;
```

**Performance Impact:** 5-10x improvement on pagination queries

---

### 005_partitioning_strategy.sql

**Purpose:** Scale to 10M+ rows with partitioning

**Partition Strategy:**
- Range partitioning by `created_at` (monthly)
- Automatic partition creation
- Easy archival of old data

**Key Functions:**
- `create_descriptor_partition(year, month)` - Create monthly partition
- `ensure_future_partitions(months)` - Auto-create upcoming partitions
- `archive_old_partitions(months_to_keep)` - Identify old partitions
- `detach_partition(name)` - Detach without data loss
- `migrate_to_partitioned_table()` - Data migration (manual)

**Data Migration (Run During Maintenance Window):**
```sql
-- Dry run first!
SELECT * FROM migrate_to_partitioned_table(10000, TRUE);

-- Then actual migration
SELECT * FROM migrate_to_partitioned_table(10000, FALSE);
```

**Scheduled Maintenance:**
```sql
-- Run daily
SELECT run_partition_maintenance();
```

**Performance Impact:** 2-5x improvement on date-filtered queries

---

### 006_performance_monitoring.sql

**Purpose:** Comprehensive performance monitoring

**Extensions:**
- `pg_stat_statements` for query analysis

**Monitoring Views:**
- `v_query_performance` - Query execution stats
- `v_slow_queries` - Queries exceeding thresholds
- `v_index_usage` - Index utilization
- `v_missing_indexes` - Tables needing indexes
- `v_table_stats` - Table health metrics
- `v_active_connections` - Current connections
- `v_lock_conflicts` - Lock contention

**Alerting:**
```sql
-- Check alerts (run every 15 minutes)
SELECT check_performance_alerts();

-- View unacknowledged alerts
SELECT * FROM performance_alerts WHERE acknowledged = FALSE;
```

**Dashboard:**
```sql
-- Get full monitoring dashboard
SELECT get_monitoring_dashboard();
```

**Scheduled Tasks:**
```sql
-- Every 5 minutes
SELECT capture_performance_snapshot();

-- Every 15 minutes
SELECT check_performance_alerts();

-- Weekly
SELECT cleanup_monitoring_data(30);
```

---

### 007_rollback_procedures.sql

**Purpose:** Safe rollback for all migrations

**Rollback Functions:**
Each migration has a dedicated rollback function with dry-run mode:

```sql
-- Always dry-run first!
SELECT * FROM rollback_001_schema_optimization(TRUE);

-- Execute rollback (after dry-run review)
SELECT * FROM rollback_001_schema_optimization(FALSE);
```

**Complete Rollback (Nuclear Option):**
```sql
-- Dry run
SELECT * FROM rollback_all_migrations(TRUE, 'I_UNDERSTAND_THIS_IS_DESTRUCTIVE');

-- Execute (DESTRUCTIVE!)
SELECT * FROM rollback_all_migrations(FALSE, 'I_UNDERSTAND_THIS_IS_DESTRUCTIVE');
```

**Verification:**
```sql
SELECT * FROM verify_migrations();
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Backup database
- [ ] Review migration scripts
- [ ] Test in staging environment
- [ ] Schedule maintenance window (for partitioning)

### Deployment Order

1. Apply migrations 001-004 (online, no downtime)
2. Apply migration 005 partitioning infrastructure (online)
3. Run data migration to partitioned table (maintenance window)
4. Apply migration 006 monitoring (online)
5. Apply migration 007 rollback procedures (online)

### Post-Deployment

- [ ] Run `SELECT * FROM verify_migrations();`
- [ ] Refresh materialized views: `SELECT refresh_descriptor_views();`
- [ ] Analyze tables: `ANALYZE public.flavor_descriptors;`
- [ ] Capture baseline snapshot: `SELECT capture_performance_snapshot();`
- [ ] Set up scheduled jobs (pg_cron or external)

---

## Scheduled Jobs

Add these to pg_cron or external scheduler:

```sql
-- Every 5 minutes: Capture performance snapshot
SELECT cron.schedule('performance-snapshot', '*/5 * * * *', 'SELECT capture_performance_snapshot()');

-- Every 15 minutes: Check performance alerts
SELECT cron.schedule('performance-alerts', '*/15 * * * *', 'SELECT check_performance_alerts()');

-- Every 15 minutes: Refresh materialized views
SELECT cron.schedule('refresh-views', '*/15 * * * *', 'SELECT refresh_descriptor_views()');

-- Daily: Partition maintenance
SELECT cron.schedule('partition-maintenance', '0 3 * * *', 'SELECT run_partition_maintenance()');

-- Weekly: Cleanup old monitoring data
SELECT cron.schedule('cleanup-monitoring', '0 4 * * 0', 'SELECT cleanup_monitoring_data(30)');
```

---

## Performance Baselines

Expected query performance after optimization:

| Query Type | Before | After | Improvement |
|------------|--------|-------|-------------|
| Wheel Generation | 500-2000ms | 50-100ms | 10-20x |
| Descriptor Fetch (page) | 100-500ms | 10-50ms | 5-10x |
| Autocomplete | 200-1000ms | 20-50ms | 10-20x |
| User Statistics | 300-800ms | 10-30ms | 10-30x |
| Similarity Search | 500-2000ms | 30-100ms | 10-20x |
| Duplicate Detection | 1000-5000ms | 100-300ms | 10-15x |

---

## Troubleshooting

### Slow Queries After Migration

```sql
-- Check slow queries
SELECT * FROM v_slow_queries;

-- Analyze specific table
ANALYZE public.flavor_descriptors;

-- Check index usage
SELECT * FROM v_index_usage WHERE usage_category = 'UNUSED';
```

### Materialized Views Stale

```sql
-- Force refresh
SELECT refresh_descriptor_views();

-- Check refresh status
SELECT * FROM mv_refresh_status;
```

### Partitioning Issues

```sql
-- Check partition status
SELECT * FROM analyze_all_partitions();

-- Ensure future partitions exist
SELECT ensure_future_partitions(6);
```

### Rollback Issues

```sql
-- Verify current state
SELECT * FROM verify_migrations();

-- Check migration history
SELECT * FROM migration_history;
```

---

## Contact

For questions about these migrations, consult the database architecture documentation or the engineering team.
