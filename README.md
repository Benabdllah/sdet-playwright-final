# ════════════════════════════════════════════════════════════
# SDET+++++ .dockerignore - Optimized for Performance
# ════════════════════════════════════════════════════════════

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock
pnpm-lock.yaml

# Playwright
.playwright-browsers/
playwright-report/
test-results/
playwright/.cache/
blob-report/
traces/
screenshots/
videos/

# Build outputs
dist/
build/
out/
coverage/

# IDE & Editors
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Git
.git/
.gitignore
.gitattributes

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml
azure-pipelines.yml
Jenkinsfile
.circleci/

# Documentation
*.md
docs/
LICENSE
CHANGELOG.md

# Logs
*.log
logs/

# Cache
.npm-cache/
.cache/
.turbo/
.eslintcache
.stylelintcache

# Environment
.env
.env.*
!.env.example

# Testing
*.test.ts.snap
__snapshots__/

# Temporary files
*.tmp
*.temp
tmp/
temp/

# OS Files
Thumbs.db
.DS_Store

# Docker
Dockerfile
docker-compose*.yml
.dockerignore

# Misc
*.pid
*.seed
*.pid.lock