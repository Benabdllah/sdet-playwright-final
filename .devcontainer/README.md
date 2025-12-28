# 🚀 SDET+++++ Dev Container Configuration

## Overview

This is an **Enterprise-Grade Development Container** for Playwright test automation, optimized for professional SDET workflows.

## Features

### 🎯 Core Capabilities
- ✅ **Playwright v1.56.1** pre-installed with all browsers
- ✅ **4GB RAM, 2 CPUs** allocated for optimal performance
- ✅ **Persistent caching** for browsers and npm packages
- ✅ **Git, GitHub CLI, Docker-in-Docker** pre-configured
- ✅ **20+ VSCode extensions** for productivity
- ✅ **Custom aliases** for common commands

### 📦 Installed Tools
- Node.js (from Playwright image)
- Git + GitHub CLI
- Docker-in-Docker
- TypeScript
- curl, jq, and other utilities

### 🔧 VSCode Extensions

**Testing & Playwright:**
- Playwright Test Runner
- Jest Runner & Integration

**Code Quality:**
- ESLint
- Prettier
- Error Lens
- Import Cost

**Productivity:**
- GitLens
- GitHub Copilot (if licensed)
- Better Comments
- Todo Highlight
- Path Intellisense

**UI/UX:**
- Material Icon Theme
- Indent Rainbow

## Quick Start

### 1. Prerequisites
- Docker Desktop installed
- VSCode with Remote-Containers extension
- 8GB+ RAM available

### 2. Open in Container
```bash
# From VSCode Command Palette (Ctrl/Cmd + Shift + P)
> Dev Containers: Reopen in Container
```

### 3. Wait for Setup
The post-create script will:
- Install npm dependencies
- Download Playwright browsers
- Configure Git
- Setup shell aliases
- Create project directories

**First-time setup:** ~5-10 minutes  
**Subsequent starts:** ~30 seconds (cached)

## Custom Aliases

### Playwright Commands
```bash
pw             # npx playwright
pwt            # npx playwright test
pwui           # npx playwright test --ui
pwdebug        # npx playwright test --debug
pwreport       # npx playwright show-report
pwtrace        # npx playwright show-trace
pwcodegen      # npx playwright codegen
```

### Test Shortcuts
```bash
test:smoke       # Run smoke tests
test:regression  # Run regression tests
test:headed      # Run tests with visible browser
```

### Git Shortcuts
```bash
gs    # git status
gp    # git pull
gd    # git diff
gc    # git commit
gco   # git checkout
```

## Performance Optimizations

### 1. **Persistent Caching**
Browsers and npm packages are cached outside the container:
```
.playwright-browsers/  → Persistent browser cache
.npm-cache/           → Persistent npm cache
```

### 2. **Resource Allocation**
```json
"runArgs": [
  "--memory=4g",      // 4GB RAM
  "--cpus=2",         // 2 CPU cores
  "--shm-size=2g"     // 2GB shared memory (for Chrome)
]
```

### 3. **Volume Mounts**
Uses `consistency=cached` for better performance on macOS/Windows.

## Port Forwarding

| Port | Purpose | Auto-Forward |
|------|---------|--------------|
| 3000 | Application | Notify |
| 5000 | API Server | Notify |
| 8080 | Test Server | Silent |
| 9323 | Playwright Inspector | Open Browser |

## Advanced Usage

### Running Tests
```bash
# All tests
pwt

# Specific project
pwt --project=chromium

# With UI
pwui

# Debug mode
pwdebug

# Headed mode (visible browser)
test:headed

# With grep filter
pwt --grep @smoke
```

### Generating Tests
```bash
# Record a new test
pwcodegen https://example.com

# Record with specific browser
pwcodegen --browser=firefox https://example.com
```

### Viewing Results
```bash
# HTML report
pwreport

# Show trace
pwtrace test-results/trace.zip
```

## Troubleshooting

### Container won't start
```bash
# Rebuild container
> Dev Containers: Rebuild Container

# Or rebuild without cache
> Dev Containers: Rebuild Container Without Cache
```

### Browsers not found
```bash
# Reinstall browsers
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.playwright-browsers
npx playwright install --with-deps
```

### Git safe directory error
```bash
git config --global --add safe.directory /workspace
```

### Performance issues
```bash
# Check Docker resources
docker stats

# Increase resources in Docker Desktop settings:
# Settings → Resources → Memory: 8GB+, CPUs: 4+
```

## CI/CD Integration

This devcontainer configuration **matches your Jenkins CI environment**:

```groovy
// Jenkinsfile
agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.56.1-noble'
        args '--memory=4g --cpus=2 --shm-size=2g'
    }
}
```

**Result:** "Works on my machine" = "Works in CI" ✅

## File Structure

```
.devcontainer/
├── devcontainer.json       # Main configuration
├── post-create.sh          # Setup script
└── README.md              # This file

.vscode/
└── extensions.json        # Recommended extensions

.dockerignore             # Optimized for performance
```

## Customization

### Adding VSCode Extensions
Edit `.devcontainer/devcontainer.json`:
```json
"customizations": {
  "vscode": {
    "extensions": [
      "your-extension-id"
    ]
  }
}
```

### Adding Shell Aliases
Edit `.devcontainer/post-create.sh`:
```bash
cat >> ~/.bashrc << 'EOF'
alias myalias='my-command'
EOF
```

### Changing Resource Limits
Edit `.devcontainer/devcontainer.json`:
```json
"runArgs": [
  "--memory=8g",     // Increase RAM
  "--cpus=4"         // Increase CPUs
]
```

## Best Practices

### ✅ DO
- Commit `.devcontainer/` to Git
- Use aliases for common commands
- Keep browsers cached between rebuilds
- Use UI mode (`pwui`) for test development
- Run smoke tests before committing

### ❌ DON'T
- Commit `.playwright-browsers/` or `node_modules/`
- Run all tests in headed mode (slow)
- Install global npm packages in container
- Modify system settings directly

## Maintenance

### Update Playwright Version
1. Update in `devcontainer.json`:
   ```json
   "image": "mcr.microsoft.com/playwright:v1.XX.0-noble"
   ```
2. Update in `package.json`:
   ```json
   "@playwright/test": "^1.XX.0"
   ```
3. Rebuild container

### Clear Caches
```bash
# Clear npm cache
rm -rf .npm-cache/*

# Re-download browsers
rm -rf .playwright-browsers/*
npx playwright install --with-deps
```

## Support

**Documentation:**
- [Playwright Docs](https://playwright.dev)
- [Dev Containers Spec](https://containers.dev)

**Issues:**
- Check Docker Desktop logs
- Verify system requirements (8GB+ RAM)
- Try rebuilding without cache

---

**Level:** SDET+++++  
**Last Updated:** 2025-01-01  
**Maintained by:** QA Engineering Team