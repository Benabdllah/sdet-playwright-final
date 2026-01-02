#!/bin/bash

################################################################################
# ============================================================================
# ULTIMATE SDET CUCUMBER REPORT GENERATOR (FINAL) +++++
# ============================================================================
# Comprehensive Cucumber Report generation and management utility
# Features: Generate, archive, backup, serve, analyze BDD test reports
# Supports: HTML, JSON, JUnit, Message reports with full CI/CD integration
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
CUCUMBER_RESULTS_DIR="${PROJECT_ROOT}/playwright-report/cucumber"
CUCUMBER_REPORT_DIR="${PROJECT_ROOT}/test-results/cucumber"
CUCUMBER_HTML_DIR="${PROJECT_ROOT}/test-results/cucumber/html"
CUCUMBER_JSON_DIR="${PROJECT_ROOT}/test-results/cucumber/json"
CUCUMBER_JUNIT_DIR="${PROJECT_ROOT}/test-results/cucumber/junit"
CUCUMBER_CONFIG="${PROJECT_ROOT}/config/cucumber"

# Default values
DRY_RUN=false
VERBOSE=false
INTERACTIVE=true
OPEN_REPORT=false
ARCHIVE=false
BACKUP=true
SERVE_REPORT=false
PORT=5253
FORMAT="html"
CUSTOM_TITLE="BDD Test Report"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
GENERATE_ALL=false
ANALYZE_RESULTS=true

# Report formats
SUPPORTED_FORMATS="html json junit message xml"

# Counters
ERRORS=0
WARNINGS=0
TOTAL_SCENARIOS=0
PASSED_SCENARIOS=0
FAILED_SCENARIOS=0
SKIPPED_SCENARIOS=0

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

# Count JSON files
count_json_files() {
    local dir=$1
    if [ -d "$dir" ]; then
        find "$dir" -name "*.json" -type f 2>/dev/null | wc -l || echo "0"
    else
        echo "0"
    fi
}

# Extract test statistics from JSON
analyze_test_results() {
    print_subheader "Analyzing Test Results"

    local json_file="${CUCUMBER_JSON_DIR}/report.json"

    if [ ! -f "$json_file" ]; then
        log_verbose "JSON report not found: $json_file"
        return 0
    fi

    # Try to parse JSON with jq if available
    if command_exists jq; then
        TOTAL_SCENARIOS=$(jq '[.[].elements | length] | add' "$json_file" 2>/dev/null || echo "0")
        PASSED_SCENARIOS=$(jq '[.[].elements[] | select(.steps | all(.result.status=="passed")) | 1] | length' "$json_file" 2>/dev/null || echo "0")
        FAILED_SCENARIOS=$(jq '[.[].elements[] | select(.steps | any(.result.status=="failed")) | 1] | length' "$json_file" 2>/dev/null || echo "0")
        SKIPPED_SCENARIOS=$(jq '[.[].elements[] | select(.steps | any(.result.status=="skipped" or .result.status=="pending")) | 1] | length' "$json_file" 2>/dev/null || echo "0")
    else
        log_verbose "jq not available, skipping detailed analysis"
        TOTAL_SCENARIOS=$(grep -o '"steps"' "$json_file" 2>/dev/null | wc -l || echo "0")
    fi

    if [ "$TOTAL_SCENARIOS" -gt 0 ]; then
        echo "  • Total Scenarios: $TOTAL_SCENARIOS"
        echo "  • Passed: $PASSED_SCENARIOS"
        echo "  • Failed: $FAILED_SCENARIOS"
        echo "  • Skipped: $SKIPPED_SCENARIOS"
        echo ""
    fi
}

# Display usage
usage() {
    cat << EOF
${BOLD}ULTIMATE SDET CUCUMBER REPORT GENERATOR${NC}

${BOLD}Usage:${NC}
    $(basename "$0") [OPTIONS]

${BOLD}Options:${NC}
    -h, --help              Show this help message
    -d, --dry-run           Preview report generation without creating
    -v, --verbose           Enable verbose output
    -y, --yes               Skip confirmation prompts
    -o, --open              Open report in browser after generation
    -s, --serve             Serve report on local server
    -p, --port PORT         Port for serving report (default: 5253)
    -f, --format FORMAT     Report format (html|json|junit|message|xml|all)
                            Default: html
    -a, --archive           Archive previous reports
    -c, --clean             Clean reports after generation
    --backup                Create backup before generation (default)
    --no-backup             Skip backup creation
    -t, --title TITLE       Custom report title
    --no-analyze            Skip test result analysis

${BOLD}Supported Formats:${NC}
    html                    HTML pretty report
    json                    JSON detailed report
    junit                   JUnit XML format
    message                 Cucumber message format
    xml                     XML format
    all                     Generate all formats

${BOLD}Examples:${NC}
    # Generate basic HTML report
    ./generate-cucumber-report.sh

    # Generate and open in browser
    ./generate-cucumber-report.sh --open

    # Dry run with verbose output
    ./generate-cucumber-report.sh --dry-run --verbose

    # Generate all formats with analysis
    ./generate-cucumber-report.sh --format all --open --archive

    # Generate JSON report and serve on port 8080
    ./generate-cucumber-report.sh --format json --serve --port 8080

    # Generate with custom title, archive, and cleanup
    ./generate-cucumber-report.sh --title "Sprint 42 BDD Tests" --archive --clean

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
            -f|--format)
                FORMAT="$2"
                if [ "$FORMAT" = "all" ]; then
                    GENERATE_ALL=true
                    FORMAT="html"
                fi
                shift 2
                ;;
            -a|--archive)
                ARCHIVE=true
                shift
                ;;
            -c|--clean)
                # Clean option for future use
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
            --no-analyze)
                ANALYZE_RESULTS=false
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

# Check prerequisites
check_prerequisites() {
    print_subheader "Checking Prerequisites"

    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed"
        ((ERRORS++))
        return 1
    fi
    local node_version=$(node -v)
    print_success "Node.js available: $node_version"

    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        ((ERRORS++))
        return 1
    fi
    local npm_version=$(npm -v)
    print_success "npm available: $npm_version"

    # Check Cucumber CLI
    if ! command_exists cucumber; then
        if ! command_exists npx; then
            print_warning "Cucumber and npx not found"
            ((WARNINGS++))
        else
            print_success "Will use npx for Cucumber"
        fi
    else
        local cucumber_version=$(cucumber --version 2>/dev/null || echo "unknown")
        print_success "Cucumber CLI available: $cucumber_version"
    fi

    # Check jq (optional but useful)
    if ! command_exists jq; then
        print_warning "jq not installed - detailed analysis will be limited"
        ((WARNINGS++))
    else
        print_success "jq available for detailed analysis"
    fi

    return 0
}

# Validate cucumber results exist
validate_results() {
    print_subheader "Validating Cucumber Results"

    local result_files=$(count_json_files "$CUCUMBER_JSON_DIR")

    if [ ! -d "$CUCUMBER_RESULTS_DIR" ] && [ ! -d "$CUCUMBER_JSON_DIR" ]; then
        print_warning "Cucumber results directory not found"
        ((WARNINGS++))
        return 1
    fi

    if [ "$result_files" -eq 0 ]; then
        print_warning "No Cucumber JSON results found"
        ((WARNINGS++))
        return 1
    fi

    print_success "Found $result_files result files"
    return 0
}

# Create backup
create_backup() {
    if [ "$BACKUP" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    if [ ! -d "$CUCUMBER_REPORT_DIR" ]; then
        log_verbose "No previous report to backup"
        return 0
    fi

    print_subheader "Creating Backup"

    local backup_dir="${PROJECT_ROOT}/.cucumber-backup/${TIMESTAMP}"

    if mkdir -p "$backup_dir" && cp -r "$CUCUMBER_REPORT_DIR" "$backup_dir/"; then
        print_success "Report backed up: $backup_dir"
        return 0
    else
        print_error "Failed to create backup"
        ((ERRORS++))
        return 1
    fi
}

# Archive previous reports
archive_reports() {
    if [ "$ARCHIVE" = false ] || [ "$DRY_RUN" = true ]; then
        return 0
    fi

    if [ ! -d "$CUCUMBER_REPORT_DIR" ]; then
        log_verbose "No previous report to archive"
        return 0
    fi

    print_subheader "Archiving Previous Reports"

    local archive_dir="${PROJECT_ROOT}/.cucumber-archives"
    local archive_name="cucumber-report_${TIMESTAMP}.tar.gz"

    if mkdir -p "$archive_dir"; then
        if tar -czf "${archive_dir}/${archive_name}" -C "${CUCUMBER_REPORT_DIR}/.." "$(basename "$CUCUMBER_REPORT_DIR")" 2>/dev/null; then
            print_success "Reports archived: ${archive_dir}/${archive_name}"
            return 0
        else
            print_error "Failed to archive reports"
            ((ERRORS++))
            return 1
        fi
    fi

    return 1
}

# Generate Cucumber report
generate_report() {
    print_header "GENERATING CUCUMBER REPORT"

    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY RUN] Would generate $FORMAT report"
        return 0
    fi

    print_subheader "Report Generation - Format: $FORMAT"

    # Ensure output directories exist
    mkdir -p "$CUCUMBER_HTML_DIR" "$CUCUMBER_JSON_DIR" "$CUCUMBER_JUNIT_DIR"

    case "$FORMAT" in
        html)
            if command_exists npx; then
                if npx cucumber-html-reporter -p "${PROJECT_ROOT}" -f "${CUCUMBER_JSON_DIR}/report.json" -o "${CUCUMBER_HTML_DIR}/report.html"; then
                    print_success "HTML report generated"
                    return 0
                fi
            else
                print_warning "HTML report generation requires npx"
                ((WARNINGS++))
            fi
            ;;
        json)
            print_success "JSON report available at: ${CUCUMBER_JSON_DIR}/report.json"
            return 0
            ;;
        junit)
            print_success "JUnit report available at: ${CUCUMBER_JUNIT_DIR}/results.xml"
            return 0
            ;;
        *)
            print_warning "Format '$FORMAT' report generation not yet implemented"
            ((WARNINGS++))
            return 0
            ;;
    esac

    return 0
}

# Generate all report formats
generate_all_formats() {
    if [ "$GENERATE_ALL" = false ]; then
        return 0
    fi

    print_subheader "Generating All Report Formats"

    for fmt in $SUPPORTED_FORMATS; do
        if [ "$fmt" = "html" ]; then
            print_info "Generating HTML report..."
            FORMAT="html"
            generate_report
        elif [ "$fmt" = "json" ]; then
            print_info "JSON format already available"
        elif [ "$fmt" = "junit" ]; then
            print_info "JUnit format available"
        fi
    done
}

# Generate report statistics
generate_statistics() {
    print_subheader "Report Statistics"

    local html_report="${CUCUMBER_HTML_DIR}/report.html"
    local json_report="${CUCUMBER_JSON_DIR}/report.json"
    local report_size=$(get_size "$CUCUMBER_REPORT_DIR")

    echo "  • Report Location: $CUCUMBER_REPORT_DIR"
    echo "  • Report Size: $report_size"
    echo "  • Format: $FORMAT"

    if [ -f "$html_report" ]; then
        echo "  • HTML Report: $html_report"
    fi

    if [ -f "$json_report" ]; then
        echo "  • JSON Report: $json_report"
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

    local report_file="${CUCUMBER_HTML_DIR}/report.html"

    if [ ! -f "$report_file" ]; then
        print_warning "HTML report not found: $report_file"
        print_info "Generate with: ./generate-cucumber-report.sh --format html"
        return 1
    fi

    # Open in browser based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if open "$report_file" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    elif command_exists xdg-open; then
        if xdg-open "$report_file" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    elif command_exists start; then
        if start "$report_file" 2>/dev/null; then
            print_success "Report opened in default browser"
            return 0
        fi
    fi

    print_warning "Could not open report automatically"
    print_info "Open manually: $report_file"
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

    if [ ! -d "$CUCUMBER_REPORT_DIR" ]; then
        print_error "Report directory not found"
        return 1
    fi

    print_info "Starting local server on port $PORT..."
    print_info "Report URL: http://localhost:$PORT"
    print_info "Press Ctrl+C to stop server"
    echo ""

    # Try different server options
    if command_exists python3; then
        cd "$CUCUMBER_REPORT_DIR"
        python3 -m http.server "$PORT" --bind 127.0.0.1
    elif command_exists python; then
        cd "$CUCUMBER_REPORT_DIR"
        python -m SimpleHTTPServer "$PORT"
    elif command_exists npx; then
        cd "$CUCUMBER_REPORT_DIR"
        npx http-server -p "$PORT"
    else
        print_error "No HTTP server available"
        return 1
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
    echo "  • Format: $FORMAT"
    echo "  • Archive: $ARCHIVE"
    echo "  • Backup: $BACKUP"
    echo "  • Open Report: $OPEN_REPORT"
    echo "  • Serve: $SERVE_REPORT"
    if [ "$SERVE_REPORT" = true ]; then
        echo "  • Port: $PORT"
    fi
    echo ""

    if [ "$ANALYZE_RESULTS" = true ] && [ "$TOTAL_SCENARIOS" -gt 0 ]; then
        echo "Test Results:"
        echo "  • Total: $TOTAL_SCENARIOS"
        echo "  • Passed: $PASSED_SCENARIOS"
        echo "  • Failed: $FAILED_SCENARIOS"
        echo "  • Skipped: $SKIPPED_SCENARIOS"
        echo ""
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

    print_header "ULTIMATE SDET CUCUMBER REPORT GENERATOR (FINAL) +++++"

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
            if ! confirm "No Cucumber results found. Continue anyway?"; then
                print_warning "Generation cancelled"
                exit 0
            fi
        fi
    fi

    # Create backup
    create_backup

    # Archive previous reports
    archive_reports

    # Generate report
    generate_report

    # Generate all formats if requested
    if [ "$GENERATE_ALL" = true ]; then
        generate_all_formats
    fi

    # Analyze results
    if [ "$ANALYZE_RESULTS" = true ]; then
        analyze_test_results
    fi

    # Generate statistics
    generate_statistics

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
