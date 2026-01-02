#!/bin/bash

################################################################################
# ============================================================================
# ULTIMATE SDET CLEANUP SCRIPT (FINAL) +++++
# ============================================================================
# Comprehensive cleanup utility for SDET-PW-Practice automation framework
# Removes test artifacts, logs, caches, and temporary files safely
# Features: Dry-run mode, selective cleanup, detailed logging, error handling
# ============================================================================
################################################################################

set -euo pipefail

################################################################################
# CONFIGURATION & VARIABLES
################################################################################

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Counters
DIRS_REMOVED=0
FILES_REMOVED=0
DIRS_SKIPPED=0
FILES_SKIPPED=0
ERRORS=0

# Default values
DRY_RUN=false
VERBOSE=false
INTERACTIVE=true
KEEP_REPORTS=false
CLEANUP_LEVEL="full"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

# Verbose logging
log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}📝 $1${NC}"
    fi
}

# Execute or simulate removal
safe_remove() {
    local target=$1
    local type=$2

    if [ ! -e "$target" ]; then
        log_verbose "Skipped (not found): $target"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would remove $type: $target"
        if [ "$type" = "directory" ]; then
            ((DIRS_SKIPPED++))
        else
            ((FILES_SKIPPED++))
        fi
        return 0
    fi

    if rm -rf "$target" 2>/dev/null; then
        log_verbose "Removed $type: $target"
        if [ "$type" = "directory" ]; then
            ((DIRS_REMOVED++))
        else
            ((FILES_REMOVED++))
        fi
        return 0
    else
        print_error "Failed to remove $type: $target"
        ((ERRORS++))
        return 1
    fi
}

# Display usage information
usage() {
    cat << EOF
${BOLD}ULTIMATE SDET CLEANUP SCRIPT${NC}

${BOLD}Usage:${NC}
    $(basename "$0") [OPTIONS]

${BOLD}Options:${NC}
    -h, --help              Show this help message
    -d, --dry-run           Show what would be deleted without actually deleting
    -v, --verbose           Enable verbose output
    -y, --yes               Skip confirmation prompts (non-interactive)
    -l, --level LEVEL       Cleanup level (basic|standard|aggressive|nuclear)
                            basic: Test results and logs only
                            standard: Basic + caches (default)
                            aggressive: Standard + node_modules cache
                            nuclear: Everything (including node_modules)
    -k, --keep-reports      Keep HTML and Allure reports
    --no-backup             Don't create backup of removed files

${BOLD}Examples:${NC}
    # Dry run to see what will be deleted
    ./clean-all.sh --dry-run --verbose

    # Basic cleanup in non-interactive mode
    ./clean-all.sh --yes --level basic

    # Aggressive cleanup with verbose output
    ./clean-all.sh --level aggressive --verbose

    # Nuclear option (be careful!)
    ./clean-all.sh --yes --level nuclear

EOF
    exit 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                ;;
            -d|--dry-run)
                DRY_RUN=true
                print_warning "Dry run mode enabled - no files will be deleted"
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
            -l|--level)
                CLEANUP_LEVEL="$2"
                shift 2
                ;;
            -k|--keep-reports)
                KEEP_REPORTS=true
                shift
                ;;
            --no-backup)
                # Option for future use
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                ;;
        esac
    done
}

# Confirm action with user
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

# Backup important data before cleanup
create_backup() {
    if [ "$DRY_RUN" = true ]; then
        return 0
    fi

    local backup_dir="${PROJECT_ROOT}/.cleanup-backup/${TIMESTAMP}"

    if [ -d "${PROJECT_ROOT}/test-results" ]; then
        print_info "Creating backup of test results..."
        mkdir -p "$backup_dir"
        cp -r "${PROJECT_ROOT}/test-results" "$backup_dir/" 2>/dev/null || true
        print_success "Backup created: $backup_dir"
    fi
}

# Display cleanup summary
summary() {
    print_header "CLEANUP SUMMARY"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}📊 DRY RUN - NO ACTUAL DELETION${NC}\n"
        echo "Would remove:"
        echo "  • Directories: $DIRS_SKIPPED"
        echo "  • Files: $FILES_SKIPPED"
    else
        echo "Removed:"
        echo -e "  ${GREEN}• Directories: $DIRS_REMOVED${NC}"
        echo -e "  ${GREEN}• Files: $FILES_REMOVED${NC}"
    fi

    if [ $ERRORS -gt 0 ]; then
        echo -e "  ${RED}• Errors: $ERRORS${NC}"
    fi

    echo ""
    echo "Cleanup Level: $CLEANUP_LEVEL"
    echo "Keep Reports: $KEEP_REPORTS"
    echo ""

    if [ "$DRY_RUN" = false ] && [ $ERRORS -eq 0 ]; then
        print_success "Cleanup completed successfully!"
    elif [ $ERRORS -gt 0 ]; then
        print_warning "Cleanup completed with $ERRORS error(s)"
    fi
}

# BASIC CLEANUP: Test results and logs
cleanup_basic() {
    print_header "BASIC CLEANUP - Test Results & Logs"

    safe_remove "${PROJECT_ROOT}/test-results" "directory"
    safe_remove "${PROJECT_ROOT}/logs" "directory"
    safe_remove "${PROJECT_ROOT}/*.log" "files"
    safe_remove "${PROJECT_ROOT}/npm-debug.log" "file"
    safe_remove "${PROJECT_ROOT}/.jest-cache" "directory"
}

# STANDARD CLEANUP: Basic + caches
cleanup_standard() {
    print_header "STANDARD CLEANUP - Results, Logs & Caches"

    cleanup_basic

    safe_remove "${PROJECT_ROOT}/.eslintcache" "file"
    safe_remove "${PROJECT_ROOT}/.stylelintcache" "file"
    safe_remove "${PROJECT_ROOT}/.cache" "directory"
    safe_remove "${PROJECT_ROOT}/.turbo" "directory"
    safe_remove "${PROJECT_ROOT}/.swc" "directory"
    safe_remove "${PROJECT_ROOT}/.parcel-cache" "directory"
}

# AGGRESSIVE CLEANUP: Standard + node_modules cache
cleanup_aggressive() {
    print_header "AGGRESSIVE CLEANUP - Standard + Node Modules Cache"

    cleanup_standard

    safe_remove "${PROJECT_ROOT}/.npm" "directory"
    safe_remove "${PROJECT_ROOT}/.pnpm-store" "directory"
    safe_remove "${PROJECT_ROOT}/.yarn/cache" "directory"

    # Clean playwright cache
    if [ -d "${PROJECT_ROOT}/playwright" ]; then
        find "${PROJECT_ROOT}/playwright" -type f -name "*.tmp" -delete 2>/dev/null || true
    fi

    safe_remove "${PROJECT_ROOT}/downloads" "directory"
    safe_remove "${PROJECT_ROOT}/playwright/downloads" "directory"
}

# NUCLEAR CLEANUP: Everything including node_modules
cleanup_nuclear() {
    print_header "NUCLEAR CLEANUP - EVERYTHING INCLUDING NODE_MODULES"

    print_error "WARNING: This will delete node_modules and all dependencies!"
    if ! confirm "Continue with nuclear cleanup?"; then
        print_warning "Nuclear cleanup cancelled"
        return 1
    fi

    cleanup_aggressive

    safe_remove "${PROJECT_ROOT}/node_modules" "directory"
    safe_remove "${PROJECT_ROOT}/.pnpm-lock.yaml" "file"
    safe_remove "${PROJECT_ROOT}/pnpm-lock.yaml" "file"
    safe_remove "${PROJECT_ROOT}/package-lock.json" "file"
    safe_remove "${PROJECT_ROOT}/yarn.lock" "file"
}

# Report-specific cleanup
cleanup_reports() {
    print_header "Cleaning Reports"

    if [ "$KEEP_REPORTS" = true ]; then
        print_warning "Keeping reports as requested"
        return 0
    fi

    safe_remove "${PROJECT_ROOT}/allure-results" "directory"
    safe_remove "${PROJECT_ROOT}/allure-report" "directory"
    safe_remove "${PROJECT_ROOT}/playwright-report" "directory"
    safe_remove "${PROJECT_ROOT}/reports" "directory"
    safe_remove "${PROJECT_ROOT}/coverage" "directory"
    safe_remove "${PROJECT_ROOT}/metrics" "directory"
}

# Media cleanup
cleanup_media() {
    print_header "Cleaning Media Files (Videos, Screenshots, Traces)"

    safe_remove "${PROJECT_ROOT}/playwright/videos" "directory"
    safe_remove "${PROJECT_ROOT}/playwright/screenshots" "directory"
    safe_remove "${PROJECT_ROOT}/playwright/traces" "directory"
    safe_remove "${PROJECT_ROOT}/playwright/downloads" "directory"
    safe_remove "${PROJECT_ROOT}/hars" "directory"
}

# Environment-specific cleanup
cleanup_environment() {
    print_header "Cleaning Environment Files"

    safe_remove "${PROJECT_ROOT}/.env.test.local" "file"
    safe_remove "${PROJECT_ROOT}/.env.local" "file"
}

# Verify directory structure
verify_structure() {
    print_header "Verifying Project Structure"

    local required_dirs=(
        "src"
        "config"
        "package.json"
        "tsconfig.json"
    )

    for item in "${required_dirs[@]}"; do
        if [ -e "${PROJECT_ROOT}/$item" ]; then
            print_success "Found: $item"
        else
            print_error "Missing: $item"
            return 1
        fi
    done
}

# Main execution
main() {
    clear

    print_header "ULTIMATE SDET CLEANUP SCRIPT (FINAL) +++++"

    print_info "Project Root: $PROJECT_ROOT"
    print_info "Cleanup Level: $CLEANUP_LEVEL"
    print_info "Dry Run: $DRY_RUN"
    print_info "Verbose: $VERBOSE"

    # Verify project structure
    if ! verify_structure; then
        print_error "Project structure verification failed!"
        exit 1
    fi

    # Confirm before proceeding (unless non-interactive)
    if [ "$INTERACTIVE" = true ] && [ "$DRY_RUN" = false ]; then
        if ! confirm "Proceed with $CLEANUP_LEVEL cleanup?"; then
            print_warning "Cleanup cancelled by user"
            exit 0
        fi
    fi

    # Create backup if not dry run
    if [ "$DRY_RUN" = false ]; then
        create_backup
    fi

    # Execute cleanup based on level
    case "$CLEANUP_LEVEL" in
        basic)
            cleanup_basic
            ;;
        standard)
            cleanup_standard
            ;;
        aggressive)
            cleanup_aggressive
            ;;
        nuclear)
            cleanup_nuclear || exit 1
            ;;
        *)
            print_error "Unknown cleanup level: $CLEANUP_LEVEL"
            exit 1
            ;;
    esac

    # Always cleanup reports and media
    cleanup_reports
    cleanup_media

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
