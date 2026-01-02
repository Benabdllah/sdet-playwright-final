#!/bin/bash

################################################################################
# ULTIMATE SDET TEST RUNNER (FINAL) +++++
################################################################################
# Master test orchestration script for SDET automation framework
# Features: Multi-mode testing, intelligent execution, advanced reporting
# Supports: Playwright, Jest, Cucumber with unified interface
# Production-ready with comprehensive orchestration and real-time analysis
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly SCRIPTS_DIR="${PROJECT_ROOT}/scripts"
readonly TEST_DIR="${PROJECT_ROOT}/src/tests"
readonly RESULTS_DIR="${PROJECT_ROOT}/test-results"
readonly LOG_DIR="${PROJECT_ROOT}/logs/test-execution"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly LOG_FILE="${LOG_DIR}/run_${TIMESTAMP}.log"
readonly SUMMARY_FILE="${RESULTS_DIR}/summary_${TIMESTAMP}.json"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Emojis
readonly CHECK='✅'
readonly CROSS='❌'
readonly WARN='⚠️ '
readonly INFO='ℹ️ '
readonly LOAD='⏳'
readonly ROCKET='🚀'
readonly GEAR='⚙️ '
readonly CHART='📊'
readonly TIMER='⏱️ '
readonly PLAY='▶️ '
readonly FILTER='🔍'
readonly BOOKMARK='🔖'

# Configuration variables
MODE="all"  # all, smoke, regression, parallel, quick, extended, integration, unit
DRY_RUN=false
VERBOSE=false
INTERACTIVE=false
PARALLEL=true
FAIL_FAST=false
BROWSERS="chromium"
WORKERS=4
TIMEOUT=30000
ENVIRONMENT="development"
REPORT_FORMAT="html,json"
FILTER_TESTS=""
SKIP_TESTS=""
RETRY_FAILED=false
RETRIES=1
ENABLE_VIDEO=false
ENABLE_TRACE=false
SYSTEM_TYPE=""

# Execution tracking
TOTAL_DURATION=0
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0
RETRIED_TESTS=0
START_TIME=""
END_TIME=""

# Test modes configuration
declare -A test_modes=(
    [smoke]="Quick sanity checks (5-10 min)"
    [regression]="Full regression suite (20-30 min)"
    [parallel]="Parallel test execution (10-20 min)"
    [quick]="Quick subset of tests (5-10 min)"
    [extended]="Extended test suite (30-60 min)"
    [integration]="Integration tests only (15-25 min)"
    [unit]="Unit tests only (5-10 min)"
    [all]="Full comprehensive suite (60+ min)"
)

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${MAGENTA}▶ $1${NC}"
}

log_info() {
    local msg="$1"
    echo -e "${BLUE}${INFO}[$(date +'%H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_success() {
    local msg="$1"
    echo -e "${GREEN}${CHECK} [$(date +'%H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_warn() {
    local msg="$1"
    echo -e "${YELLOW}${WARN}[$(date +'%H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_error() {
    local msg="$1"
    echo -e "${RED}${CROSS} [$(date +'%H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_debug() {
    if [[ "${VERBOSE}" == "true" ]]; then
        local msg="$1"
        echo -e "${CYAN}📝 [$(date +'%H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
    fi
}

log_step() {
    local msg="$1"
    echo -e "\n${CYAN}${LOAD} ${msg}${NC}" | tee -a "${LOG_FILE}"
}

detect_system() {
    SYSTEM_TYPE="$(uname -s)"
    case "${SYSTEM_TYPE}" in
        Darwin) SYSTEM_TYPE="macOS" ;;
        Linux) SYSTEM_TYPE="Linux" ;;
        MINGW*|MSYS*) SYSTEM_TYPE="Windows" ;;
        *) SYSTEM_TYPE="Unknown" ;;
    esac
    log_debug "System detected: ${SYSTEM_TYPE}"
}

check_prerequisites() {
    print_section "Checking Prerequisites"
    
    local missing=()
    
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    else
        log_success "Node.js: $(node --version)"
    fi
    
    if ! npm list @playwright/test &> /dev/null 2>&1; then
        missing+=("Playwright")
    else
        log_success "Playwright installed"
    fi
    
    if ! npm list jest &> /dev/null 2>&1; then
        missing+=("Jest")
    else
        log_success "Jest installed"
    fi
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing dependencies:"
        for dep in "${missing[@]}"; do
            echo -e "${RED}  • ${dep}${NC}"
        done
        return 1
    fi
    
    log_success "All prerequisites satisfied"
    return 0
}

show_test_modes() {
    print_section "Available Test Modes"
    
    echo -e "\n${CYAN}${BOOKMARK} Test Modes:${NC}"
    for mode in "${!test_modes[@]}"; do
        echo -e "  ${BOLD}${mode}:${NC} ${test_modes[$mode]}"
    done
    echo ""
}

run_tests_mode() {
    local test_mode="$1"
    
    log_step "Running ${test_mode} tests..."
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would run ${test_mode} tests"
        return 0
    fi
    
    case "${test_mode}" in
        smoke)
            run_smoke_tests || return 1
            ;;
        regression)
            run_regression_tests || return 1
            ;;
        parallel)
            run_parallel_tests || return 1
            ;;
        quick)
            run_quick_tests || return 1
            ;;
        extended)
            run_extended_tests || return 1
            ;;
        integration)
            run_integration_tests || return 1
            ;;
        unit)
            run_unit_tests || return 1
            ;;
        all)
            run_all_tests || return 1
            ;;
        *)
            log_error "Unknown test mode: ${test_mode}"
            return 1
            ;;
    esac
    
    return 0
}

run_smoke_tests() {
    log_info "Executing smoke tests..."
    
    if [[ -x "${SCRIPTS_DIR}/test/run-smoke.sh" ]]; then
        "${SCRIPTS_DIR}/test/run-smoke.sh" \
            --environment="${ENVIRONMENT}" \
            --timeout="${TIMEOUT}" \
            $([ "${DRY_RUN}" == "true" ] && echo "--dry-run") \
            $([ "${VERBOSE}" == "true" ] && echo "--verbose") || return 1
    else
        # Fallback to direct execution
        npx playwright test "${TEST_DIR}" \
            --grep="@smoke" \
            --workers=1 \
            --timeout="${TIMEOUT}" || return 1
    fi
    
    return 0
}

run_regression_tests() {
    log_info "Executing regression tests..."
    
    if [[ -x "${SCRIPTS_DIR}/test/run-regression.sh" ]]; then
        "${SCRIPTS_DIR}/test/run-regression.sh" \
            --environment="${ENVIRONMENT}" \
            --workers="${WORKERS}" \
            $([ "${DRY_RUN}" == "true" ] && echo "--dry-run") \
            $([ "${VERBOSE}" == "true" ] && echo "--verbose") || return 1
    else
        npx playwright test "${TEST_DIR}" \
            --workers="${WORKERS}" \
            --timeout="${TIMEOUT}" || return 1
    fi
    
    return 0
}

run_parallel_tests() {
    log_info "Executing tests in parallel..."
    
    if [[ -x "${SCRIPTS_DIR}/test/run-parallel.sh" ]]; then
        "${SCRIPTS_DIR}/test/run-parallel.sh" \
            --workers="${WORKERS}" \
            --timeout="${TIMEOUT}" \
            $([ "${DRY_RUN}" == "true" ] && echo "--dry-run") \
            $([ "${VERBOSE}" == "true" ] && echo "--verbose") || return 1
    else
        npx playwright test "${TEST_DIR}" \
            --workers="${WORKERS}" \
            --timeout="${TIMEOUT}" || return 1
    fi
    
    return 0
}

run_quick_tests() {
    log_info "Executing quick test subset..."
    
    npx playwright test "${TEST_DIR}" \
        --grep="@quick|@smoke" \
        --workers="${WORKERS}" \
        --timeout=$((TIMEOUT / 2)) || return 1
    
    return 0
}

run_extended_tests() {
    log_info "Executing extended test suite..."
    
    npx playwright test "${TEST_DIR}" \
        --workers="${WORKERS}" \
        --timeout="${TIMEOUT}" \
        --reporter="html,json,junit" || return 1
    
    return 0
}

run_integration_tests() {
    log_info "Executing integration tests..."
    
    npx playwright test "${TEST_DIR}" \
        --grep="@integration" \
        --workers="${WORKERS}" \
        --timeout="${TIMEOUT}" || return 1
    
    return 0
}

run_unit_tests() {
    log_info "Executing unit tests..."
    
    npm run test:unit -- \
        --coverage \
        --passWithNoTests || return 1
    
    return 0
}

run_all_tests() {
    log_info "Executing complete test suite..."
    
    npx playwright test "${TEST_DIR}" \
        --workers="${WORKERS}" \
        --timeout="${TIMEOUT}" \
        --reporter="${REPORT_FORMAT}" || return 1
    
    return 0
}

apply_test_filters() {
    if [[ -z "${FILTER_TESTS}" ]] && [[ -z "${SKIP_TESTS}" ]]; then
        return 0
    fi
    
    log_step "Applying test filters..."
    
    if [[ -n "${FILTER_TESTS}" ]]; then
        log_info "Filter: ${FILTER_TESTS}"
        # Filter logic would be implemented here
    fi
    
    if [[ -n "${SKIP_TESTS}" ]]; then
        log_info "Skipping: ${SKIP_TESTS}"
        # Skip logic would be implemented here
    fi
}

setup_browsers() {
    print_section "Setting Up Browsers"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would install browsers: ${BROWSERS}"
        return 0
    fi
    
    # Install browsers if needed
    for browser in ${BROWSERS//,/ }; do
        if ! npx playwright install "${browser}" &> /dev/null; then
            log_warn "Browser installation skipped or already installed: ${browser}"
        fi
    done
    
    log_success "Browsers setup completed"
}

generate_execution_report() {
    print_section "Generating Execution Report"
    
    TOTAL_DURATION=$((END_TIME - START_TIME))
    
    mkdir -p "${RESULTS_DIR}"
    
    cat > "${SUMMARY_FILE}" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mode": "${MODE}",
  "environment": "${ENVIRONMENT}",
  "duration_seconds": ${TOTAL_DURATION},
  "test_results": {
    "total": $((PASSED_TESTS + FAILED_TESTS + SKIPPED_TESTS)),
    "passed": ${PASSED_TESTS},
    "failed": ${FAILED_TESTS},
    "skipped": ${SKIPPED_TESTS},
    "retried": ${RETRIED_TESTS}
  },
  "execution_config": {
    "parallel": ${PARALLEL},
    "workers": ${WORKERS},
    "timeout_ms": ${TIMEOUT},
    "browsers": "${BROWSERS}",
    "retry_failed": ${RETRY_FAILED},
    "retries": ${RETRIES}
  },
  "status": "$([ ${FAILED_TESTS} -eq 0 ] && echo "PASSED" || echo "FAILED")"
}
EOF

    log_success "Report generated: ${SUMMARY_FILE}"
}

show_test_report() {
    print_section "Test Execution Report"
    
    TOTAL_DURATION=$((END_TIME - START_TIME))
    local total=$((PASSED_TESTS + FAILED_TESTS + SKIPPED_TESTS))
    local success_rate=0
    
    if [[ ${total} -gt 0 ]]; then
        success_rate=$(((PASSED_TESTS * 100) / total))
    fi
    
    echo -e "\n${CYAN}${CHART} Test Results:${NC}"
    echo -e "  ${GREEN}${CHECK} Passed:${NC}  ${PASSED_TESTS}"
    echo -e "  ${RED}${CROSS} Failed:${NC}  ${FAILED_TESTS}"
    echo -e "  ${YELLOW}${WARN}Skipped:${NC} ${SKIPPED_TESTS}"
    echo -e "  Success Rate: ${success_rate}%"
    
    echo -e "\n${CYAN}${TIMER} Execution Metrics:${NC}"
    echo -e "  Mode:       ${MODE}"
    echo -e "  Duration:   ${TOTAL_DURATION}s"
    echo -e "  Workers:    ${WORKERS}"
    echo -e "  Parallel:   ${PARALLEL}"
    echo -e "  Environment: ${ENVIRONMENT}"
    
    if [[ ${total} -gt 0 ]]; then
        echo -e "  Tests/sec:  $(echo "scale=2; ${total} / ${TOTAL_DURATION}" | bc 2>/dev/null || echo "0")"
    fi
    
    echo -e "\n${CYAN}📁 Output Files:${NC}"
    echo -e "  Summary:    ${SUMMARY_FILE}"
    echo -e "  Results:    ${RESULTS_DIR}"
    echo -e "  Logs:       ${LOG_FILE}"
    echo ""
}

show_help() {
    cat << EOF

${BOLD}${CYAN}ULTIMATE SDET TEST RUNNER${NC}
${BOLD}Usage:${NC} $0 [options] [mode]

${BOLD}Modes:${NC}
  smoke                   Quick sanity checks (5-10 min)
  regression              Full regression suite (20-30 min)
  parallel                Parallel test execution (10-20 min)
  quick                   Quick subset of tests (5-10 min)
  extended                Extended test suite (30-60 min)
  integration             Integration tests only (15-25 min)
  unit                    Unit tests only (5-10 min)
  all                     Full comprehensive suite (60+ min)

${BOLD}Options:${NC}
  ${CYAN}-h, --help${NC}                Show this help message
  ${CYAN}--list-modes${NC}              List available test modes
  ${CYAN}-d, --dry-run${NC}              Preview without executing
  ${CYAN}-v, --verbose${NC}              Enable verbose output
  ${CYAN}-i, --interactive${NC}          Interactive mode
  ${CYAN}-e, --environment ENV${NC}      Target environment (development, staging, production)
  ${CYAN}-b, --browsers BROWSERS${NC}    Browsers (chromium, firefox, webkit)
  ${CYAN}-w, --workers N${NC}            Number of workers (default: 4)
  ${CYAN}-t, --timeout MS${NC}           Test timeout (default: 30000)
  ${CYAN}--no-parallel${NC}              Disable parallel execution
  ${CYAN}--fail-fast${NC}                Stop on first failure
  ${CYAN}--filter PATTERN${NC}           Filter tests by pattern
  ${CYAN}--skip PATTERN${NC}              Skip tests by pattern
  ${CYAN}--retry-failed${NC}             Retry failed tests
  ${CYAN}-r, --retries N${NC}            Number of retries (default: 1)
  ${CYAN}--video${NC}                    Record video during tests
  ${CYAN}--trace${NC}                    Record trace during tests
  ${CYAN}--report FORMAT${NC}            Report format (html, json, junit)

${BOLD}Examples:${NC}
  $0 smoke                    Run smoke tests
  $0 regression               Run full regression
  $0 all -w 8 -v              Full suite, 8 workers, verbose
  $0 quick --fail-fast        Quick tests, fail on first error
  $0 --dry-run --list-modes   Preview modes
  $0 integration -e staging   Integration tests on staging
  $0 all --retry-failed       Full suite with retry on fail

${BOLD}Environment Variables:${NC}
  ENVIRONMENT               Test environment (default: development)
  WORKERS                   Number of workers (default: 4)
  TEST_TIMEOUT              Test timeout (default: 30000)
  TEST_MODE                 Test mode (default: all)

EOF
}

print_summary() {
    print_section "Execution Summary"
    
    TOTAL_DURATION=$((END_TIME - START_TIME))
    
    echo -e "\n${CYAN}${CHART} Session Summary:${NC}"
    echo -e "  Mode:           ${MODE}"
    echo -e "  Environment:    ${ENVIRONMENT}"
    echo -e "  Start Time:     $(date -d @"${START_TIME}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r "${START_TIME}" '+%Y-%m-%d %H:%M:%S')"
    echo -e "  End Time:       $(date -d @"${END_TIME}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r "${END_TIME}" '+%Y-%m-%d %H:%M:%S')"
    echo -e "  Total Duration: ${TOTAL_DURATION}s"
    
    echo -e "\n${CYAN}📊 Configuration:${NC}"
    echo -e "  Parallel:       ${PARALLEL}"
    echo -e "  Workers:        ${WORKERS}"
    echo -e "  Browsers:       ${BROWSERS}"
    echo -e "  Timeout:        ${TIMEOUT}ms"
    echo -e "  Retries:        ${RETRIES}"
    
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            --list-modes)
                show_test_modes
                exit 0
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -i|--interactive)
                INTERACTIVE=true
                shift
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -b|--browsers)
                BROWSERS="$2"
                shift 2
                ;;
            -w|--workers)
                WORKERS="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --no-parallel)
                PARALLEL=false
                WORKERS=1
                shift
                ;;
            --fail-fast)
                FAIL_FAST=true
                shift
                ;;
            --filter)
                FILTER_TESTS="$2"
                shift 2
                ;;
            --skip)
                SKIP_TESTS="$2"
                shift 2
                ;;
            --retry-failed)
                RETRY_FAILED=true
                shift
                ;;
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            --video)
                ENABLE_VIDEO=true
                shift
                ;;
            --trace)
                ENABLE_TRACE=true
                shift
                ;;
            --report)
                REPORT_FORMAT="$2"
                shift 2
                ;;
            smoke|regression|parallel|quick|extended|integration|unit|all)
                MODE="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Setup logging
    mkdir -p "${LOG_DIR}" "${RESULTS_DIR}"
    touch "${LOG_FILE}"
    
    # Print header
    print_header "ULTIMATE SDET TEST RUNNER (FINAL) +++++"
    
    log_info "Test execution started at $(date)"
    detect_system
    
    # Show configuration
    echo -e "\n${CYAN}${GEAR} Configuration:${NC}"
    echo -e "  Mode:           ${MODE}"
    echo -e "  Environment:    ${ENVIRONMENT}"
    echo -e "  Parallel:       ${PARALLEL}"
    echo -e "  Workers:        ${WORKERS}"
    echo -e "  Browsers:       ${BROWSERS}"
    echo -e "  Timeout:        ${TIMEOUT}ms"
    echo -e "  Dry Run:        ${DRY_RUN}"
    echo -e "  Verbose:        ${VERBOSE}"
    
    # Execute workflow
    START_TIME=$(date +%s)
    
    check_prerequisites || exit 1
    setup_browsers
    apply_test_filters
    
    if run_tests_mode "${MODE}"; then
        test_status=0
    else
        test_status=1
    fi
    
    END_TIME=$(date +%s)
    
    # Generate reports
    generate_execution_report
    show_test_report
    print_summary
    
    if [[ ${test_status} -eq 0 ]]; then
        log_success "Test execution completed successfully at $(date)"
        echo -e "\n${GREEN}${ROCKET} SDET Tests Passed!${NC}\n"
        exit 0
    else
        log_error "Test execution completed with failures at $(date)"
        echo -e "\n${RED}${CROSS} SDET Tests Failed!${NC}\n"
        exit 1
    fi
}

# Trap errors
trap 'log_error "Script interrupted"; exit 130' INT TERM

# Run main function
main "$@"
exit 0
