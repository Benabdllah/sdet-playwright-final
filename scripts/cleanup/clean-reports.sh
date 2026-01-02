#!/bin/bash

################################################################################
# ============================================================================
# ULTIMATE SDET REPORT CLEANUP SCRIPT (FINAL) +++++
# ============================================================================
# Specialized cleanup utility for test reports and metrics
# Manages: Allure, Playwright, Jest, Cucumber, Coverage, Metrics reports
# Features: Archive, backup, selective cleanup, dry-run, detailed logging
# ============================================================================
################################################################################

set -euo pipefail

################################################################################
# CONFIGURATION & VARIABLES
################################################################################

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Counters
REPORTS_REMOVED=0
REPORTS_ARCHIVED=0
SPACE_FREED=0
ERRORS=0

# Default values
DRY_RUN=false
VERBOSE=false
INTERACTIVE=true
ARCHIVE=false
ARCHIVE_DIR=""
BACKUP=true
REPORT_TYPE="all"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAYS_TO_KEEP=30

# Report directories
ALLURE_RESULTS="${PROJECT_ROOT}/allure-results"
ALLURE_REPORT="${PROJECT_ROOT}/allure-report"
PLAYWRIGHT_REPORT="${PROJECT_ROOT}/playwright-report"
JEST_REPORT="${PROJECT_ROOT}/test-results"
COVERAGE_REPORT="${PROJECT_ROOT}/test-results/coverage"
CUCUMBER_REPORT="${PROJECT_ROOT}/test-results/cucumber"
METRICS_DIR="${PROJECT_ROOT}/metrics"
REPORTS_DIR="${PROJECT_ROOT}/reports"

################################################################################
# FUNCTIONS
################################################################################

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

print_subheader() {
    echo -e "\n${MAGENTA}▶ $1${NC}"
}

# Verbose logging
log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}📝 $1${NC}"
    fi
}

# Get directory size
get_size() {
    local target=$1
    if [ -d "$target" ]; then
        du -sh "$target" 2>/dev/null | awk '{print $1}' || echo "0B"
    elif [ -f "$target" ]; then
        ls -lh "$target" 2>/dev/null | awk '{print $5}' || echo "0B"
    else
        echo "0B"
    fi
}

# Format bytes to human readable
format_size() {
    local bytes=$1
    if [ "$bytes" -lt 1024 ]; then
        echo "${bytes}B"
    elif [ "$bytes" -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    elif [ "$bytes" -lt 1073741824 ]; then
        echo "$((bytes / 1048576))MB"
    else
        echo "$((bytes / 1073741824))GB"
    fi
}

# Archive report
archive_report() {
    local report_path=$1
    local report_name=$2

    if [ ! -e "$report_path" ]; then
        log_verbose "Report not found: $report_path"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would archive: $report_path"
        return 0
    fi

    if [ "$ARCHIVE" = false ]; then
        return 0
    fi

    local size=$(get_size "$report_path")
    local archive_path="${ARCHIVE_DIR}/${report_name}_${TIMESTAMP}"

    mkdir -p "$ARCHIVE_DIR"

    if cp -r "$report_path" "$archive_path" 2>/dev/null; then
        print_success "Archived: $report_name ($size) → $archive_path"
        ((REPORTS_ARCHIVED++))
        return 0
    else
        print_error "Failed to archive: $report_name"
        ((ERRORS++))
        return 1
    fi
}

# Safe remove function
safe_remove() {
    local target=$1
    local report_name=$2

    if [ ! -e "$target" ]; then
        log_verbose "Skipped (not found): $target"
        return 0
    fi

    local size=$(get_size "$target")

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would remove $report_name: $target ($size)"
        ((REPORTS_REMOVED++))
        return 0
    fi

    if rm -rf "$target" 2>/dev/null; then
        log_verbose "Removed: $report_name ($size)"
        ((REPORTS_REMOVED++))
        print_success "Deleted: $report_name ($size)"
        return 0
    else
        print_error "Failed to remove: $report_name"
        ((ERRORS++))
        return 1
    fi
}

# Delete old reports (older than N days)
delete_old_reports() {
    local target_dir=$1
    local report_name=$2
    local days=$3

    if [ ! -d "$target_dir" ]; then
        return 0
    fi

    print_subheader "Cleaning old $report_name (older than $days days)"

    find "$target_dir" -type f -mtime +$days -delete 2>/dev/null || true
    find "$target_dir" -type d -empty -delete 2>/dev/null || true

    print_success "Old $report_name cleaned"
}

# Display usage
usage() {
    cat << EOF
${BOLD}ULTIMATE SDET REPORT CLEANUP SCRIPT${NC}

${BOLD}Usage:${NC}
    $(basename "$0") [OPTIONS]

${BOLD}Options:${NC}
    -h, --help              Show this help message
    -d, --dry-run           Preview what would be deleted
    -v, --verbose           Enable verbose output
    -y, --yes               Skip confirmation prompts
    -a, --archive           Archive reports before deletion
    -r, --type TYPE         Report type to clean (all|allure|playwright|jest|
                            coverage|cucumber|metrics)
    --archive-dir DIR       Custom archive directory
    --keep-days DAYS        Keep reports newer than N days (default: $DAYS_TO_KEEP)
    --no-backup             Skip backup creation

${BOLD}Examples:${NC}
    # Dry run preview
    ./clean-reports.sh --dry-run --verbose

    # Archive and clean all reports
    ./clean-reports.sh --archive --yes

    # Clean only Allure reports, keep last 14 days
    ./clean-reports.sh --type allure --keep-days 14 --yes

    # Clean Playwright reports with archive
    ./clean-reports.sh --type playwright --archive --yes

EOF
    exit 0
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                ;;
            -d|--dry-run)
                DRY_RUN=true
                print_warning "Dry run mode enabled"
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -y|--yes)
                INTERACTIVE=false
                shift
                ;;
            -a|--archive)
                ARCHIVE=true
                ARCHIVE_DIR="${PROJECT_ROOT}/.report-archives"
                shift
                ;;
            -r|--type)
                REPORT_TYPE="$2"
                shift 2
                ;;
            --archive-dir)
                ARCHIVE_DIR="$2"
                ARCHIVE=true
                shift 2
                ;;
            --keep-days)
                DAYS_TO_KEEP="$2"
                shift 2
                ;;
            --no-backup)
                BACKUP=false
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                ;;
        esac
    done
}

# Confirm action
confirm() {
    if [ "$INTERACTIVE" = false ]; then
        return 0
    fi

    local prompt="$1"
    local response

    echo -n -e "${YELLOW}$prompt (y/N): ${NC}"
    read -r response

    [[ "$response" == [yY] ]]
}

# Create backup before cleaning
create_backup() {
    if [ "$BACKUP" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    local backup_dir="${PROJECT_ROOT}/.report-backup/${TIMESTAMP}"

    print_subheader "Creating backup"

    for report_dir in "$ALLURE_RESULTS" "$PLAYWRIGHT_REPORT" "$JEST_REPORT"; do
        if [ -d "$report_dir" ]; then
            mkdir -p "$backup_dir"
            cp -r "$report_dir" "$backup_dir/" 2>/dev/null || true
        fi
    done

    print_success "Backup created: $backup_dir"
}

# Allure reports cleanup
clean_allure() {
    print_header "CLEANING ALLURE REPORTS"

    if [ -d "$ALLURE_RESULTS" ]; then
        print_subheader "Allure Results"
        archive_report "$ALLURE_RESULTS" "allure-results"
        safe_remove "$ALLURE_RESULTS" "Allure Results"
    fi

    if [ -d "$ALLURE_REPORT" ]; then
        print_subheader "Allure Report"
        archive_report "$ALLURE_REPORT" "allure-report"
        safe_remove "$ALLURE_REPORT" "Allure Report"
    fi
}

# Playwright reports cleanup
clean_playwright() {
    print_header "CLEANING PLAYWRIGHT REPORTS"

    if [ -d "$PLAYWRIGHT_REPORT" ]; then
        print_subheader "Playwright Report"
        archive_report "$PLAYWRIGHT_REPORT" "playwright-report"
        safe_remove "$PLAYWRIGHT_REPORT" "Playwright Report"
    fi

    # Clean playwright cache
    if [ -d "${PROJECT_ROOT}/.playwright" ]; then
        safe_remove "${PROJECT_ROOT}/.playwright" "Playwright Cache"
    fi
}

# Jest/Test Results cleanup
clean_jest() {
    print_header "CLEANING JEST TEST RESULTS"

    if [ -d "$JEST_REPORT" ]; then
        print_subheader "Jest Test Results"
        archive_report "$JEST_REPORT" "jest-results"
        safe_remove "$JEST_REPORT" "Jest Test Results"
    fi

    if [ -f "${PROJECT_ROOT}/test-results/summary.json" ]; then
        safe_remove "${PROJECT_ROOT}/test-results/summary.json" "Jest Summary"
    fi
}

# Coverage reports cleanup
clean_coverage() {
    print_header "CLEANING COVERAGE REPORTS"

    if [ -d "$COVERAGE_REPORT" ]; then
        print_subheader "Coverage Report"
        archive_report "$COVERAGE_REPORT" "coverage-report"
        safe_remove "$COVERAGE_REPORT" "Coverage Report"
    fi

    safe_remove "${PROJECT_ROOT}/.nyc_output" "NYC Output"
}

# Cucumber reports cleanup
clean_cucumber() {
    print_header "CLEANING CUCUMBER REPORTS"

    if [ -d "$CUCUMBER_REPORT" ]; then
        print_subheader "Cucumber Report"
        archive_report "$CUCUMBER_REPORT" "cucumber-report"
        safe_remove "$CUCUMBER_REPORT" "Cucumber Report"
    fi

    # Clean Cucumber cache
    if [ -d "${PROJECT_ROOT}/cucumber" ]; then
        find "${PROJECT_ROOT}/cucumber" -type f -name "*.json" -delete 2>/dev/null || true
        print_success "Cleaned: Cucumber cache"
    fi
}

# Metrics cleanup
clean_metrics() {
    print_header "CLEANING METRICS"

    if [ -d "$METRICS_DIR" ]; then
        print_subheader "Metrics Directory"
        archive_report "$METRICS_DIR" "metrics"
        safe_remove "$METRICS_DIR" "Metrics"
    fi
}

# Legacy reports cleanup
clean_legacy() {
    print_header "CLEANING LEGACY REPORTS"

    if [ -d "$REPORTS_DIR" ]; then
        print_subheader "Reports Directory"
        archive_report "$REPORTS_DIR" "reports"
        safe_remove "$REPORTS_DIR" "Legacy Reports"
    fi
}

# Clean all reports
clean_all_reports() {
    clean_allure
    clean_playwright
    clean_jest
    clean_coverage
    clean_cucumber
    clean_metrics
    clean_legacy
}

# Generate report statistics
generate_stats() {
    print_header "REPORT STATISTICS"

    local allure_size=$(get_size "$ALLURE_REPORT")
    local playwright_size=$(get_size "$PLAYWRIGHT_REPORT")
    local jest_size=$(get_size "$JEST_REPORT")
    local coverage_size=$(get_size "$COVERAGE_REPORT")
    local metrics_size=$(get_size "$METRICS_DIR")

    echo "Current Report Sizes:"
    echo "  • Allure: $allure_size"
    echo "  • Playwright: $playwright_size"
    echo "  • Jest: $jest_size"
    echo "  • Coverage: $coverage_size"
    echo "  • Metrics: $metrics_size"
    echo ""
}

# Display summary
summary() {
    print_header "CLEANUP SUMMARY"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}📊 DRY RUN - NO ACTUAL DELETION${NC}\n"
    fi

    echo "Reports Removed: ${GREEN}$REPORTS_REMOVED${NC}"
    echo "Reports Archived: ${GREEN}$REPORTS_ARCHIVED${NC}"
    echo "Errors: $([ $ERRORS -eq 0 ] && echo "${GREEN}0${NC}" || echo "${RED}$ERRORS${NC}")"
    echo ""

    if [ -n "$ARCHIVE_DIR" ] && [ -d "$ARCHIVE_DIR" ]; then
        echo "Archive Location: $ARCHIVE_DIR"
        echo "Archive Size: $(du -sh "$ARCHIVE_DIR" 2>/dev/null | awk '{print $1}')"
        echo ""
    fi

    if [ "$DRY_RUN" = false ] && [ $ERRORS -eq 0 ]; then
        print_success "Report cleanup completed successfully!"
    elif [ $ERRORS -gt 0 ]; then
        print_warning "Report cleanup completed with $ERRORS error(s)"
    fi
}

# Main execution
main() {
    clear

    print_header "ULTIMATE SDET REPORT CLEANUP SCRIPT (FINAL) +++++"

    print_info "Project Root: $PROJECT_ROOT"
    print_info "Report Type: $REPORT_TYPE"
    print_info "Dry Run: $DRY_RUN"
    print_info "Archive: $ARCHIVE"
    print_info "Verbose: $VERBOSE"

    # Generate statistics
    generate_stats

    # Confirm before proceeding
    if [ "$INTERACTIVE" = true ] && [ "$DRY_RUN" = false ]; then
        if ! confirm "Proceed with $REPORT_TYPE report cleanup?"; then
            print_warning "Cleanup cancelled by user"
            exit 0
        fi
    fi

    # Create backup
    create_backup

    # Execute cleanup based on type
    case "$REPORT_TYPE" in
        all)
            clean_all_reports
            ;;
        allure)
            clean_allure
            ;;
        playwright)
            clean_playwright
            ;;
        jest)
            clean_jest
            ;;
        coverage)
            clean_coverage
            ;;
        cucumber)
            clean_cucumber
            ;;
        metrics)
            clean_metrics
            ;;
        *)
            print_error "Unknown report type: $REPORT_TYPE"
            usage
            ;;
    esac

    # Display summary
    summary

    # Exit with appropriate code
    if [ $ERRORS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

################################################################################
# SCRIPT EXECUTION
################################################################################

# Parse arguments
parse_args "$@"

# Execute main function
main
