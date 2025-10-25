.PHONY: help build up down restart logs clean rebuild shell test backup restore

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)PulsePlay - Docker Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Available Environments:$(NC)"
	@echo "  $(GREEN)Local$(NC):     docker-compose.yml (MongoDB + Backend + Frontend)"
	@echo "  $(GREEN)Atlas$(NC):      docker-compose.atlas.yml (Atlas + Backend + Frontend)"
	@echo "  $(GREEN)Dev$(NC):        docker-compose.dev.yml (Hot reload + Debug tools)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(YELLOW)<target>$(NC)\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

build: ## Build all Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build

up: ## Start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"
	@echo "MongoDB:  mongodb://localhost:27017"

up-debug: ## Start all services including Mongo Express
	@echo "$(GREEN)Starting all services with debug tools...$(NC)"
	docker-compose --profile debug up -d
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "Frontend:      http://localhost:5173"
	@echo "Backend:       http://localhost:3000"
	@echo "MongoDB:       mongodb://localhost:27017"
	@echo "Mongo Express: http://localhost:8081"

up-atlas: ## Start services with MongoDB Atlas (no local DB)
	@echo "$(GREEN)Starting services with MongoDB Atlas...$(NC)"
	docker-compose -f docker-compose.atlas.yml up -d
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3001"
	@echo "MongoDB:  Atlas Cloud"

up-dev: ## Start development environment with hot reload
	@echo "$(GREEN)Starting development environment with hot reload...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development services started successfully!$(NC)"
	@echo "Frontend:      http://localhost:5173 (hot reload)"
	@echo "Backend:       http://localhost:3000 (hot reload)"
	@echo "MongoDB:       mongodb://localhost:27017"
	@echo "Mongo Express: http://localhost:8081"
	@echo "Debug Port:    localhost:9229 (backend debugging)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Services stopped!$(NC)"

down-atlas: ## Stop Atlas services
	@echo "$(YELLOW)Stopping Atlas services...$(NC)"
	docker-compose -f docker-compose.atlas.yml down
	@echo "$(GREEN)Services stopped!$(NC)"

down-dev: ## Stop development services
	@echo "$(YELLOW)Stopping development services...$(NC)"
	docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)Development services stopped!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)Services restarted!$(NC)"

logs: ## View logs from all services
	docker-compose logs -f

logs-atlas: ## View logs from Atlas deployment
	docker-compose -f docker-compose.atlas.yml logs -f

logs-dev: ## View logs from development environment
	docker-compose -f docker-compose.dev.yml logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-mongodb: ## View MongoDB logs
	docker-compose logs -f mongodb

ps: ## Show running containers
	docker-compose ps

clean: ## Remove all containers and volumes (WARNING: deletes data!)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)Cleanup complete!$(NC)"; \
	fi

clean-dev: ## Remove development containers and volumes
	@echo "$(RED)WARNING: This will delete development data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.dev.yml down -v; \
		echo "$(GREEN)Development cleanup complete!$(NC)"; \
	fi

rebuild: ## Rebuild and restart all services
	@echo "$(YELLOW)Rebuilding and restarting services...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)Services rebuilt and restarted!$(NC)"

rebuild-dev: ## Rebuild and restart development services
	@echo "$(YELLOW)Rebuilding and restarting development services...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "$(GREEN)Development services rebuilt and restarted!$(NC)"

rebuild-atlas: ## Rebuild and restart Atlas services
	@echo "$(YELLOW)Rebuilding and restarting Atlas services...$(NC)"
	docker-compose -f docker-compose.atlas.yml up -d --build
	@echo "$(GREEN)Atlas services rebuilt and restarted!$(NC)"

shell-backend: ## Access backend container shell
	docker-compose exec backend sh

shell-backend-dev: ## Access development backend container shell
	docker-compose -f docker-compose.dev.yml exec backend-dev sh

shell-frontend-dev: ## Access development frontend container shell
	docker-compose -f docker-compose.dev.yml exec frontend-dev sh

shell-mongodb: ## Access MongoDB shell
	docker-compose exec mongodb mongosh

shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

test-backend: ## Run backend tests
	docker-compose exec backend npm test

test-backend-dev: ## Run backend tests in dev environment
	docker-compose -f docker-compose.dev.yml exec backend-dev npm test

test-lint: ## Run linter
	docker-compose exec backend npm run lint

test-lint-dev: ## Run linter in dev environment
	docker-compose -f docker-compose.dev.yml exec backend-dev npm run lint

backup: ## Backup MongoDB database
	@echo "$(YELLOW)Creating MongoDB backup...$(NC)"
	@mkdir -p ./backups
	docker-compose exec -T mongodb mongodump --archive > ./backups/mongodb_backup_$$(date +%Y%m%d_%H%M%S).archive
	@echo "$(GREEN)Backup created in ./backups/$(NC)"

restore: ## Restore MongoDB from latest backup
	@echo "$(YELLOW)Restoring MongoDB from latest backup...$(NC)"
	@latest=$$(ls -t ./backups/mongodb_backup_*.archive 2>/dev/null | head -1); \
	if [ -z "$$latest" ]; then \
		echo "$(RED)No backup files found!$(NC)"; \
		exit 1; \
	fi; \
	echo "Restoring from: $$latest"; \
	docker-compose exec -T mongodb mongorestore --archive < $$latest
	@echo "$(GREEN)Restore complete!$(NC)"

health: ## Check health of all services
	@echo "$(YELLOW)Checking service health...$(NC)"
	@docker-compose ps
	@echo ""
	@echo "Local Services:"
	@curl -s http://localhost:3000/api/health 2>/dev/null && echo "$(GREEN)Backend (port 3000): OK$(NC)" || echo "$(RED)Backend (port 3000): Not responding$(NC)"
	@curl -s http://localhost:5173 2>/dev/null && echo "$(GREEN)Frontend (port 5173): OK$(NC)" || echo "$(RED)Frontend (port 5173): Not responding$(NC)"
	@echo ""
	@echo "Atlas Services:"
	@curl -s http://localhost:3001/api/health 2>/dev/null && echo "$(GREEN)Backend (port 3001): OK$(NC)" || echo "$(RED)Backend (port 3001): Not responding$(NC)"
	@echo ""
	@echo "Development Services:"
	@docker-compose -f docker-compose.dev.yml ps | grep -q "pulseplay-backend-dev" && echo "$(GREEN)Dev Backend: Running$(NC)" || echo "$(RED)Dev Backend: Not running$(NC)"
	@docker-compose -f docker-compose.dev.yml ps | grep -q "pulseplay-frontend-dev" && echo "$(GREEN)Dev Frontend: Running$(NC)" || echo "$(RED)Dev Frontend: Not running$(NC)"

init: ## Initialize project (copy env template, install deps)
	@echo "$(YELLOW)Initializing PulsePlay...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.docker.template .env; \
		echo "$(GREEN)Created .env file from template$(NC)"; \
		echo "$(YELLOW)Please edit .env with your credentials!$(NC)"; \
	else \
		echo "$(GREEN).env file already exists$(NC)"; \
	fi

dev: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	$(MAKE) up-dev

stats: ## Show Docker resource usage
	docker stats --no-stream

prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

update: ## Pull latest images and rebuild
	@echo "$(YELLOW)Updating images...$(NC)"
	docker-compose pull
	docker-compose up -d --build
	@echo "$(GREEN)Update complete!$(NC)"

# Default target
.DEFAULT_GOAL := help

# Last Updated: October 25, 2025
