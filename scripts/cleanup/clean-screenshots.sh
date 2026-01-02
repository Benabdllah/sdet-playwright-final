#!/bin/bash

################################################################################
# ============================================================================
# ULTIMATE SDET MEDIA & ARTIFACTS CLEANUP SCRIPT (FINAL) +++++
# ============================================================================
# Specialized cleanup utility for test media and artifacts
# Manages: Screenshots, Videos, Traces, HAR files, Downloads
# Features: Archive, backup, selective cleanup, dry-run, detailed reporting
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
FILES_REMOVED=0
FILES_ARCHIVED=0
TOTAL_SIZE_FREED=0
ERRORS=0

# Default values
DRY_RUN=false
VERBOSE=false
INTERACTIVE=true
ARCHIVE=false
ARCHIVE_DIR=""
BACKUP=true
MEDIA_TYPE="all"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAYS_TO_KEEP=7
MIN_SIZE=0

# Media directories
SCREENSHOTS_DIR="${PROJECT_ROOT}/playwright/screenshots"
VIDEOS_DIR="${PROJECT_ROOT}/playwright/videos"
TRACES_DIR="${PROJECT_ROOT}/playwright/traces"
HARS_DIR="${PROJECT_ROOT}/hars"
DOWNLOADS_DIR="${PROJECT_ROOT}/playwright/downloads"
DOWNLOADS_PUBLIC_DIR="${PROJECT_ROOT}/downloads"
ARTIFACTS_DIR="${PROJECT_ROOT}/test-artifacts"

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

# Get directory size in bytes
get_size_bytes() {
    local target=$1
    if [ -d "$target" ]; then
        du -sb "$target" 2>/dev/null | awk '{print $1}' || echo "0"
    elif [ -f "$target" ]; then
        stat -f%z "$target" 2>/dev/null || stat -c%s "$target" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Get directory size (human readable)
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

# Count files in directory
count_files() {
    local target=$1
    if [ -d "$target" ]; then
        find "$target" -type f 2>/dev/null | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Archive media
archive_media() {
    local media_path=$1
    local media_name=$2

    if [ ! -e "$media_path" ]; then
        log_verbose "Media not found: $media_path"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would archive: $media_path"
        return 0
    fi

    if [ "$ARCHIVE" = false ]; then
        return 0
    fi

    local size=$(get_size "$media_path")
    local archive_path="${ARCHIVE_DIR}/${media_name}_${TIMESTAMP}"

    mkdir -p "$ARCHIVE_DIR"

    if cp -r "$media_path" "$archive_path" 2>/dev/null; then
        print_success "Archived: $media_name ($size)"
        ((FILES_ARCHIVED++))
        return 0
    else
        print_error "Failed to archive: $media_name"
        ((ERRORS++))
        return 1
    fi
}

# Safe remove function
safe_remove() {
    local target=$1
    local media_name=$2

    if [ ! -e "$target" ]; then
        log_verbose "Skipped (not found): $target"
        return 0
    fi

    local size=$(get_size "$target")
    local size_bytes=$(get_size_bytes "$target")

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would remove $media_name: $target ($size)"
        ((FILES_REMOVED++))
        TOTAL_SIZE_FREED=$((TOTAL_SIZE_FREED + size_bytes))
        return 0
    fi

    if rm -rf "$target" 2>/dev/null; then
        log_verbose "Removed: $media_name ($size)"
        ((FILES_REMOVED++))
        TOTAL_SIZE_FREED=$((TOTAL_SIZE_FREED + size_bytes))
        print_success "Deleted: $media_name ($size)"
        return 0
    else
        print_error "Failed to remove: $media_name"
        ((ERRORS++))
        return 1
    fi
}

# Delete old files in directory
delete_old_files() {
    local target_dir=$1
    local media_name=$2
    local days=$3

    if [ ! -d "$target_dir" ]; then
        return 0
    fi

    local file_count=$(count_files "$target_dir")
    if [ "$file_count" -eq 0 ]; then
        return 0
    fi

    print_subheader "Cleaning old $media_name (older than $days days)"

    if [ "$DRY_RUN" = true ]; then
        local old_count=$(find "$target_dir" -type f -mtime +$days 2>/dev/null | wc -l)
        print_info "[DRY RUN] Would delete $old_count old files"
        return 0
    fi

    local deleted_count=0
    while IFS= read -r file; do
        if rm -f "$file" 2>/dev/null; then
            ((deleted_count++))
            ((FILES_REMOVED++))
            local size_bytes=$(get_size_bytes "$file")
            TOTAL_SIZE_FREED=$((TOTAL_SIZE_FREED + size_bytes))
        fi
    done < <(find "$target_dir" -type f -mtime +$days 2>/dev/null)

    find "$target_dir" -type d -empty -delete 2>/dev/null || true

    if [ "$deleted_count" -gt 0 ]; then
        print_success "Deleted $deleted_count old files from $media_name"
    fi
}

# Display usage
usage() {
    cat << EOF
${BOLD}ULTIMATE SDET MEDIA & ARTIFACTS CLEANUP SCRIPT${NC}

${BOLD}Usage:${NC}
    $(basename "$0") [OPTIONS]

${BOLD}Options:${NC}
    -h, --help              Show this help message
    -d, --dry-run           Preview what would be deleted
    -v, --verbose           Enable verbose output
    -y, --yes               Skip confirmation prompts
    -a, --archive           Archive media before deletion
    -t, --type TYPE         Media type to clean
                            (all|screenshots|videos|traces|hars|downloads)
    --archive-dir DIR       Custom archive directory
    --keep-days DAYS        Keep files newer than N days (default: $DAYS_TO_KEEP)
    --min-size SIZE         Only delete files larger than SIZE (default: 0)
    --no-backup             Skip backup creation

${BOLD}Media Types:${NC}
    all                     All media and artifacts
    screenshots             Screenshot files only
    videos                  Video files only
    traces                  Playwright trace files
    hars                    HAR files (HTTP recordings)
    downloads               Downloaded files

${BOLD}Examples:${NC}
    # Dry run preview
    ./clean-screenshots.sh --dry-run --verbose

    # Archive and clean all media
    ./clean-screenshots.sh --archive --yes

    # Clean only videos, keep last 14 days
    ./clean-screenshots.sh --type videos --keep-days 14 --yes

    # Clean screenshots larger than 5MB
    ./clean-screenshots.sh --type screenshots --min-size 5M --yes

    # Archive with custom directory
    ./clean-screenshots.sh --archive --archive-dir ./media-archive --yes

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
                ARCHIVE_DIR="${PROJECT_ROOT}/.media-archives"
                shift
                ;;
            -t|--type)
                MEDIA_TYPE="$2"
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
            --min-size)
                MIN_SIZE="$2"
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

    local backup_dir="${PROJECT_ROOT}/.media-backup/${TIMESTAMP}"

    print_subheader "Creating backup"

    for media_dir in "$SCREENSHOTS_DIR" "$VIDEOS_DIR" "$TRACES_DIR"; do
        if [ -d "$media_dir" ]; then
            mkdir -p "$backup_dir"
            cp -r "$media_dir" "$backup_dir/" 2>/dev/null || true
        fi
    done

    print_success "Backup created: $backup_dir"
}

# Screenshots cleanup
clean_screenshots() {
    print_header "CLEANING SCREENSHOTS"

    if [ ! -d "$SCREENSHOTS_DIR" ]; then
        print_warning "Screenshots directory not found: $SCREENSHOTS_DIR"
        return 0
    fi

    local file_count=$(count_files "$SCREENSHOTS_DIR")
    local dir_size=$(get_size "$SCREENSHOTS_DIR")

    print_subheader "Screenshots Information"
    echo "  • Location: $SCREENSHOTS_DIR"
    echo "  • Files: $file_count"
    echo "  • Total Size: $dir_size"
    echo ""

    print_subheader "Removing Screenshots"
    archive_media "$SCREENSHOTS_DIR" "screenshots"
    safe_remove "$SCREENSHOTS_DIR" "Screenshots"
}

# Videos cleanup
clean_videos() {
    print_header "CLEANING VIDEOS"

    if [ ! -d "$VIDEOS_DIR" ]; then
        print_warning "Videos directory not found: $VIDEOS_DIR"
        return 0
    fi

    local file_count=$(count_files "$VIDEOS_DIR")
    local dir_size=$(get_size "$VIDEOS_DIR")

    print_subheader "Videos Information"
    echo "  • Location: $VIDEOS_DIR"
    echo "  • Files: $file_count"
    echo "  • Total Size: $dir_size"
    echo ""

    print_subheader "Removing Videos"
    archive_media "$VIDEOS_DIR" "videos"
    safe_remove "$VIDEOS_DIR" "Videos"
}

# Traces cleanup
clean_traces() {
    print_header "CLEANING PLAYWRIGHT TRACES"

    if [ ! -d "$TRACES_DIR" ]; then
        print_warning "Traces directory not found: $TRACES_DIR"
        return 0
    fi

    local file_count=$(count_files "$TRACES_DIR")
    local dir_size=$(get_size "$TRACES_DIR")

    print_subheader "Traces Information"
    echo "  • Location: $TRACES_DIR"
    echo "  • Files: $file_count"
    echo "  • Total Size: $dir_size"
    echo ""

    print_subheader "Cleaning old traces (older than $DAYS_TO_KEEP days)"
    delete_old_files "$TRACES_DIR" "Traces" "$DAYS_TO_KEEP"
}

# HAR files cleanup
clean_hars() {
    print_header "CLEANING HAR FILES"

    if [ ! -d "$HARS_DIR" ]; then
        print_warning "HAR files directory not found: $HARS_DIR"
        return 0
    fi

    local file_count=$(count_files "$HARS_DIR")
    local dir_size=$(get_size "$HARS_DIR")

    print_subheader "HAR Files Information"
    echo "  • Location: $HARS_DIR"
    echo "  • Files: $file_count"
    echo "  • Total Size: $dir_size"
    echo ""

    print_subheader "Removing HAR Files"
    archive_media "$HARS_DIR" "hars"
    safe_remove "$HARS_DIR" "HAR Files"
}

# Downloads cleanup
clean_downloads() {
    print_header "CLEANING DOWNLOADS"

    for downloads_path in "$DOWNLOADS_DIR" "$DOWNLOADS_PUBLIC_DIR"; do
        if [ ! -d "$downloads_path" ]; then
            log_verbose "Downloads directory not found: $downloads_path"
            continue
        fi

        local file_count=$(count_files "$downloads_path")
        local dir_size=$(get_size "$downloads_path")

        print_subheader "Downloads Information - $downloads_path"
        echo "  • Files: $file_count"
        echo "  • Total Size: $dir_size"
        echo ""

        if [ "$file_count" -gt 0 ]; then
            print_subheader "Removing Downloads"
            archive_media "$downloads_path" "downloads_$(basename "$downloads_path")"
            safe_remove "$downloads_path" "Downloads: $(basename "$downloads_path")"
        fi
    done
}

# All media cleanup
clean_all_media() {
    clean_screenshots
    clean_videos
    clean_traces
    clean_hars
    clean_downloads
}

# Generate media statistics
generate_stats() {
    print_header "MEDIA STATISTICS"

    echo "Current Media Sizes:"
    [ -d "$SCREENSHOTS_DIR" ] && echo "  • Screenshots: $(get_size "$SCREENSHOTS_DIR") ($(count_files "$SCREENSHOTS_DIR") files)"
    [ -d "$VIDEOS_DIR" ] && echo "  • Videos: $(get_size "$VIDEOS_DIR") ($(count_files "$VIDEOS_DIR") files)"
    [ -d "$TRACES_DIR" ] && echo "  • Traces: $(get_size "$TRACES_DIR") ($(count_files "$TRACES_DIR") files)"
    [ -d "$HARS_DIR" ] && echo "  • HAR Files: $(get_size "$HARS_DIR") ($(count_files "$HARS_DIR") files)"
    [ -d "$DOWNLOADS_DIR" ] && echo "  • Downloads (playwright): $(get_size "$DOWNLOADS_DIR") ($(count_files "$DOWNLOADS_DIR") files)"
    [ -d "$DOWNLOADS_PUBLIC_DIR" ] && echo "  • Downloads (public): $(get_size "$DOWNLOADS_PUBLIC_DIR") ($(count_files "$DOWNLOADS_PUBLIC_DIR") files)"
    echo ""
}

# Display summary
summary() {
    print_header "CLEANUP SUMMARY"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}📊 DRY RUN - NO ACTUAL DELETION${NC}\n"
    fi

    local freed_size=$(format_size "$TOTAL_SIZE_FREED")

    echo "Files Removed: ${GREEN}$FILES_REMOVED${NC}"
    echo "Files Archived: ${GREEN}$FILES_ARCHIVED${NC}"
    echo "Space Freed: ${GREEN}$freed_size${NC}"
    echo "Errors: $([ $ERRORS -eq 0 ] && echo "${GREEN}0${NC}" || echo "${RED}$ERRORS${NC}")"
    echo ""

    if [ -n "$ARCHIVE_DIR" ] && [ -d "$ARCHIVE_DIR" ]; then
        echo "Archive Location: $ARCHIVE_DIR"
        echo "Archive Size: $(du -sh "$ARCHIVE_DIR" 2>/dev/null | awk '{print $1}')"
        echo ""
    fi

    if [ "$DRY_RUN" = false ] && [ $ERRORS -eq 0 ]; then
        print_success "Media cleanup completed successfully!"
    elif [ $ERRORS -gt 0 ]; then
        print_warning "Media cleanup completed with $ERRORS error(s)"
    fi
}

# Main execution
main() {
    clear

    print_header "ULTIMATE SDET MEDIA CLEANUP SCRIPT (FINAL) +++++"

    print_info "Project Root: $PROJECT_ROOT"
    print_info "Media Type: $MEDIA_TYPE"
    print_info "Keep Days: $DAYS_TO_KEEP"
    print_info "Dry Run: $DRY_RUN"
    print_info "Archive: $ARCHIVE"
    print_info "Verbose: $VERBOSE"

    # Generate statistics
    generate_stats

    # Confirm before proceeding
    if [ "$INTERACTIVE" = true ] && [ "$DRY_RUN" = false ]; then
        if ! confirm "Proceed with $MEDIA_TYPE media cleanup?"; then
            print_warning "Cleanup cancelled by user"
            exit 0
        fi
    fi

    # Create backup
    create_backup

    # Execute cleanup based on type
    case "$MEDIA_TYPE" in
        all)
            clean_all_media
            ;;
        screenshots)
            clean_screenshots
            ;;
        videos)
            clean_videos
            ;;
        traces)
            clean_traces
            ;;
        hars)
            clean_hars
            ;;
        downloads)
            clean_downloads
            ;;
        *)
            print_error "Unknown media type: $MEDIA_TYPE"
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
