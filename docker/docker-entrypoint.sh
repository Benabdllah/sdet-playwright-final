#!/bin/bash
# ══════════════════════════════════════════════════════════════
# SDET+++++ Docker Entrypoint Script
# ══════════════════════════════════════════════════════════════
# Purpose: Flexible container initialization and execution
# ══════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============
# Logging Functions
# ============
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_header() {
    echo -e "${MAGENTA}$1${NC}"
}

# ============
# Environment Validation
# ============
validate_environment() {
    log_info "Validating environment..."
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        log_success "Node.js $(node --version) found"
    else
        log_error "Node.js not found!"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        log_success "npm $(npm --version) found"
    else
        log_error "npm not found!"
        exit 1
    fi
    
    # Check Playwright
    if command -v npx >/dev/null 2>&1; then
        PLAYWRIGHT_VERSION=$(npx playwright --version 2>/dev/null || echo "unknown")
        log_success "Playwright ${PLAYWRIGHT_VERSION} found"
    else
        log_warning "Playwright check skipped"
    fi
}

# ============
# Pre-execution Setup
# ============
setup_environment() {
    log_info "Setting up test environment..."
    
    # Create required directories if they don't exist
    mkdir -p test-results \
             playwright-report \
             allure-results \
             allure-report \
             screenshots \
             videos \
             traces \
             2>/dev/null || true
    
    # Set proper permissions
    chmod -R 755 . 2>/dev/null || true
    
    log_success "Environment setup complete"
}

# ============
# Display System Information
# ============
show_system_info() {
    log_header "════════════════════════════════════════════════════"
    log_header "  🧪 SDET+++++ Test Environment"
    log_header "════════════════════════════════════════════════════"
    echo "📦 Node.js:        $(node --version)"
    echo "📦 npm:            $(npm --version)"
    echo "🎭 Playwright:     $(npx playwright --version 2>/dev/null || echo 'N/A')"
    echo "🌍 Environment:    ${NODE_ENV:-production}"
    echo "🕐 Timezone:       ${TZ:-UTC}"
    echo "📁 Working Dir:    $(pwd)"
    echo "👤 User:           $(whoami)"
    log_header "════════════════════════════════════════════════════"
    echo ""
}

# ============
# Health Checks
# ============
run_health_checks() {
    log_info "Running health checks..."
    
    local failed=0
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found!"
        ((failed++))
    else
        log_success "package.json found"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_warning "node_modules not found - running npm install..."
        npm ci --prefer-offline || ((failed++))
    else
        log_success "node_modules found"
    fi
    
    # Check if Playwright config exists
    if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
        log_success "Playwright config found"
    else
        log_warning "Playwright config not found"
    fi
    
    if [ $failed -gt 0 ]; then
        log_error "Health checks failed: $failed issue(s)"
        return 1
    else
        log_success "All health checks passed"
        return 0
    fi
}

# ============
# Cleanup on Exit
# ============
cleanup() {
    local exit_code=$?
    
    echo ""
    log_header "════════════════════════════════════════════════════"
    
    if [ $exit_code -eq 0 ]; then
        log_success "Execution completed successfully"
    else
        log_error "Execution failed with exit code: $exit_code"
    fi
    
    # Optional: Archive test results
    if [ -d "test-results" ] && [ "$(ls -A test-results)" ]; then
        log_info "Test results available in: test-results/"
    fi
    
    if [ -d "allure-report" ] && [ "$(ls -A allure-report)" ]; then
        log_info "Allure report available in: allure-report/"
    fi
    
    log_header "════════════════════════════════════════════════════"
    
    exit $exit_code
}

# Register cleanup on exit
trap cleanup EXIT INT TERM

# ============
# Main Execution
# ============
main() {
    # Show system info
    show_system_info
    
    # Validate environment
    validate_environment
    
    # Setup environment
    setup_environment
    
    # Run health checks
    if ! run_health_checks; then
        log_error "Pre-flight checks failed!"
        exit 1
    fi
    
    echo ""
    log_header "════════════════════════════════════════════════════"
    log_header "  ▶️  Starting Test Execution"
    log_header "════════════════════════════════════════════════════"
    echo ""
    
    # Execute the command passed to the container
    # If no command provided, execute the CMD from Dockerfile
    if [ $# -eq 0 ]; then
        log_info "No command provided, using default CMD"
    else
        log_info "Executing: $*"
    fi
    
    # Execute command
    exec "$@"
}

# ============
# Entry Point
# ============
# If running as bash/sh, keep shell
if [ "$1" = "bash" ] || [ "$1" = "sh" ]; then
    show_system_info
    exec "$@"
else
    # Otherwise run main with all arguments
    main "$@"
fi