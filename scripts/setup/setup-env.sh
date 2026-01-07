#!/bin/bash

################################################################################
# ULTIMATE SDET ENVIRONMENT SETUP (FINAL) +++++
################################################################################
# Comprehensive environment configuration script for SDET automation
# Features: Multi-env support, validation, backup, dry-run, detailed logging
# Supports: Development, Testing, Staging, Production environments
# Production-ready with error handling, encryption, and system detection
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly CONFIG_DIR="${PROJECT_ROOT}/config"
readonly ENV_DIR="${PROJECT_ROOT}"
readonly BACKUP_DIR="${PROJECT_ROOT}/.env-backups"
readonly LOG_DIR="${PROJECT_ROOT}/logs/env-setup"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly LOG_FILE="${LOG_DIR}/setup_${TIMESTAMP}.log"

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
readonly LOCK='🔐'
readonly FILE='📄'
readonly VALID='✓'

# Configuration variables
DRY_RUN=false
VERBOSE=false
INTERACTIVE=false
FORCE_OVERWRITE=false
BACKUP_EXISTING=true
VALIDATE_ONLY=false
ENCRYPT_SENSITIVE=false
ENVIRONMENT="${ENVIRONMENT:-development}"
SYSTEM_TYPE=""

# Default environment values
declare -A ENV_DEFAULTS=(
    [NODE_ENV]="development"
    [LOG_LEVEL]="info"
    [DEBUG]="false"
)

# Sensitive keys that should be validated
declare -a SENSITIVE_KEYS=(
    "PASSWORD"
    "API_KEY"
    "SECRET"
    "TOKEN"
    "CREDENTIAL"
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
    echo -e "${BLUE}${INFO}[$(date +'%Y-%m-%d %H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_success() {
    local msg="$1"
    echo -e "${GREEN}${CHECK} [$(date +'%Y-%m-%d %H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_warn() {
    local msg="$1"
    echo -e "${YELLOW}${WARN}[$(date +'%Y-%m-%d %H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_error() {
    local msg="$1"
    echo -e "${RED}${CROSS} [$(date +'%Y-%m-%d %H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
}

log_debug() {
    if [[ "${VERBOSE}" == "true" ]]; then
        local msg="$1"
        echo -e "${CYAN}📝 [$(date +'%Y-%m-%d %H:%M:%S')] ${msg}${NC}" | tee -a "${LOG_FILE}"
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

create_env_file() {
    local env_file="$1"
    
    log_step "Creating environment file: ${env_file}"
    
    if [[ -f "${env_file}" ]] && [[ "${FORCE_OVERWRITE}" != "true" ]] && [[ "${DRY_RUN}" != "true" ]]; then
        if [[ "${BACKUP_EXISTING}" == "true" ]]; then
            backup_env_file "${env_file}"
        fi
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would create environment file: ${env_file}"
        return 0
    fi
    
    # Create the .env file with comprehensive configuration
    cat > "${env_file}" << 'ENVFILE'
# ============================================================================
# SDET AUTOMATION FRAMEWORK - ENVIRONMENT CONFIGURATION
# ============================================================================
# This file contains all environment variables for the SDET automation
# DO NOT commit sensitive credentials to version control
# Use .env.local for local overrides
# ============================================================================

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================
NODE_ENV=development
APP_ENV=development
LOG_LEVEL=info
DEBUG=false
VERBOSE=false

# ============================================================================
# TEST EXECUTION CONFIGURATION
# ============================================================================
BASE_URL=http://localhost:3000
LOGIN_URL=http://localhost:3000/login
API_BASE_URL=http://localhost:3001/api
WEBSOCKET_URL=ws://localhost:3002

# Test timeouts (in milliseconds)
TEST_TIMEOUT=30000
NAVIGATION_TIMEOUT=30000
ELEMENT_TIMEOUT=10000
NETWORK_TIMEOUT=30000
API_TIMEOUT=15000

# Retry configuration
MAX_RETRIES=3
RETRY_DELAY=1000
BACKOFF_MULTIPLIER=2

# ============================================================================
# BROWSER CONFIGURATION
# ============================================================================
BROWSER_TYPE=chromium
HEADLESS=true
SLOW_MO=0
SCREENSHOT_ON_FAILURE=true
RECORD_VIDEO=false
RECORD_TRACE=false
DEVICE_EMULATION=false

# Browser launch options
BROWSER_ARGS=--disable-dev-shm-usage,--disable-gpu
PROXY_SERVER=
PROXY_BYPASS=localhost

# ============================================================================
# PLAYWRIGHT CONFIGURATION
# ============================================================================
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false
PLAYWRIGHT_BROWSERS_PATH=./node_modules/.cache/ms-playwright
PLAYWRIGHT_JUNIT_OUTPUT_NAME=junit.xml
PLAYWRIGHT_HTML_REPORT=./test-results/playwright/html

# ============================================================================
# TEST REPORTING CONFIGURATION
# ============================================================================
REPORT_FORMAT=html,json,junit
ALLURE_ENABLED=true
ALLURE_REPORT_DIR=./reports/allure/allure-report
ALLURE_RESULTS_DIR=./reports/allure/allure-results
CUCUMBER_REPORT_ENABLED=true
CUCUMBER_REPORT_DIR=./test-results/cucumber
JEST_REPORT_ENABLED=true
JEST_REPORT_DIR=./test-results/jest

# Coverage configuration
COVERAGE_ENABLED=false
COVERAGE_THRESHOLD=60
COVERAGE_DIR=./test-results/coverage

# ============================================================================
# AUTHENTICATION CONFIGURATION
# ============================================================================
AUTH_ENABLED=true
AUTH_STORAGE_DIR=./playwright/auth
AUTH_STRATEGY=form
AUTH_TIMEOUT=30000
AUTH_RETRY_ATTEMPTS=3

# Default test users (use .env.local for actual credentials)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com

USER_USERNAME=user
USER_PASSWORD=user123
USER_EMAIL=user@example.com

# MFA Configuration
MFA_ENABLED=false
MFA_TIMEOUT=60000

# ============================================================================
# API TESTING CONFIGURATION
# ============================================================================
API_TESTING_ENABLED=true
API_REQUEST_TIMEOUT=15000
API_RETRY_ON_NETWORK_ERROR=true
API_RETRY_STATUS_CODES=429,500,502,503,504

# HAR file recording for API mocking
HAR_RECORDING_ENABLED=false
HAR_OUTPUT_DIR=./hars

# ============================================================================
# DATA MANAGEMENT
# ============================================================================
DATA_RESET_ENABLED=false
DATA_SEED_ENABLED=false
DATABASE_URL=
CACHE_ENABLED=true
CACHE_DIR=./cache
CACHE_TTL=3600

# ============================================================================
# NOTIFICATION CONFIGURATION
# ============================================================================
NOTIFICATIONS_ENABLED=false
NOTIFY_ON_FAILURE=false
NOTIFY_ON_SUCCESS=false

# Slack Configuration
SLACK_ENABLED=false
SLACK_WEBHOOK_URL=
SLACK_CHANNEL=
SLACK_MENTION_ON_FAILURE=false

# Teams Configuration
TEAMS_ENABLED=false
TEAMS_WEBHOOK_URL=
TEAMS_MENTION_ON_FAILURE=false

# Discord Configuration
DISCORD_ENABLED=false
DISCORD_WEBHOOK_URL=

# Email Configuration
EMAIL_ENABLED=false
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
EMAIL_TO=

# ============================================================================
# LOGGING & DEBUGGING
# ============================================================================
LOG_LEVEL=info
LOG_FILE=./logs/sdet.log
LOG_FORMAT=json
LOG_MAX_SIZE=10M
LOG_MAX_FILES=5
CONSOLE_LOG=true
FILE_LOG=true

# Debug options
DEBUG_NETWORK=false
DEBUG_STORAGE=false
DEBUG_COOKIES=false
DEBUG_SELECTORS=false

# ============================================================================
# PERFORMANCE & OPTIMIZATION
# ============================================================================
PERFORMANCE_MONITORING=false
PERFORMANCE_METRICS_FILE=./metrics/performance.json
MEMORY_MONITORING=false
CPU_MONITORING=false

# Caching
BROWSER_CONTEXT_CACHE=true
ELEMENT_CACHE=true

# ============================================================================
# SECURITY & ENCRYPTION
# ============================================================================
ENCRYPTION_ENABLED=false
ENCRYPTION_KEY=
HASH_SENSITIVE_DATA=false
SANITIZE_LOGS=true
MASK_CREDENTIALS_IN_LOGS=true

# ============================================================================
# CI/CD INTEGRATION
# ============================================================================
CI_ENABLED=false
CI_PROVIDER=
CI_BUILD_ID=
CI_BUILD_URL=
CI_COMMIT_SHA=
CI_BRANCH=

# GitHub Actions
GITHUB_ACTIONS=false
GITHUB_RUN_ID=
GITHUB_RUN_NUMBER=

# ============================================================================
# FEATURE FLAGS
# ============================================================================
FEATURE_API_TESTING=true
FEATURE_VISUAL_TESTING=false
FEATURE_ACCESSIBILITY_TESTING=false
FEATURE_PERFORMANCE_TESTING=false
FEATURE_SECURITY_TESTING=false

# ============================================================================
# THIRD-PARTY INTEGRATIONS
# ============================================================================
SENTRY_ENABLED=false
SENTRY_DSN=

# ============================================================================
# ADVANCED CONFIGURATION
# ============================================================================
# Custom configurations can be added here
CUSTOM_CONFIG_ENABLED=false
CUSTOM_CONFIG_PATH=

ENVFILE

    log_success "Environment file created: ${env_file}"
}

backup_env_file() {
    local env_file="$1"
    
    if [[ ! -f "${env_file}" ]]; then
        return
    fi
    
    log_step "Backing up existing environment file"
    
    mkdir -p "${BACKUP_DIR}"
    local backup_file="${BACKUP_DIR}/$(basename "${env_file}").${TIMESTAMP}.bak"
    
    if cp "${env_file}" "${backup_file}"; then
        log_success "Environment file backed up: ${backup_file}"
    else
        log_error "Failed to backup environment file"
        return 1
    fi
}

validate_env_file() {
    local env_file="$1"
    
    log_step "Validating environment file: ${env_file}"
    
    if [[ ! -f "${env_file}" ]]; then
        log_error "Environment file not found: ${env_file}"
        return 1
    fi
    
    local errors=0
    local warnings=0
    
    # Check for required variables
    local required_vars=(
        "NODE_ENV"
        "BASE_URL"
        "BROWSER_TYPE"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "${env_file}"; then
            log_warn "Missing recommended variable: ${var}"
            ((warnings++))
        fi
    done
    
    # Check for empty sensitive variables
    while IFS= read -r line; do
        if [[ -z "${line}" ]] || [[ "${line}" =~ ^# ]]; then
            continue
        fi
        
        local key="${line%%=*}"
        local value="${line#*=}"
        
        for sensitive in "${SENSITIVE_KEYS[@]}"; do
            if [[ "${key}" =~ ${sensitive} ]]; then
                if [[ -z "${value}" ]] || [[ "${value}" == "changeme" ]]; then
                    log_warn "Sensitive variable not configured: ${key}"
                    ((warnings++))
                fi
            fi
        done
    done < "${env_file}"
    
    if [[ ${errors} -gt 0 ]]; then
        log_error "Validation failed with ${errors} error(s)"
        return 1
    fi
    
    if [[ ${warnings} -gt 0 ]]; then
        log_warn "Validation completed with ${warnings} warning(s)"
    else
        log_success "Environment file validated successfully"
    fi
    
    return 0
}

setup_local_overrides() {
    local env_local="${ENV_DIR}/.env.local"
    
    log_step "Setting up local environment overrides"
    
    if [[ -f "${env_local}" ]]; then
        log_info "Local environment file already exists: ${env_local}"
        return
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would create local overrides file"
        return
    fi
    
    cat > "${env_local}" << 'ENVLOCAL'
# ============================================================================
# LOCAL ENVIRONMENT OVERRIDES
# ============================================================================
# This file is for local development overrides
# Do NOT commit this file to version control
# ============================================================================

# Override any variables from .env here
# Example:
# BASE_URL=http://localhost:3000
# DEBUG=true
# LOG_LEVEL=debug

ENVLOCAL

    log_success "Local environment overrides file created: ${env_local}"
}

setup_test_env() {
    local env_test="${ENV_DIR}/.env.test"
    
    log_step "Setting up test environment configuration"
    
    if [[ -f "${env_test}" ]]; then
        log_info "Test environment file already exists: ${env_test}"
        return
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would create test environment file"
        return
    fi
    
    cat > "${env_test}" << 'ENVTEST'
# ============================================================================
# TEST ENVIRONMENT CONFIGURATION
# ============================================================================
NODE_ENV=test
APP_ENV=test
LOG_LEVEL=warn
DEBUG=false

# Test-specific URLs
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001/api

# Test timeouts (lower for test environment)
TEST_TIMEOUT=30000
NETWORK_TIMEOUT=30000

# Reduce media capture for faster tests
SCREENSHOT_ON_FAILURE=true
RECORD_VIDEO=false
RECORD_TRACE=false

# Test data
DATA_RESET_ENABLED=true
DATA_SEED_ENABLED=true

# Notifications off in test
NOTIFICATIONS_ENABLED=false
SLACK_ENABLED=false
TEAMS_ENABLED=false

ENVTEST

    log_success "Test environment file created: ${env_test}"
}

setup_staging_env() {
    local env_staging="${ENV_DIR}/.env.staging"
    
    log_step "Setting up staging environment configuration"
    
    if [[ -f "${env_staging}" ]]; then
        log_info "Staging environment file already exists: ${env_staging}"
        return
    fi
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would create staging environment file"
        return
    fi
    
    cat > "${env_staging}" << 'ENVSTAGING'
# ============================================================================
# STAGING ENVIRONMENT CONFIGURATION
# ============================================================================
NODE_ENV=staging
APP_ENV=staging
LOG_LEVEL=info
DEBUG=false

# Staging URLs
BASE_URL=https://staging.example.com
API_BASE_URL=https://api.staging.example.com

# Staging settings
HEADLESS=true
SCREENSHOT_ON_FAILURE=true
RECORD_VIDEO=false
RECORD_TRACE=true

# Notifications
NOTIFICATIONS_ENABLED=true
SLACK_ENABLED=false
TEAMS_ENABLED=false

# Data management
DATA_RESET_ENABLED=false
DATA_SEED_ENABLED=false

ENVSTAGING

    log_success "Staging environment file created: ${env_staging}"
}

create_env_template() {
    local env_template="${CONFIG_DIR}/.env.example"
    
    log_step "Creating environment template file"
    
    mkdir -p "${CONFIG_DIR}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would create environment template"
        return
    fi
    
    cat > "${env_template}" << 'ENVTEMPLATE'
# ============================================================================
# SDET ENVIRONMENT TEMPLATE
# ============================================================================
# Copy this file to .env and update values for your environment
# ============================================================================

NODE_ENV=development
BASE_URL=http://localhost:3000
LOG_LEVEL=info
DEBUG=false

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
USER_USERNAME=user
USER_PASSWORD=changeme

# Browser
BROWSER_TYPE=chromium
HEADLESS=true

# Reporting
ALLURE_ENABLED=true
CUCUMBER_REPORT_ENABLED=true

ENVTEMPLATE

    log_success "Environment template created: ${env_template}"
}

source_env_file() {
    local env_file="$1"
    
    if [[ ! -f "${env_file}" ]]; then
        return
    fi
    
    log_debug "Sourcing environment file: ${env_file}"
    
    set -a
    # shellcheck source=/dev/null
    source "${env_file}"
    set +a
}

verify_setup() {
    print_section "Verifying Environment Setup"
    
    local env_files=(
        "${ENV_DIR}/.env"
        "${ENV_DIR}/.env.test"
        "${ENV_DIR}/.env.staging"
    )
    
    local found=0
    for env_file in "${env_files[@]}"; do
        if [[ -f "${env_file}" ]]; then
            log_success "✓ Environment file: $(basename "${env_file}")"
            ((found++))
        fi
    done
    
    log_info "Configured environment files: ${found}/${#env_files[@]}"
}

show_help() {
    cat << EOF

${BOLD}${CYAN}ULTIMATE SDET ENVIRONMENT SETUP${NC}
${BOLD}Usage:${NC} $0 [options]

${BOLD}Options:${NC}
  ${CYAN}-h, --help${NC}                Show this help message
  ${CYAN}-e, --env ENV${NC}              Target environment (development, test, staging, production)
  ${CYAN}-d, --dry-run${NC}              Show what would be done without doing it
  ${CYAN}-v, --verbose${NC}              Enable verbose output
  ${CYAN}-i, --interactive${NC}          Interactive mode (prompt for selections)
  ${CYAN}-f, --force${NC}                Force overwrite existing files
  ${CYAN}--no-backup${NC}                Don't backup existing environment files
  ${CYAN}--validate-only${NC}            Only validate environment files
  ${CYAN}--encrypt${NC}                  Enable encryption for sensitive values
  ${CYAN}--init${NC}                     Initialize new environment setup

${BOLD}Environments:${NC}
  development                Development environment (default)
  test                       Test/CI environment
  staging                    Staging environment
  production                 Production environment

${BOLD}Examples:${NC}
  $0                        Setup development environment
  $0 --env test             Setup test environment
  $0 --dry-run              Preview changes
  $0 --interactive          Interactive setup wizard
  $0 --validate-only        Validate configuration only
  $0 --init                 Initialize all environments

${BOLD}Environment Variables:${NC}
  ENVIRONMENT               Target environment (default: development)
  BASE_URL                  Application base URL
  API_BASE_URL              API endpoint base URL
  LOG_LEVEL                 Log level (debug, info, warn, error)

EOF
}

print_summary() {
    print_section "Setup Summary Report"
    
    echo -e "\n${CYAN}${GEAR} Configuration:${NC}"
    echo -e "  Environment: ${ENVIRONMENT}"
    echo -e "  Project Root: ${PROJECT_ROOT}"
    echo -e "  Configuration Dir: ${CONFIG_DIR}"
    echo -e "  Dry Run: ${DRY_RUN}"
    
    echo -e "\n${CYAN}${FILE} Files:${NC}"
    [[ -f "${ENV_DIR}/.env" ]] && echo -e "  ✓ ${ENV_DIR}/.env" || echo -e "  ✗ ${ENV_DIR}/.env"
    [[ -f "${ENV_DIR}/.env.local" ]] && echo -e "  ✓ ${ENV_DIR}/.env.local" || echo -e "  ✗ ${ENV_DIR}/.env.local"
    [[ -f "${ENV_DIR}/.env.test" ]] && echo -e "  ✓ ${ENV_DIR}/.env.test" || echo -e "  ✗ ${ENV_DIR}/.env.test"
    [[ -f "${ENV_DIR}/.env.staging" ]] && echo -e "  ✓ ${ENV_DIR}/.env.staging" || echo -e "  ✗ ${ENV_DIR}/.env.staging"
    
    echo -e "\n${CYAN}${LOAD} Logs:${NC}"
    echo -e "  Log File: ${LOG_FILE}"
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
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
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
            -f|--force)
                FORCE_OVERWRITE=true
                shift
                ;;
            --no-backup)
                BACKUP_EXISTING=false
                shift
                ;;
            --validate-only)
                VALIDATE_ONLY=true
                shift
                ;;
            --encrypt)
                ENCRYPT_SENSITIVE=true
                shift
                ;;
            --init)
                # Initialize all environments
                ENVIRONMENT="all"
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
    mkdir -p "${LOG_DIR}"
    touch "${LOG_FILE}"
    
    # Print header
    print_header "ULTIMATE SDET ENVIRONMENT SETUP (FINAL) +++++"
    
    log_info "Setup started at $(date)"
    detect_system
    log_info "System: ${SYSTEM_TYPE}"
    log_info "Environment: ${ENVIRONMENT}"
    
    # Create main environment file
    create_env_file "${ENV_DIR}/.env"
    
    if [[ "${ENVIRONMENT}" == "all" ]]; then
        setup_local_overrides
        setup_test_env
        setup_staging_env
    else
        case "${ENVIRONMENT}" in
            test)
                setup_test_env
                ;;
            staging)
                setup_staging_env
                ;;
            development|*)
                setup_local_overrides
                ;;
        esac
    fi
    
    # Create template
    create_env_template
    
    # Validate setup
    validate_env_file "${ENV_DIR}/.env" || true
    
    # Verify setup
    verify_setup
    
    print_summary
    
    log_success "Environment setup completed at $(date)"
    
    echo -e "\n${GREEN}${ROCKET} SDET Environment Setup Complete!${NC}"
    echo -e "\n${CYAN}Next steps:${NC}"
    echo -e "  1. Review and update: ${ENV_DIR}/.env"
    echo -e "  2. Set local overrides: ${ENV_DIR}/.env.local"
    echo -e "  3. Validate configuration: npm run env:validate"
    echo -e "  4. Install dependencies: npm install"
    echo -e "\n"
}

# Trap errors and cleanup
trap 'log_error "Script interrupted"; exit 130' INT TERM

# Run main function
main "$@"
exit 0
