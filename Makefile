-include .env

export $(shell sed 's/=.*//' .env)

export GIT_LOCAL_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)

export GIT_LOCAL_BRANCH := $(or $(GIT_LOCAL_BRANCH),dev)


####################################################################
## Status Output
####################################################################

print-status:
	@echo " +---------------------------------------------------------+ "
	@echo " | Current Settings                                        | "
	@echo " +---------------------------------------------------------+ "
	@echo " | GIT LOCAL BRANCH: $(GIT_LOCAL_BRANCH) "
	@echo " +---------------------------------------------------------+ "

####################################################################
## Local Development
####################################################################

run-local:
	@echo "+\n++ Make: Starting databases ...\n+"

	@docker-compose up -d forms-flow-bpm-db forms-flow-forms-db forms-flow-webapi-db

	@echo "+\n++ Waiting for databases to start ...\n+"
	./wait-for-it.sh -t 240 0.0.0.0:27018
	./wait-for-it.sh -t 240 0.0.0.0:6432
	./wait-for-it.sh -t 240 0.0.0.0:5432
	@echo "+\n++ Waiting for app to start ...\n+"
	@docker-compose up

close-local:
	@echo "+\n++ Make: Stopping app ...\n+"
	@docker-compose down