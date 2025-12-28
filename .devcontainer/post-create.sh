#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════"
echo "  SDET+++++ Dev Container Post-Create Script"
echo "════════════════════════════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Install Node Dependencies
log_info "Installing Node.js dependencies..."
npm ci --prefer-offline --no-audit --no-fund
log_success "Dependencies installed"

# 2. Install Playwright Browsers
log_info "Installing Playwright browsers..."
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright-browsers
npx playwright install --with-deps
log_success "Playwright browsers installed"

# 3. Setup Git Configuration
log_info "Configuring Git..."
git config --global --add safe.directory /workspace
git config --global init.defaultBranch main
git config --global pull.rebase false
log_success "Git configured"

# 4. Create useful aliases
log_info "Setting up shell aliases..."
cat >> ~/.bashrc << 'EOF'

# SDET+++++ Aliases
alias pw='npx playwright'
alias pwt='npx playwright test'
alias pwui='npx playwright test --ui'
alias pwdebug='npx playwright test --debug'
alias pwreport='npx playwright show-report'
alias pwtrace='npx playwright show-trace'
alias pwcodegen='npx playwright codegen'
alias lint='npm run lint'
alias test:smoke='npx playwright test --grep @smoke'
alias test:regression='npx playwright test --grep @regression'
alias test:headed='npx playwright test --headed'

# Useful shortcuts
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias gp='git pull'
alias gd='git diff'
alias gc='git commit'
alias gco='git checkout'

# Colorful prompt
export PS1='\[\033[01;32m\]playwright-dev\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

EOF
log_success "Shell aliases configured"

# 5. Create useful directories
log_info "Creating project directories..."
mkdir -p test-results
mkdir -p playwright-report
mkdir -p screenshots
mkdir -p videos
mkdir -p traces
log_success "Directories created"

# 6. Setup pre-commit hooks (optional)
if [ -f ".git/hooks" ]; then
    log_info "Setting up Git hooks..."
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint || exit 1
echo "✓ Pre-commit checks passed"
EOF
    chmod +x .git/hooks/pre-commit
    log_success "Git hooks configured"
fi

# 7. Verify installation
log_info "Verifying Playwright installation..."
npx playwright --version
log_success "Playwright verification complete"

# 8. Show useful information
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}  ✓ Dev Container Setup Complete!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📚 Quick Commands:"
echo "  pw --version         → Show Playwright version"
echo "  pwt                  → Run all tests"
echo "  pwui                 → Run tests in UI mode"
echo "  pwdebug              → Run tests in debug mode"
echo "  pwreport             → Show HTML report"
echo "  pwcodegen <url>      → Generate test code"
echo ""
echo "🎯 Test Shortcuts:"
echo "  test:smoke           → Run smoke tests"
echo "  test:regression      → Run regression tests"
echo "  test:headed          → Run tests with browser visible"
echo ""
echo "🔧 Useful Info:"
echo "  Node version:        $(node --version)"
echo "  NPM version:         $(npm --version)"
echo "  Playwright version:  $(npx playwright --version)"
echo ""
echo "🚀 Happy Testing!"
echo "════════════════════════════════════════════════════════════"
echo ""

# Create welcome message for new terminals
cat > ~/.welcome.sh << 'EOF'
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Welcome to SDET+++++ Dev Container 🎭              ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Type 'pw --help' for Playwright commands                  ║"
echo "║ Type 'pwui' to start test UI                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
EOF

# Add welcome to bashrc
echo "source ~/.welcome.sh" >> ~/.bashrc

log_success "Post-create script completed successfully!"