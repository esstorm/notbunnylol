.PHONY: all install test lint check clean

all: check

node_modules: package.json
	npm install
	@touch node_modules

install: node_modules

lint: node_modules
	npx eslint .

test:
	node --test

check: lint test

clean:
	rm -rf node_modules
