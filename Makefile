# Makefile for NestJS Discord Bot

# Variables
DOCKER_COMPOSE = docker-compose -f docker-compose.yml
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose-dev.yml

# Development commands
.PHONY: dev-build
dev-build:
	$(DOCKER_COMPOSE_DEV) build

.PHONY: dev-up
dev-up:
	$(DOCKER_COMPOSE_DEV) up -d

.PHONY: dev-down
dev-down:
	$(DOCKER_COMPOSE_DEV) down

.PHONY: dev-logs
dev-logs:
	$(DOCKER_COMPOSE_DEV) logs -f

# Production commands
.PHONY: prod-build
prod-build:
	$(DOCKER_COMPOSE) build

.PHONY: prod-up
prod-up:
	$(DOCKER_COMPOSE) up -d

.PHONY: prod-down
prod-down:
	$(DOCKER_COMPOSE) down

.PHONY: prod-logs
prod-logs:
	$(DOCKER_COMPOSE) logs -f

# Utility commands
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans

.PHONY: prune
prune:
	docker system prune -af

# Help command
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  dev-build    - Build the development Docker image"
	@echo "  dev-up       - Start the development environment"
	@echo "  dev-down     - Stop the development environment"
	@echo "  dev-logs     - View logs for the development environment"
	@echo "  prod-build   - Build the production Docker image"
	@echo "  prod-up      - Start the production environment"
	@echo "  prod-down    - Stop the production environment"
	@echo "  prod-logs    - View logs for the production environment"
	@echo "  clean        - Remove all containers and volumes"
	@echo "  prune        - Remove all unused Docker resources"
	@echo "  help         - Show this help message"
