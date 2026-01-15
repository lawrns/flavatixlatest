.PHONY: help setup install dev build start lint lint-fix format type-check test test-unit test-watch test-e2e clean check check-all security audit debug

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Flavatix Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Setup & Installation
setup: ## Complete setup (install + env + build)
	@echo "$(BLUE)Running setup...$(NC)"
	@bash setup.sh

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

dev: ## Start development server (port 3000)
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

build: ## Build for production
	@echo "$(BLUE)Building for production...$(NC)"
	npm run build

start: ## Start production server
	@echo "$(BLUE)Starting production server...$(NC)"
	npm run start

# Code Quality
lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(NC)"
	npm run lint

lint-fix: ## Fix ESLint issues
	@echo "$(BLUE)Fixing ESLint issues...$(NC)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Checking types...$(NC)"
	npm run type-check

# Testing
test: ## Run all tests (unit + e2e)
	@echo "$(BLUE)Running all tests...$(NC)"
	npm run test:all

test-unit: ## Run unit tests only
	@echo "$(BLUE)Running unit tests...$(NC)"
	npm run test:unit

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	npm run test:watch

test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	npm run test:coverage

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running e2e tests...$(NC)"
	npm run test:e2e

test-e2e-ui: ## Run e2e tests with UI
	@echo "$(BLUE)Running e2e tests with UI...$(NC)"
	npm run test:e2e:ui

test-e2e-debug: ## Debug e2e tests
	@echo "$(BLUE)Debugging e2e tests...$(NC)"
	npm run test:e2e:debug

# Quality Checks
check: ## Quick check: lint + type + unit tests
	@echo "$(BLUE)Running quick checks...$(NC)"
	npm run check

check-all: ## Full check: lint + type + all tests
	@echo "$(BLUE)Running full checks...$(NC)"
	npm run check:all

security: ## Run security audit
	@echo "$(BLUE)Running security audit...$(NC)"
	npm run security-audit

audit: ## Run npm audit (alias for security)
	@make security

# Maintenance
clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf .next dist build coverage
	@echo "$(GREEN)✓ Cleaned$(NC)"

clean-node: ## Clean node_modules and reinstall
	@echo "$(YELLOW)⚠ Removing node_modules...$(NC)"
	rm -rf node_modules package-lock.json
	npm install
	@echo "$(GREEN)✓ Reinstalled dependencies$(NC)"

debug: ## Start debugger (requires VSCode)
	@echo "$(BLUE)Starting debugger...$(NC)"
	code --debug

# Shortcuts
fix: lint-fix format ## Fix all issues (lint + format)

# Git operations
git-setup: ## Setup git hooks
	npx husky install

# Combined targets
all: check build ## Run checks and build
	@echo "$(GREEN)✓ All checks passed and build successful$(NC)"

.PHONY: all fix
