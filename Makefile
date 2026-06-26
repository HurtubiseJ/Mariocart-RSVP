# Mariocart-RSVP — developer tasks.
#
# The C++ toolchain wrangling lives here so the source stays focused on
# learning C++. Common flow:
#
#   make setup      # one time: clone & bootstrap vcpkg
#   make db-create  # one time: create the local postgres database
#   make migrate    # apply db/migrations/*.sql
#   make run        # configure (if needed), build, and start the server

SHELL := /bin/bash

SERVER_DIR := apps/server
BUILD_DIR  := $(SERVER_DIR)/build
VCPKG_DIR  := $(CURDIR)/vcpkg
export VCPKG_ROOT := $(VCPKG_DIR)

# Pull DATABASE_URL / PORT in from .env when it exists, and pass them through
# to recipes (so `make run` and `make migrate` see them).
ifneq (,$(wildcard .env))
include .env
export
endif

DATABASE_URL ?= postgresql://localhost:5432/mariokart_rsvp

.PHONY: help
help:
	@echo "Targets:"
	@echo "  make setup      - clone & bootstrap vcpkg (one time)"
	@echo "  make db-create  - create the local postgres database"
	@echo "  make migrate    - apply db/migrations/*.sql to DATABASE_URL"
	@echo "  make configure  - run cmake configure (installs deps via vcpkg)"
	@echo "  make build      - compile the server"
	@echo "  make run        - configure + build + run the server"
	@echo "  make test       - build, run the server, and run the Python HTTP tests"
	@echo "  make clean      - remove the build directory"

# --- vcpkg -----------------------------------------------------------------

.PHONY: setup
setup: $(VCPKG_DIR)/vcpkg

$(VCPKG_DIR)/vcpkg:
	@test -d "$(VCPKG_DIR)/.git" || git clone https://github.com/microsoft/vcpkg.git "$(VCPKG_DIR)"
	"$(VCPKG_DIR)/bootstrap-vcpkg.sh" -disableMetrics

# --- build -----------------------------------------------------------------

.PHONY: configure
configure: setup
	cd $(SERVER_DIR) && cmake --preset default

# Configure on first build only; subsequent builds reuse the cache.
$(BUILD_DIR):
	$(MAKE) configure

.PHONY: build
build: $(BUILD_DIR)
	cmake --build $(BUILD_DIR)

.PHONY: run
run: build
	$(BUILD_DIR)/server

.PHONY: test
test:
	./test.sh

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)

# --- database --------------------------------------------------------------

.PHONY: db-create
db-create:
	createdb mariokart_rsvp || echo "database may already exist — countinuing"

.PHONY: migrate
migrate:
	@for f in db/migrations/*.sql; do \
		echo "applying $$f"; \
		psql "$(DATABASE_URL)" -v ON_ERROR_STOP=1 -f "$$f" || exit 1; \
	done
