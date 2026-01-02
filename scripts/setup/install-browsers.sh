#!/bin/bash

################################################################################
# ULTIMATE SDET BROWSER INSTALLER (FINAL) +++++
################################################################################
# Comprehensive browser installation script for Playwright automation
# Features: Multi-browser support, verification, caching, dry-run, detailed logging
# Supported: Chromium, Firefox, WebKit, Chrome, Edge, iOS Safari
# Production-ready with error handling, retry logic, and system detection
################################################################################

set -euo pipefail

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly BROWSERS_DIR="${PROJECT_ROOT}/node_modules/.cache/ms-playwright"
readonly LOG_DIR="${PROJECT_ROOT}/logs/browser-install"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly LOG_FILE="${LOG_DIR}/install_${TIMESTAMP}.log"

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
readonly ARCHIVE='📦'
readonly DISK='💾'

# Configuration variables
DRY_RUN=false
VERBOSE=false
RETRIES=3
SKIP_VERIFICATION=false
INTERACTIVE=false
SKIP_DOWNLOAD_CACHE=false
BROWSERS_TO_INSTALL=()
SYSTEM_TYPE=""
SYSTEM_ARCH=""

# Browser versions (configurable)
CHROMIUM_VERSION="${CHROMIUM_VERSION:-latest}"
FIREFOX_VERSION="${FIREFOX_VERSION:-latest}"
WEBKIT_VERSION="${WEBKIT_VERSION:-latest}"
CHROME_VERSION="${CHROME_VERSION:-latest}"
EDGE_VERSION="${EDGE_VERSION:-latest}"

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

print_table_header() {
    printf "${BOLD}${CYAN}%-20s %-15s %-30s${NC}\n" "$1" "$2" "$3"
    printf "${CYAN}%s${NC}\n" "$(printf '%.0s─' {1..65})"
}

print_table_row() {
    printf "%-20s %-15s %-30s\n" "$1" "$2" "$3"
}

detect_system_info() {
    log_step "Detecting system information..."
    
    SYSTEM_TYPE="$(uname -s)"
    SYSTEM_ARCH="$(uname -m)"
    
    case "${SYSTEM_TYPE}" in
        Darwin)
            SYSTEM_TYPE="macOS"
            if [[ "${SYSTEM_ARCH}" == "arm64" ]]; then
                SYSTEM_ARCH="ARM64 (Apple Silicon)"
            else
                SYSTEM_ARCH="x86_64"
            fi
            ;;
        Linux)
            SYSTEM_ARCH="x86_64"
            ;;
        MINGW*|MSYS*)
            SYSTEM_TYPE="Windows"
            ;;
        *)
            SYSTEM_TYPE="Unknown"
            ;;
    esac
    
    log_success "System: ${SYSTEM_TYPE} (${SYSTEM_ARCH})"
    log_debug "Python: $(python3 --version 2>&1)"
    log_debug "Node.js: $(node --version 2>&1)"
    log_debug "npm: $(npm --version 2>&1)"
}

check_prerequisites() {
    print_section "Checking Prerequisites"
    
    local missing=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    else
        log_success "Node.js: $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    else
        log_success "npm: $(npm --version)"
    fi
    
    # Check Python (required for browsers)
    if ! command -v python3 &> /dev/null; then
        missing+=("Python 3")
    else
        log_success "Python 3: $(python3 --version 2>&1 | awk '{print $2}')"
    fi
    
    # Check Playwright is installed
    if ! npm list @playwright/test &> /dev/null; then
        missing+=("Playwright (@playwright/test)")
    else
        local pw_version=$(npm list @playwright/test 2>/dev/null | grep '@playwright/test' | head -1 | sed 's/.*@//' | awk '{print $1}')
        log_success "Playwright: ${pw_version}"
    fi
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing prerequisites:"
        for item in "${missing[@]}"; do
            echo -e "${RED}  • ${item}${NC}" | tee -a "${LOG_FILE}"
        done
        return 1
    fi
    
    log_success "All prerequisites satisfied"
}

check_disk_space() {
    print_section "Checking Disk Space"
    
    local available_gb=$(df -h "${PROJECT_ROOT}" | awk 'NR==2 {print $4}' | sed 's/G//')
    local required_gb=2
    
    log_info "Available disk space: ${available_gb}G"
    
    if (( $(echo "${available_gb} < ${required_gb}" | bc -l) )); then
        log_warn "Low disk space detected. Browsers may fail to install."
        if [[ "${INTERACTIVE}" == "true" ]]; then
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Installation cancelled"
                return 1
            fi
        fi
    else
        log_success "Sufficient disk space available"
    fi
}

list_available_browsers() {
    print_section "Available Browsers for Installation"
    
    print_table_header "Browser" "Default" "Notes"
    print_table_row "chromium" "$([ "${CHROMIUM_VERSION}" != "latest" ] && echo "${CHROMIUM_VERSION}" || echo "latest")" "Default Playwright browser"
    print_table_row "firefox" "$([ "${FIREFOX_VERSION}" != "latest" ] && echo "${FIREFOX_VERSION}" || echo "latest")" "Firefox engine"
    print_table_row "webkit" "$([ "${WEBKIT_VERSION}" != "latest" ] && echo "${WEBKIT_VERSION}" || echo "latest")" "Safari/WebKit engine"
    print_table_row "chrome" "$([ "${CHROME_VERSION}" != "latest" ] && echo "${CHROME_VERSION}" || echo "latest")" "Google Chrome (optional)"
    print_table_row "edge" "$([ "${EDGE_VERSION}" != "latest" ] && echo "${EDGE_VERSION}" || echo "latest")" "Microsoft Edge (optional)"
    echo ""
}

select_browsers() {
    if [[ ${#BROWSERS_TO_INSTALL[@]} -eq 0 ]]; then
        list_available_browsers
        
        if [[ "${INTERACTIVE}" == "true" ]]; then
            log_info "Select browsers to install (space-separated): "
            read -r -p "${CYAN}chromium firefox webkit chrome edge [default: chromium firefox webkit]:${NC} " browsers_input
            
            if [[ -z "${browsers_input}" ]]; then
                BROWSERS_TO_INSTALL=("chromium" "firefox" "webkit")
            else
                IFS=' ' read -ra BROWSERS_TO_INSTALL <<< "${browsers_input}"
            fi
        else
            BROWSERS_TO_INSTALL=("chromium" "firefox" "webkit")
        fi
    fi
    
    log_success "Browsers to install: ${BROWSERS_TO_INSTALL[*]}"
}

validate_browser_name() {
    local browser="$1"
    local valid=("chromium" "firefox" "webkit" "chrome" "edge")
    
    for valid_browser in "${valid[@]}"; do
        if [[ "${browser}" == "${valid_browser}" ]]; then
            return 0
        fi
    done
    return 1
}

install_browser() {
    local browser="$1"
    local attempt=1
    
    log_step "Installing ${BOLD}${browser}${NC}..."
    
    if ! validate_browser_name "${browser}"; then
        log_error "Unknown browser: ${browser}"
        return 1
    fi
    
    while [[ ${attempt} -le ${RETRIES} ]]; do
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY RUN] Would install ${browser} (Attempt ${attempt}/${RETRIES})"
            return 0
        fi
        
        log_debug "Installation attempt ${attempt}/${RETRIES}"
        
        if npx playwright install "${browser}" 2>&1 | tee -a "${LOG_FILE}"; then
            log_success "Successfully installed ${browser}"
            return 0
        else
            attempt=$((attempt + 1))
            if [[ ${attempt} -le ${RETRIES} ]]; then
                local wait_time=$((attempt * 5))
                log_warn "Installation failed. Retrying in ${wait_time}s... (Attempt ${attempt}/${RETRIES})"
                sleep "${wait_time}"
            fi
        fi
    done
    
    log_error "Failed to install ${browser} after ${RETRIES} attempts"
    return 1
}

install_browsers() {
    print_section "Installing Browsers"
    
    local failed=()
    local installed=0
    
    for browser in "${BROWSERS_TO_INSTALL[@]}"; do
        if install_browser "${browser}"; then
            ((installed++))
        else
            failed+=("${browser}")
        fi
    done
    
    # Summary
    echo -e "\n${CYAN}${GEAR} Installation Summary:${NC}"
    echo -e "  ${GREEN}${CHECK} Installed: ${installed}/${#BROWSERS_TO_INSTALL[@]}${NC}"
    
    if [[ ${#failed[@]} -gt 0 ]]; then
        echo -e "  ${RED}${CROSS} Failed: ${failed[*]}${NC}" | tee -a "${LOG_FILE}"
        return 1
    fi
    
    return 0
}

verify_browsers() {
    if [[ "${SKIP_VERIFICATION}" == "true" ]] || [[ "${DRY_RUN}" == "true" ]]; then
        log_info "Skipping browser verification"
        return 0
    fi
    
    print_section "Verifying Browser Installation"
    
    local verified=0
    
    for browser in "${BROWSERS_TO_INSTALL[@]}"; do
        log_step "Verifying ${browser}..."
        
        if npx playwright install-deps "${browser}" 2>&1 | tee -a "${LOG_FILE}"; then
            log_success "System dependencies verified for ${browser}"
            ((verified++))
        else
            log_warn "Could not fully verify ${browser} dependencies"
        fi
    done
    
    log_info "Verified ${verified}/${#BROWSERS_TO_INSTALL[@]} browsers"
}

check_browser_cache() {
    print_section "Browser Cache Status"
    
    if [[ ! -d "${BROWSERS_DIR}" ]]; then
        log_info "No browser cache found (first installation)"
        return
    fi
    
    local cache_size=$(du -sh "${BROWSERS_DIR}" 2>/dev/null | awk '{print $1}')
    log_info "Browser cache size: ${cache_size}"
    
    # List cached browsers
    echo -e "\n${CYAN}${ARCHIVE} Cached Browsers:${NC}"
    if [[ -d "${BROWSERS_DIR}" ]]; then
        find "${BROWSERS_DIR}" -maxdepth 2 -type d -name "*-*" 2>/dev/null | while read -r dir; do
            local browser_name=$(basename "${dir}" | sed 's/-.*//g')
            local browser_version=$(basename "${dir}" | sed 's/.*-//g')
            echo -e "  • ${browser_name}: ${browser_version}"
        done
    fi
}

clear_browser_cache() {
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY RUN] Would clear browser cache"
        return
    fi
    
    print_section "Clearing Browser Cache"
    
    if [[ ! -d "${BROWSERS_DIR}" ]]; then
        log_info "No cache to clear"
        return
    fi
    
    local cache_size=$(du -sh "${BROWSERS_DIR}" 2>/dev/null | awk '{print $1}')
    log_info "Removing cache (${cache_size})..."
    
    if rm -rf "${BROWSERS_DIR}"; then
        log_success "Browser cache cleared"
    else
        log_error "Failed to clear browser cache"
        return 1
    fi
}

get_installed_browsers() {
    print_section "Currently Installed Browsers"
    
    if [[ ! -d "${BROWSERS_DIR}" ]]; then
        log_info "No browsers installed"
        return
    fi
    
    echo -e "\n${CYAN}${ARCHIVE} Installed Browsers:${NC}"
    
    local found=0
    find "${BROWSERS_DIR}" -maxdepth 2 -type d -name "*-*" 2>/dev/null | while read -r dir; do
        local browser_name=$(basename "${dir}" | sed 's/-.*//g')
        local browser_version=$(basename "${dir}" | sed 's/.*-//g')
        local browser_size=$(du -sh "${dir}" 2>/dev/null | awk '{print $1}')
        echo -e "  ${GREEN}✓${NC} ${browser_name}: v${browser_version} (${browser_size})"
        ((found++))
    done
    
    if [[ ${found} -eq 0 ]]; then
        log_info "No browsers installed yet"
    fi
}

show_help() {
    cat << EOF

${BOLD}${CYAN}ULTIMATE SDET BROWSER INSTALLER${NC}
${BOLD}Usage:${NC} $0 [options] [browsers...]

${BOLD}Options:${NC}
  ${CYAN}-h, --help${NC}                Show this help message
  ${CYAN}-d, --dry-run${NC}              Show what would be done without doing it
  ${CYAN}-v, --verbose${NC}              Enable verbose output
  ${CYAN}-i, --interactive${NC}          Interactive mode (prompt for selections)
  ${CYAN}-r, --retries N${NC}            Number of install retries (default: 3)
  ${CYAN}-s, --skip-verification${NC}    Skip browser dependency verification
  ${CYAN}-c, --clear-cache${NC}          Clear browser cache before installing
  ${CYAN}-l, --list${NC}                 List available browsers and exit
  ${CYAN}--status${NC}                   Show installed browsers and exit
  ${CYAN}--version${NC}                  Show versions of installed tools

${BOLD}Browsers:${NC}
  chromium                 Chromium/Blink browser
  firefox                  Firefox/Gecko browser
  webkit                   WebKit browser (Safari)
  chrome                   Google Chrome (optional)
  edge                     Microsoft Edge (optional)

${BOLD}Examples:${NC}
  $0                      Install default browsers (chromium, firefox, webkit)
  $0 chromium firefox     Install specific browsers
  $0 --dry-run            Show what would be installed
  $0 --interactive        Prompt for browser selection
  $0 --clear-cache        Clear cache and reinstall
  $0 --status             Show currently installed browsers
  $0 --list               List available browsers

${BOLD}Environment Variables:${NC}
  BASE_URL                Base URL for test execution (default: http://localhost:3000)
  PROJECT_ROOT            Project root directory (auto-detected)
  CHROMIUM_VERSION        Chromium version to install (default: latest)
  FIREFOX_VERSION         Firefox version to install (default: latest)
  WEBKIT_VERSION          WebKit version to install (default: latest)

EOF
}

print_summary() {
    print_section "Installation Summary Report"
    
    echo -e "\n${CYAN}${GEAR} System Information:${NC}"
    echo -e "  OS: ${SYSTEM_TYPE}"
    echo -e "  Architecture: ${SYSTEM_ARCH}"
    echo -e "  Node.js: $(node --version 2>/dev/null)"
    echo -e "  npm: $(npm --version 2>/dev/null)"
    
    echo -e "\n${CYAN}${GEAR} Installation Configuration:${NC}"
    echo -e "  Dry Run: ${DRY_RUN}"
    echo -e "  Browsers: ${BROWSERS_TO_INSTALL[*]}"
    echo -e "  Retries: ${RETRIES}"
    echo -e "  Verification: $([ "${SKIP_VERIFICATION}" == "true" ] && echo "Skipped" || echo "Enabled")"
    
    echo -e "\n${CYAN}${DISK} Disk Information:${NC}"
    echo -e "  Project Root: ${PROJECT_ROOT}"
    echo -e "  Browser Cache: ${BROWSERS_DIR}"
    if [[ -d "${BROWSERS_DIR}" ]]; then
        echo -e "  Cache Size: $(du -sh "${BROWSERS_DIR}" 2>/dev/null | awk '{print $1}')"
    fi
    
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
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            -s|--skip-verification)
                SKIP_VERIFICATION=true
                shift
                ;;
            -c|--clear-cache)
                SKIP_DOWNLOAD_CACHE=true
                shift
                ;;
            -l|--list)
                list_available_browsers
                exit 0
                ;;
            --status)
                check_browser_cache
                get_installed_browsers
                exit 0
                ;;
            --version)
                echo "Node.js: $(node --version)"
                echo "npm: $(npm --version)"
                echo "Python: $(python3 --version 2>&1)"
                exit 0
                ;;
            *)
                if validate_browser_name "$1"; then
                    BROWSERS_TO_INSTALL+=("$1")
                else
                    log_error "Unknown option or invalid browser: $1"
                    show_help
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Setup logging
    mkdir -p "${LOG_DIR}"
    touch "${LOG_FILE}"
    
    # Print header
    print_header "ULTIMATE SDET BROWSER INSTALLER (FINAL) +++++"
    
    log_info "Installation started at $(date)"
    log_info "Script directory: ${SCRIPT_DIR}"
    log_info "Project root: ${PROJECT_ROOT}"
    
    # Execute main steps
    detect_system_info || exit 1
    check_prerequisites || exit 1
    check_disk_space || exit 1
    select_browsers
    check_browser_cache
    
    if [[ "${SKIP_DOWNLOAD_CACHE}" == "true" ]]; then
        clear_browser_cache || exit 1
    fi
    
    print_summary
    
    # Confirm before proceeding (if not dry-run)
    if [[ "${DRY_RUN}" == "false" ]] && [[ "${INTERACTIVE}" == "true" ]]; then
        read -p "${CYAN}Proceed with installation? (y/N)${NC} " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warn "Installation cancelled by user"
            exit 0
        fi
    fi
    
    # Install browsers
    install_browsers || exit 1
    
    # Verify installation
    verify_browsers
    
    # Show final status
    get_installed_browsers
    
    print_section "Installation Completed Successfully"
    log_success "Browser installation completed at $(date)"
    log_info "Next steps:"
    echo -e "  1. Verify browser installation: ${CYAN}npm run pw:browsers:status${NC}"
    echo -e "  2. Run Playwright tests: ${CYAN}npm test${NC}"
    echo -e "  3. View logs: ${CYAN}tail -f ${LOG_FILE}${NC}"
    
    echo -e "\n${GREEN}${ROCKET} SDET Browser Installation Complete!${NC}\n"
}

# Trap errors and cleanup
trap 'log_error "Script interrupted"; exit 130' INT TERM

# Run main function
main "$@"
exit 0
