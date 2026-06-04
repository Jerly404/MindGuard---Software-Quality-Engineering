.PHONY: test test-backend test-frontend lint lint-backend lint-frontend

test:
	@./test.sh

test-backend:
	@echo "Running Backend Tests..."
	@cd backend && ./venv/bin/pytest

test-frontend:
	@echo "Running Frontend Tests..."
	@cd frontend && npm test

lint:
	@echo "Running All Linters..."
	@cd backend && ./venv/bin/ruff check .
	@cd frontend && npm run lint

lint-backend:
	@cd backend && ./venv/bin/ruff check .

lint-frontend:
	@cd frontend && npm run lint
