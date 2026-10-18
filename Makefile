# FlowBoard - COE 692 (Software Design & Architecture)
# Thin wrapper over the npm scripts, for parity with the other projects.

.PHONY: help install start dev test demo docker

help:
	@echo "make install  - npm install"
	@echo "make start    - run the API on http://localhost:3000"
	@echo "make dev      - run with auto-reload (node --watch)"
	@echo "make test     - run the test suite (node --test, no framework)"
	@echo "make demo     - scripted tour of the API, no server needed"
	@echo "make docker   - build and run in a container (needs Docker)"

install:
	npm install

start:
	npm start

dev:
	npm run dev

test:
	npm test

demo:
	npm run demo

docker:
	docker compose up --build
