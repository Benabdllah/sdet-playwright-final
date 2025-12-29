# ══════════════════════════════════════════════════════════════
# SDET+++++ Makefile
# ══════════════════════════════════════════════════════════════
# Purpose: Simplified Docker commands for test automation
# Usage: make <target>
# ══════════════════════════════════════════════════════════════

.PHONY: help build test up down logs clean shell

# ============
# Variables
# ============
IMAGE_NAME := playwright-tests-SDET+++++
TAG := latest
CONTAINER_NAME := playwright-SDET+++++
COMPOSE_FILE := docker-compose.yml

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============
# Default Target
# ============
.DEFAULT_GOAL := help

# ============
# Help
# ============
help: ## Show this help message
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  SDET+++++ Docker Commands$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"

# ============
# Build Commands
# ============
build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t $(IMAGE_NAME):$(TAG) .

build-no-cache: ## Build Docker image without cache
	@echo "$(GREEN)Building Docker image (no cache)...$(NC)"
	docker build --no-cache -t $(IMAGE_NAME):$(TAG) .

compose-build: ## Build using docker-compose
	@echo "$(GREEN)Building with docker-compose...$(NC)"
	docker-compose build

# ============
# Test Commands
# ============
test: ## Run all tests
	@echo "$(GREEN)Running all tests...$(NC)"
	docker-compose run --rm playwright-tests

test-chromium: ## Run Chromium tests only
	@echo "$(GREEN)Running Chromium tests...$(NC)"
	docker-compose run --rm playwright-tests \
		npx playwright test --project=chromium

test-firefox: ## Run Firefox tests only
	@echo "$(GREEN)Running Firefox tests...$(NC)"
	docker-compose run --rm playwright-tests \
		npx playwright test --project=firefox

test-webkit: ## Run WebKit tests only
	@echo "$(GREEN)Running WebKit tests...$(NC)"
	docker-compose run --rm playwright-tests \
		npx playwright test --project=webkit

test-smoke: ## Run smoke tests
	@echo "$(GREEN)Running smoke tests...$(NC)"
	docker-compose run --rm playwright-tests \
		npx playwright test --grep @smoke

test-headed: ## Run tests in headed mode
	@echo "$(GREEN)Running tests in headed mode...$(NC)"
	docker-compose run --rm playwright-tests \
		npx playwright test --headed

test-debug: ## Run tests in debug mode
	@echo "$(GREEN)Running tests in debug mode...$(NC)"
	docker-compose run --rm -e DEBUG=pw:api playwright-tests

test-ui: ## Run tests in UI mode
	@echo "$(GREEN)Starting Playwright UI...$(NC)"
	docker-compose run --rm -p 9323:9323 playwright-tests \
		npx playwright test --ui-host=0.0.0.0

# ============
# Service Management
# ============
up: ## Start all services
	@echo "$(GREEN)Starting services...$(NC)"
	docker-compose up -d

down: ## Stop all services
	@echo "$(GREEN)Stopping services...$(NC)"
	docker-compose down

restart: ## Restart all services
	@echo "$(GREEN)Restarting services...$(NC)"
	docker-compose restart

ps: ## Show service status
	@echo "$(GREEN)Service status:$(NC)"
	docker-compose ps

# ============
# Logs & Monitoring
# ============
logs: ## Follow logs
	docker-compose logs -f

logs-playwright: ## Follow Playwright logs
	docker-compose logs -f playwright-tests

stats: ## Show resource usage
	docker stats $(CONTAINER_NAME)

# ============
# Interactive Commands
# ============
shell: ## Open interactive bash shell
	@echo "$(GREEN)Opening shell in container...$(NC)"
	docker-compose run --rm playwright-tests /bin/bash

exec: ## Execute command in running container
	@echo "$(GREEN)Executing in running container...$(NC)"
	docker-compose exec playwright-tests /bin/bash

# ============
# Report Commands
# ============
report: ## Open Playwright HTML report
	@echo "$(GREEN)Opening HTML report...$(NC)"
	docker-compose run --rm -p 9323:9323 playwright-tests \
		npx playwright show-report --host=0.0.0.0

allure: ## Generate and open Allure report
	@echo "$(GREEN)Generating Allure report...$(NC)"
	docker-compose run --rm playwright-tests \
		npm run allure:generate && npm run allure:open

allure-server: ## Start Allure server
	@echo "$(GREEN)Starting Allure server...$(NC)"
	docker-compose up -d allure-server
	@echo "$(GREEN)Allure UI available at: http://localhost:5050$(NC)"

# ============
# Maintenance Commands
# ============
clean: ## Remove containers and images
	@echo "$(YELLOW)Cleaning up containers and images...$(NC)"
	docker-compose down -v
	docker rmi $(IMAGE_NAME):$(TAG) 2>/dev/null || true

clean-all: ## Remove everything (containers, images, volumes)
	@echo "$(YELLOW)Cleaning up everything...$(NC)"
	docker-compose down -v --rmi all
	docker system prune -f

clean-results: ## Clean test results
	@echo "$(YELLOW)Cleaning test results...$(NC)"
	rm -rf test-results/* playwright-report/* allure-results/* allure-report/*

clean-cache: ## Clean npm and Playwright cache
	@echo "$(YELLOW)Cleaning cache...$(NC)"
	docker-compose down -v npm-cache playwright-cache

# ============
# CI/CD Commands
# ============
ci: ## Run CI pipeline
	@echo "$(GREEN)Running CI pipeline...$(NC)"
	$(MAKE) build
	$(MAKE) test
	$(MAKE) report

ci-parallel: ## Run tests in parallel
	@echo "$(GREEN)Running parallel tests...$(NC)"
	docker-compose up --scale playwright-tests=3

# ============
# Development Commands
# ============
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	docker-compose run --rm playwright-tests npm ci

update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	docker-compose run --rm playwright-tests npm update

lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	docker-compose run --rm playwright-tests npm run lint

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	docker-compose run --rm playwright-tests npm run format

# ============
# Utility Commands
# ============
version: ## Show versions
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)System Versions:$(NC)"
	@echo "Docker:     $$(docker --version)"
	@echo "Compose:    $$(docker-compose --version)"
	@echo ""
	@echo "$(GREEN)Container Versions:$(NC)"
	@docker-compose run --rm playwright-tests bash -c \
		'echo "Node:       $$(node --version)" && \
		 echo "npm:        $$(npm --version)" && \
		 echo "Playwright: $$(npx playwright --version)"'
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"

health: ## Check container health
	@echo "$(GREEN)Checking container health...$(NC)"
	docker-compose ps
	@docker inspect $(CONTAINER_NAME) --format='{{.State.Health.Status}}' 2>/dev/null || \
		echo "Container not running"

pull: ## Pull latest base image
	@echo "$(GREEN)Pulling latest Playwright image...$(NC)"
	docker pull node:20-bullseye

# ============
# Quick Aliases
# ============
t: test ## Alias for test
b: build ## Alias for build
u: up ## Alias for up
d: down ## Alias for down
l: logs ## Alias for logs
s: shell ## Alias for shell
c: clean ## Alias for clean

# ══════════════════════════════════════════════════════════════
# 🚀 EXAMPLES
# ══════════════════════════════════════════════════════════════
#
# Quick start:
#   make build && make test
#
# Development workflow:
#   make shell
#   > npx playwright test --ui
#
# CI workflow:
#   make ci
#
# Clean everything:
#   make clean-all
#
# ══════════════════════════════════════════════════════════════