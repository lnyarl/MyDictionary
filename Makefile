.PHONY: help install dev build up down clean logs test

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies for both backend and frontend"
	@echo "  make dev           - Start development environment"
	@echo "  make build         - Build Docker images"
	@echo "  make up            - Start Docker containers (production)"
	@echo "  make down          - Stop Docker containers"
	@echo "  make clean         - Clean up node_modules and build artifacts"
	@echo "  make logs          - Show Docker logs"
	@echo "  make test          - Run tests"

install:
	@echo "Installing backend dependencies..."
	cd backend && yarn install
	@echo "Installing frontend dependencies..."
	cd frontend && yarn install

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "PostgreSQL is running on port 5432"

build:
	@echo "Building Docker images..."
	docker-compose build

up:
	@echo "Starting Docker containers..."
	docker-compose up -d

down:
	@echo "Stopping Docker containers..."
	docker-compose down

clean:
	@echo "Cleaning up..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist

logs:
	docker-compose logs -f

test:
	@echo "Running backend tests..."
	cd backend && yarn test
