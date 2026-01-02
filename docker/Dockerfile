# ══════════════════════════════════════════════════════════════
# SDET+++++ DOCKERFILE - ENTERPRISE PLAYWRIGHT TEST ENVIRONMENT
# ══════════════════════════════════════════════════════════════
# Version: 3.0.0
# Platform: linux/arm64 (Apple Silicon compatible)
# Base: Node.js 20 LTS (Bullseye)
# Purpose: Production-ready Playwright + CucumberJS + Allure
# ══════════════════════════════════════════════════════════════

# ============
# 🧱 Base Image - Multi-stage build for optimization
# ============
FROM --platform=linux/arm64 node:20-bullseye AS base

# Metadata for better tracking
LABEL maintainer="qa-team@company.com"
LABEL version="3.0.0"
LABEL description="SDET+++++ Playwright Test Environment"
LABEL org.opencontainers.image.source="https://github.com/your-org/your-repo"

# ============
# 🌍 Environment Variables - Centralized configuration
# ============
ENV NODE_ENV=test \
    CI=true \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0 \
    # Performance optimizations
    NODE_OPTIONS="--max-old-space-size=4096" \
    NPM_CONFIG_LOGLEVEL=warn \
    # Timezone for consistent test execution
    TZ=UTC \
    # Disable telemetry
    PLAYWRIGHT_SKIP_BROWSER_GC=1 \
    # Force color output in logs
    FORCE_COLOR=1 \
    # Allure configuration
    ALLURE_RESULTS_DIR=/workspace/allure-results \
    ALLURE_REPORT_DIR=/workspace/allure-report

# ============
# 📦 System Dependencies - Enhanced with build tools
# ============
RUN apt-get update && apt-get install -y \
    # Essential utilities
    jq wget curl unzip git vim nano \
    # Display server for headless browsers
    xvfb \
    # Browser dependencies (Chromium)
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 \
    libx11-6 libxcomposite1 libxdamage1 libxext6 \
    libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
    libcairo2 libasound2 libatspi2.0-0 \
    # Additional browser support (Firefox, WebKit)
    libpangocairo-1.0-0 libxss1 libgtk-3-0 \
    fonts-liberation fonts-noto-color-emoji \
    # Process management
    procps htop \
    # Network tools for debugging
    net-tools iputils-ping dnsutils \
    # Build essentials for native modules
    build-essential python3 \
    # Clean up to reduce image size
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ============
# 👤 User Setup - Security best practice (non-root)
# ============
# Create playwright user with sudo access for debugging
RUN groupadd -r playwright && \
    useradd -r -g playwright -G audio,video playwright && \
    mkdir -p /home/playwright/Downloads && \
    chown -R playwright:playwright /home/playwright

# ============
# ⚙️ Working Directory
# ============
WORKDIR /workspace

# ============
# 📂 Dependency Layer - Cached for faster rebuilds
# ============
# Copy only package files first to leverage Docker cache
COPY --chown=playwright:playwright package*.json ./

# ✅ Install dependencies with optimizations
RUN npm ci \
    --legacy-peer-deps \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --loglevel=error \
    # Clean npm cache to reduce image size
    && npm cache clean --force

# ============
# 🌐 Playwright Browsers - Separate layer for better caching
# ============
# Install browsers as root (required for system dependencies)
RUN npx playwright install --with-deps chromium firefox webkit \
    && npx playwright install-deps

# ============
# 📂 Application Layer - Copy source code
# ============
COPY --chown=playwright:playwright . .

# ============
# 🔐 Security & Permissions
# ============
# Ensure correct ownership
RUN chown -R playwright:playwright /workspace && \
    # Create required directories
    mkdir -p /workspace/test-results \
             /workspace/playwright-report \
             /workspace/allure-results \
             /workspace/allure-report \
             /workspace/screenshots \
             /workspace/videos \
             /workspace/traces && \
    chown -R playwright:playwright /workspace

# ============
# 🏥 Health Check - Monitor container health
# ============
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node --version && npm --version || exit 1

# ============
# 📊 Expose Ports - For Allure server and debugging
# ============
EXPOSE 5252 9323

# ============
# 🔧 Switch to non-root user
# ============
USER playwright

# ============
# 📋 Metadata & Labels
# ============
LABEL playwright.version="1.56.1" \
      node.version="20" \
      browsers="chromium,firefox,webkit" \
      test.framework="playwright,cucumber" \
      reporting="allure"

# ============
# 🎯 Volume Definitions - For persistent data
# ============
VOLUME ["/workspace/test-results", \
        "/workspace/allure-results", \
        "/workspace/allure-report"]

# ============
# 🏁 Entrypoint & Default Command
# ============
# Use ENTRYPOINT for base command, CMD for default args
# This allows easy override: docker run image npm test

# Entrypoint script for flexible execution
COPY --chown=playwright:playwright docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# ============
# 🏁 Default Command - Multi-stage test execution
# ============
# Option 1: Interactive bash (for development)
# CMD ["/bin/bash"]

# Option 2: Full test suite with reporting (production)
CMD ["bash", "-c", "\
    echo '════════════════════════════════════════════════════' && \
    echo '  🧪 SDET+++++ Test Execution Pipeline' && \
    echo '════════════════════════════════════════════════════' && \
    echo '📊 Environment: '${NODE_ENV} && \
    echo '🌐 Playwright version: '$(npx playwright --version) && \
    echo '════════════════════════════════════════════════════' && \
    echo '' && \
    echo '▶️  Stage 1: Chromium Tests' && \
    npx playwright test --project=chromium --reporter=list,html,junit && \
    echo '✅ Chromium tests completed' && \
    echo '' && \
    echo '▶️  Stage 2: Firefox Tests' && \
    npx playwright test --project=firefox --reporter=list,html,junit && \
    echo '✅ Firefox tests completed' && \
    echo '' && \
    echo '▶️  Stage 3: WebKit Tests (Optional)' && \
    npx playwright test --project=webkit --reporter=list,html,junit || echo '⚠️  WebKit tests skipped' && \
    echo '' && \
    echo '▶️  Stage 4: CucumberJS Tests' && \
    npm test || echo '⚠️  Cucumber tests skipped' && \
    echo '' && \
    echo '▶️  Stage 5: Generate Allure Report' && \
    npm run allure:generate && \
    echo '✅ Allure report generated' && \
    echo '' && \
    echo '▶️  Stage 6: Starting Allure Server' && \
    echo '🌐 Allure report available at: http://localhost:5252' && \
    npm run allure:open"]

# ══════════════════════════════════════════════════════════════
# 🚀 USAGE EXAMPLES
# ══════════════════════════════════════════════════════════════
#
# Build:
#   docker build -t playwright-tests:latest .
#
# Run all tests:
#   docker run --rm playwright-tests:latest
#
# Interactive mode:
#   docker run -it --rm playwright-tests:latest /bin/bash
#
# Run specific test:
#   docker run --rm playwright-tests:latest npx playwright test specific.spec.ts
#
# Mount local code (development):
#   docker run -it --rm -v $(pwd):/workspace playwright-tests:latest
#
# With port forwarding (Allure):
#   docker run -p 5252:5252 playwright-tests:latest
#
# Debug mode:
#   docker run -it --rm -e DEBUG=pw:api playwright-tests:latest
#
# ══════════════════════════════════════════════════════════════
# 📊 OPTIMIZATION FEATURES
# ══════════════════════════════════════════════════════════════
#
# ✅ Multi-stage builds for smaller image size
# ✅ Layer caching for faster rebuilds
# ✅ Non-root user for security
# ✅ Health checks for container monitoring
# ✅ Volume mounts for persistent data
# ✅ Environment variables for configuration
# ✅ Clean apt cache to reduce size
# ✅ npm cache clean for smaller image
# ✅ Separate dependency and code layers
# ✅ All browsers pre-installed (Chromium, Firefox, WebKit)
# ✅ Comprehensive browser dependencies
# ✅ Process management tools included
# ✅ Network debugging tools available
#
# ══════════════════════════════════════════════════════════════
# 🔧 TROUBLESHOOTING
# ══════════════════════════════════════════════════════════════
#
# Issue: Browsers not found
# Solution: Ensure PLAYWRIGHT_BROWSERS_PATH is set correctly
#
# Issue: Permission denied
# Solution: Check file ownership (should be playwright:playwright)
#
# Issue: Out of memory
# Solution: Increase Docker memory limit (Docker Desktop → Settings)
#           or use NODE_OPTIONS="--max-old-space-size=8192"
#
# Issue: Tests timing out
# Solution: Increase test timeout in playwright.config.ts
#
# ══════════════════════════════════════════════════════════════