DEV_COMPOSE := docker-compose.dev.yml
DDC := docker compose -f $(DEV_COMPOSE)

commit:
	./scripts/check-commit-status

dev-build:
	$(DDC) build

start-api:
	$(DDC) up

dev-clean:
	$(DDC) down

dev-restart:
	$(DDC) down -v

dev-api-sh:
	$(DDC) exec api sh
