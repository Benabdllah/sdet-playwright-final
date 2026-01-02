#!/bin/bash

################################################################################
# ============================================================================
# ULTIMATE SDET ALLURE REPORT GENERATOR (FINAL) +++++
# ============================================================================
# Comprehensive Allure Report generation and management utility
# Features: Generate, archive, backup, serve, clean, analyze reports
# Production-ready with extensive options, dry-run, metrics, and CI/CD support
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

# Directories
ALLURE_RESULTS_DIR="${PROJECT_ROOT}/allure-results"
ALLURE_REPORT_DIR="${PROJECT_ROOT}/allure-report"
ALLURE_CONFIG="${PROJECT_ROOT}/config/allure/allure.config.js"

# Default values
DRY_RUN=false
VERBOSE=false
INTERACTIVE=true
OPEN_REPORT=false
ARCHIVE=false
BACKUP=true
CLEAN_RESULTS=false
SERVE_REPORT=false
PORT=5252
CUSTOM_TITLE="SDET Test Report"
THEME="default"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Counters
ERRORS=0
WARNINGS=0

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

# Check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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

# Count test results
count_test_results() {
    local result_count=0
    if [ -d "$ALLURE_RESULTS_DIR" ]; then
        result_count=$(find "$ALLURE_RESULTS_DIR" -name "*.json" -type f 2>/dev/null | wc -l)
    fi
    echo "$result_count"
}

# Display usage
usage() {
    cat << EOF
${BOLD}ULTIMATE SDET ALLURE REPORT GENERATOR${NC}

${BOLD}Usage:${NC}
    $(basename "$0") [OPTIONS]

${BOLD}Options:${NC}
    -h, --help              Show this help message
    -d, --dry-run           Preview report generation without creating
    -v, --verbose           Enable verbose output
    -y, --yes               Skip confirmation prompts
    -o, --open              Open report in browser after generation
    -s, --serve             Serve report on local server (no cleanup)
    -p, --port PORT         Port for serving report (default: 5252)
    -a, --archive           Archive previous report
    -c, --clean             Clean results after report generation
    --backup                Create backup before generation (default)
    --no-backup             Skip backup creation
    -t, --title TITLE       Custom report title
    --theme THEME           Report theme (default|dark|light)

${BOLD}Examples:${NC}
    # Generate basic report
    ./generate-allure-report.sh

    # Generate and open in browser
    ./generate-allure-report.sh --open

    # Dry run with verbose output
    ./generate-allure-report.sh --dry-run --verbose

    # Generate, archive, and serve
    ./generate-allure-report.sh --archive --serve --port 3000

    # Generate with custom title and archive old report
    ./generate-allure-report.sh --title "CI/CD Pipeline Tests" --archive

    # Non-interactive with cleanup
    ./generate-allure-report.sh --yes --clean --open

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
            -o|--open)
                OPEN_REPORT=true
                shift
                ;;
            -s|--serve)
                SERVE_REPORT=true
                OPEN_REPORT=true
                shift
                ;;
            -p|--port)
                PORT="$2"
                shift 2
                ;;
            -a|--archive)
                ARCHIVE=true
                shift
                ;;
            -c|--clean)
                CLEAN_RESULTS=true
                shift
                ;;
            --backup)
                BACKUP=true
                shift
                ;;
            --no-backup)
                BACKUP=false
                shift
                ;;
            -t|--title)
                CUSTOM_TITLE="$2"
                shift 2
                ;;
            --theme)
                THEME="$2"
                shift 2
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

# Check prerequisites
check_prerequisites() {
    print_subheader "Checking Prerequisites"

    # Check Java
    if ! command_exists java; then
        print_error "Java is not installed. Install Java 8+ for Allure"
        ((ERRORS++))
        return 1
    fi
    local java_version=$(java -version 2>&1 | head -1)
    print_success "Java available: $java_version"

    # Check Allure
    if ! command_exists allure; then
        print_warning "Allure CLI not found in PATH"
        print_info "Install with: npm install -g allure-commandline"
        ((WARNINGS++))
    else
        local allure_version=$(allure --version 2>/dev/null || echo "unknown")
        print_success "Allure CLI available: $allure_version"
    fi

    # Check Node.js
    if ! command_exists node; then
        print_warning "Node.js not found"
        ((WARNINGS++))
    else
        local node_version=$(node -v)
        print_success "Node.js available: $node_version"
    fi

    return 0
}

# Create backup
create_backup() {
    if [ "$BACKUP" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    if [ ! -d "$ALLURE_REPORT_DIR" ]; then
        log_verbose "No previous report to backup"
        return 0
    fi

    print_subheader "Creating Backup"

    local backup_dir="${PROJECT_ROOT}/.allure-backup/${TIMESTAMP}"

    if mkdir -p "$backup_dir" && cp -r "$ALLURE_REPORT_DIR" "$backup_dir/"; then
        print_success "Report backed up: $backup_dir"
        return 0
    else
        print_error "Failed to create backup"
        ((ERRORS++))
        return 1
    fi
}

# Archive previous report
archive_report() {
    if [ "$ARCHIVE" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    if [ ! -d "$ALLURE_REPORT_DIR" ]; then
        log_verbose "No previous report to archive"
        return 0
    fi

    print_subheader "Archiving Previous Report"

    local archive_dir="${PROJECT_ROOT}/.allure-archives"
    local archive_name="allure-report_$(date -r "$ALLURE_REPORT_DIR" +%Y%m%d_%H%M%S).tar.gz"

    if mkdir -p "$archive_dir"; then
        if tar -czf "${archive_dir}/${archive_name}" -C "${ALLURE_REPORT_DIR}/.." "$(basename "$ALLURE_REPORT_DIR")" 2>/dev/null; then
            print_success "Report archived: ${archive_dir}/${archive_name}"
            return 0
        else
            print_error "Failed to archive report"
            ((ERRORS++))
            return 1
        fi
    fi

    return 1
}

# Validate test results
validate_results() {
    print_subheader "Validating Test Results"

    if [ ! -d "$ALLURE_RESULTS_DIR" ]; then
        print_error "Allure results directory not found: $ALLURE_RESULTS_DIR"
        ((ERRORS++))
        return 1
    fi

    local result_count=$(count_test_results)

    if [ "$result_count" -eq 0 ]; then
        print_warning "No test results found in $ALLURE_RESULTS_DIR"
        ((WARNINGS++))
        return 1
    fi

    print_success "Found $result_count test result files"
    return 0
}

# Generate Allure report
generate_report() {
    print_header "GENERATING ALLURE REPORT"

    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY RUN] Would generate report to: $ALLURE_REPORT_DIR"
        return 0
    fi

    print_subheader "Report Generation"

    # Check if allure command exists
    if ! command_exists allure; then
        # Try npx
        if command_exists npx; then
            print_info "Using npx allure-commandline"
            if npx allure-commandline@latest generate "$ALLURE_RESULTS_DIR" -o "$ALLURE_REPORT_DIR" --clean; then
                print_success "Report generated successfully"
                return 0
            fi
        else
            print_error "Allure CLI not available"
            ((ERRORS++))
            return 1
        fi
    else
        if allure generate "$ALLURE_RESULTS_DIR" -o "$ALLURE_REPORT_DIR" --clean; then
            print_success "Report generated successfully"
            return 0
        else
            print_error "Report generation failed"
            ((ERRORS++))
            return 1
        fi
    fi

    return 1
}

# Generate report statistics
generate_statistics() {
    print_subheader "Report Statistics"

    if [ ! -d "$ALLURE_REPORT_DIR" ]; then
        return 0
    fi

    local report_size=$(get_size "$ALLURE_REPORT_DIR")
    local result_files=$(count_test_results)
    local report_index="${ALLURE_REPORT_DIR}/index.html"

    echo "  • Report Location: $ALLURE_REPORT_DIR"
    echo "  • Report Size: $report_size"
    echo "  • Test Results: $result_files files"

    if [ -f "$report_index" ]; then
        echo "  • Entry Point: $report_index"
    fi

    echo ""
}

# Open report in browser
open_report() {
    if [ "$OPEN_REPORT" = false ]; then
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would open report in browser"
        return 0
    fi

    print_subheader "Opening Report"

    local report_index="${ALLURE_REPORT_DIR}/index.html"

    if [ ! -f "$report_index" ]; then
        print_error "Report index not found: $report_index"
        return 1
    fi

    # Try to open in browser based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if open "$report_index" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    elif command_exists xdg-open; then
        # Linux
        if xdg-open "$report_index" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    elif command_exists start; then
        # Windows
        if start "$report_index" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    fi

    print_warning "Could not open report automatically"
    print_info "Open manually: $report_index"
    return 0
}

# Serve report locally
serve_report() {
    if [ "$SERVE_REPORT" = false ]; then
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY RUN] Would serve report on port $PORT"
        return 0
    fi

    print_subheader "Serving Report"

    if [ ! -d "$ALLURE_REPORT_DIR" ]; then
        print_error "Report directory not found"
        return 1
    fi

    print_info "Starting local server on port $PORT..."
    print_info "Report URL: http://localhost:$PORT"
    print_info "Press Ctrl+C to stop server"
    echo ""

    # Try different server options
    if command_exists python3; then
        cd "$ALLURE_REPORT_DIR"
        python3 -m http.server "$PORT" --bind 127.0.0.1
    elif command_exists python; then
        cd "$ALLURE_REPORT_DIR"
        python -m SimpleHTTPServer "$PORT"
    elif command_exists npx; then
        cd "$ALLURE_REPORT_DIR"
        npx http-server -p "$PORT"
    else
        print_error "No HTTP server available (Python or Node.js required)"
        return 1
    fi

    return 0
}

# Clean results after generation
clean_results() {
    if [ "$CLEAN_RESULTS" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    print_subheader "Cleaning Results"

    if [ -d "$ALLURE_RESULTS_DIR" ]; then
        if rm -rf "$ALLURE_RESULTS_DIR"; then
            print_success "Allure results cleaned"
            return 0
        else
            print_error "Failed to clean results"
            ((ERRORS++))
            return 1
        fi
    fi

    return 0
}

# Display summary
summary() {
    print_header "GENERATION SUMMARY"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}📊 DRY RUN - NO ACTUAL GENERATION${NC}\n"
    fi

    echo "Options:"
    echo "  • Archive: $ARCHIVE"
    echo "  • Backup: $BACKUP"
    echo "  • Open Report: $OPEN_REPORT"
    echo "  • Serve: $SERVE_REPORT"
    if [ "$SERVE_REPORT" = true ]; then
        echo "  • Port: $PORT"
    fi
    echo "  • Clean Results: $CLEAN_RESULTS"
    echo ""

    if [ "$OPEN_REPORT" = true ] && [ -f "${ALLURE_REPORT_DIR}/index.html" ]; then
        print_success "Report: ${ALLURE_REPORT_DIR}/index.html"
    fi

    if [ $WARNINGS -gt 0 ]; then
        echo -e "  ${YELLOW}• Warnings: $WARNINGS${NC}"
    fi

    if [ $ERRORS -gt 0 ]; then
        echo -e "  ${RED}• Errors: $ERRORS${NC}"
        return 1
    else
        print_success "Report generation completed successfully!"
        return 0
    fi
}

# Main execution
main() {
    clear

    print_header "ULTIMATE SDET ALLURE REPORT GENERATOR (FINAL) +++++"

    print_info "Project Root: $PROJECT_ROOT"
    print_info "Dry Run: $DRY_RUN"
    print_info "Verbose: $VERBOSE"

    # Check prerequisites
    if ! check_prerequisites; then
        print_error "Prerequisites check failed"
        exit 1
    fi

    # Validate results exist
    if ! validate_results; then
        if [ "$INTERACTIVE" = true ] && [ "$DRY_RUN" = false ]; then
            if ! confirm "No test results found. Continue anyway?"; then
                print_warning "Generation cancelled"
                exit 0
            fi
        fi
    fi

    # Create backup
    create_backup

    # Archive previous report
    archive_report

    # Generate report
    if ! generate_report; then
        print_error "Report generation failed"
        exit 1
    fi

    # Generate statistics
    generate_statistics

    # Clean results
    clean_results

    # Open report
    open_report

    # Serve report (blocking call)
    serve_report

    # Display summary
    summary
}

################################################################################
# SCRIPT EXECUTION
################################################################################

# Parse arguments
parse_args "$@"

# Execute main function
main
