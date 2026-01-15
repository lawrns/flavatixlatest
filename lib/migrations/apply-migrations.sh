#!/bin/bash

###############################################################################
# Flavatix Data Quality Migration Script
#
# Usage:
#   ./apply-migrations.sh dry-run    # Preview changes only
#   ./apply-migrations.sh execute    # Execute migrations
#   ./apply-migrations.sh verify     # Verify constraints are active
#   ./apply-migrations.sh rollback   # Rollback all changes
#
# Environment Variables:
#   DATABASE_URL - PostgreSQL connection string (required)
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_database_connection() {
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        echo "Example: export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
        exit 1
    fi

    log_info "Testing database connection..."
    if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi
    log_success "Database connection successful"
}

run_sql_file() {
    local file=$1
    local description=$2

    log_info "$description"
    log_info "Running: $file"

    if psql "$DATABASE_URL" -f "$file"; then
        log_success "Completed: $description"
    else
        log_error "Failed: $description"
        exit 1
    fi
}

run_sql_query() {
    local query=$1
    local description=$2

    log_info "$description"

    if psql "$DATABASE_URL" -c "$query"; then
        log_success "Completed: $description"
    else
        log_error "Failed: $description"
        exit 1
    fi
}

###############################################################################
# Pre-Migration Analysis
###############################################################################

run_analysis() {
    log_info "=========================================="
    log_info "RUNNING PRE-MIGRATION ANALYSIS"
    log_info "=========================================="

    # Count duplicates
    log_info "Checking for duplicate descriptors..."
    psql "$DATABASE_URL" -c "
        SELECT
            'Duplicate descriptor groups:' as metric,
            COUNT(*) as count
        FROM (
            SELECT user_id, LOWER(TRIM(descriptor_text)), descriptor_type, COUNT(*)
            FROM flavor_descriptors
            GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
            HAVING COUNT(*) > 1
        ) dupes;
    "

    # Count orphans
    log_info "Checking for orphaned descriptors..."
    psql "$DATABASE_URL" -c "
        SELECT
            COUNT(*) FILTER (WHERE source_type = 'quick_tasting' AND NOT EXISTS (SELECT 1 FROM quick_tastings WHERE id = source_id)) as orphaned_tastings,
            COUNT(*) FILTER (WHERE source_type = 'quick_review' AND NOT EXISTS (SELECT 1 FROM quick_reviews WHERE id = source_id)) as orphaned_reviews,
            COUNT(*) FILTER (WHERE source_type = 'prose_review' AND NOT EXISTS (SELECT 1 FROM prose_reviews WHERE id = source_id)) as orphaned_prose
        FROM flavor_descriptors;
    "

    log_success "Analysis complete"
}

###############################################################################
# Dry-Run Mode
###############################################################################

run_dry_run() {
    log_info "=========================================="
    log_info "RUNNING DRY-RUN MODE"
    log_info "=========================================="
    log_warning "No changes will be made to the database"

    run_analysis

    log_info "Running deduplication dry-run..."
    run_sql_file "$SCRIPT_DIR/20260115_005_deduplicate_descriptors.sql" "Deduplication Dry-Run"

    log_info "Running orphan cleanup dry-run..."
    run_sql_file "$SCRIPT_DIR/20260115_006_cleanup_orphaned_descriptors.sql" "Orphan Cleanup Dry-Run"

    log_success "Dry-run complete - review output above"
    log_warning "To execute migrations, run: $0 execute"
}

###############################################################################
# Execute Mode
###############################################################################

run_execute() {
    log_info "=========================================="
    log_info "EXECUTING MIGRATIONS"
    log_info "=========================================="
    log_warning "This will make PERMANENT changes to the database"

    # Confirm
    read -p "Are you sure you want to proceed? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warning "Aborted by user"
        exit 0
    fi

    # Create backups
    log_info "Creating backups..."
    run_sql_query "
        CREATE TABLE IF NOT EXISTS flavor_descriptors_backup_$(date +%Y%m%d) AS SELECT * FROM flavor_descriptors;
        CREATE TABLE IF NOT EXISTS quick_tastings_backup_$(date +%Y%m%d) AS SELECT * FROM quick_tastings;
    " "Creating backup tables"

    # Step 1: Data Cleanup
    log_info "Step 1/5: Deduplicating descriptors..."
    log_warning "Edit $SCRIPT_DIR/20260115_005_deduplicate_descriptors.sql and set DRY_RUN := false"
    read -p "Have you set DRY_RUN := false? (yes/no): " edited
    if [ "$edited" != "yes" ]; then
        log_error "Please edit the file and re-run"
        exit 1
    fi
    run_sql_file "$SCRIPT_DIR/20260115_005_deduplicate_descriptors.sql" "Deduplication"

    log_info "Step 2/5: Cleaning up orphaned descriptors..."
    log_warning "Edit $SCRIPT_DIR/20260115_006_cleanup_orphaned_descriptors.sql and set DRY_RUN := false"
    read -p "Have you set DRY_RUN := false? (yes/no): " edited
    if [ "$edited" != "yes" ]; then
        log_error "Please edit the file and re-run"
        exit 1
    fi
    run_sql_file "$SCRIPT_DIR/20260115_006_cleanup_orphaned_descriptors.sql" "Orphan Cleanup"

    # Step 2: Apply Constraints
    log_info "Step 3/5: Adding text length constraints..."
    run_sql_file "$SCRIPT_DIR/20260115_001_add_text_length_constraints.sql" "Text Length Constraints"

    log_info "Step 4/5: Adding completed tasting constraints..."
    run_sql_file "$SCRIPT_DIR/20260115_002_add_completed_tasting_constraints.sql" "Completed Tasting Constraints"

    log_info "Step 5/5: Adding normalized descriptor constraints..."
    run_sql_file "$SCRIPT_DIR/20260115_003_add_normalized_descriptor_constraints.sql" "Normalized Descriptor Constraints"

    log_info "Step 6/6: Adding cascade delete constraints..."
    run_sql_file "$SCRIPT_DIR/20260115_004_add_cascade_delete_constraints.sql" "Cascade Delete Constraints"

    log_success "=========================================="
    log_success "ALL MIGRATIONS COMPLETED SUCCESSFULLY"
    log_success "=========================================="
    log_info "Next steps:"
    log_info "  1. Run: $0 verify"
    log_info "  2. Deploy application code changes"
    log_info "  3. Monitor database for 24 hours"
}

###############################################################################
# Verify Mode
###############################################################################

run_verify() {
    log_info "=========================================="
    log_info "VERIFYING MIGRATIONS"
    log_info "=========================================="

    # Check constraints
    log_info "Checking constraints..."
    psql "$DATABASE_URL" -c "
        SELECT conname, contype, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'flavor_descriptors'::regclass
        ORDER BY conname;
    "

    # Check triggers
    log_info "Checking triggers..."
    psql "$DATABASE_URL" -c "
        SELECT tgname, tgtype, tgenabled
        FROM pg_trigger
        WHERE tgrelid IN ('flavor_descriptors'::regclass, 'quick_tastings'::regclass, 'quick_reviews'::regclass, 'prose_reviews'::regclass)
        ORDER BY tgname;
    "

    # Check for duplicates (should be 0)
    log_info "Checking for remaining duplicates..."
    psql "$DATABASE_URL" -c "
        SELECT COUNT(*) as remaining_duplicates
        FROM (
            SELECT user_id, LOWER(TRIM(descriptor_text)), descriptor_type, COUNT(*)
            FROM flavor_descriptors
            GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
            HAVING COUNT(*) > 1
        ) dupes;
    "

    # Check for orphans (should be 0)
    log_info "Checking for remaining orphans..."
    psql "$DATABASE_URL" -c "
        SELECT COUNT(*) as remaining_orphans
        FROM flavor_descriptors fd
        WHERE NOT EXISTS (
            SELECT 1 FROM quick_tastings WHERE id = fd.source_id AND fd.source_type = 'quick_tasting'
        ) AND NOT EXISTS (
            SELECT 1 FROM quick_reviews WHERE id = fd.source_id AND fd.source_type = 'quick_review'
        ) AND NOT EXISTS (
            SELECT 1 FROM prose_reviews WHERE id = fd.source_id AND fd.source_type = 'prose_review'
        );
    "

    log_success "Verification complete"
}

###############################################################################
# Rollback Mode
###############################################################################

run_rollback() {
    log_info "=========================================="
    log_info "ROLLING BACK MIGRATIONS"
    log_info "=========================================="
    log_warning "This will RESTORE the database to pre-migration state"

    # Confirm
    read -p "Are you sure you want to rollback? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warning "Aborted by user"
        exit 0
    fi

    # Restore from backup
    log_info "Restoring from backup..."
    run_sql_query "
        BEGIN;
        TRUNCATE flavor_descriptors;
        INSERT INTO flavor_descriptors SELECT * FROM flavor_descriptors_backup_$(date +%Y%m%d);
        COMMIT;
    " "Restoring flavor_descriptors from backup"

    # Drop constraints
    log_info "Dropping constraints..."
    run_sql_query "
        ALTER TABLE flavor_descriptors DROP CONSTRAINT IF EXISTS flavor_descriptors_descriptor_text_length_check;
        ALTER TABLE flavor_descriptors DROP CONSTRAINT IF EXISTS flavor_descriptors_item_name_length_check;
        ALTER TABLE quick_tasting_items DROP CONSTRAINT IF EXISTS quick_tasting_items_item_name_length_check;
    " "Dropping constraints"

    # Drop indexes
    log_info "Dropping indexes..."
    run_sql_query "
        DROP INDEX IF EXISTS idx_flavor_descriptors_unique_normalized;
        DROP INDEX IF EXISTS idx_flavor_descriptors_normalized_form;
    " "Dropping indexes"

    # Drop triggers
    log_info "Dropping triggers..."
    run_sql_query "
        DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_tasting_descriptors ON quick_tastings;
        DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_review_descriptors ON quick_reviews;
        DROP TRIGGER IF EXISTS trigger_cascade_delete_prose_review_descriptors ON prose_reviews;
        DROP TRIGGER IF EXISTS trigger_validate_descriptor_source ON flavor_descriptors;
        DROP TRIGGER IF EXISTS trigger_generate_normalized_form ON flavor_descriptors;
        DROP TRIGGER IF EXISTS trigger_update_tasting_completion ON quick_tastings;
    " "Dropping triggers"

    log_success "Rollback complete"
}

###############################################################################
# Main Script
###############################################################################

main() {
    local mode=$1

    # Check database connection
    check_database_connection

    case "$mode" in
        dry-run)
            run_dry_run
            ;;
        execute)
            run_execute
            ;;
        verify)
            run_verify
            ;;
        rollback)
            run_rollback
            ;;
        *)
            log_error "Invalid mode: $mode"
            echo ""
            echo "Usage: $0 {dry-run|execute|verify|rollback}"
            echo ""
            echo "Modes:"
            echo "  dry-run   - Preview changes without modifying database"
            echo "  execute   - Execute all migrations (requires confirmation)"
            echo "  verify    - Verify migrations were applied correctly"
            echo "  rollback  - Rollback all migrations (requires confirmation)"
            exit 1
            ;;
    esac
}

# Run main with all arguments
main "$@"
