install:
	docker-compose -f docker-compose.build.yml run --rm install

quick-up:
	docker-compose -f docker-compose.build.yml run --rm quick-up

dev-build:
	docker build --no-cache -t whirlpool-contentseen-dev:latest --target whirlpool-contentseen-dev .

prod-build:
	docker build -t whirlpool-contentseen-prod:latest --target whirlpool-contentseen-prod .

dev-up:
	docker-compose -f dev-docker-compose.yml up --build -d

prod-up:
	docker-compose -f prod-docker-compose.yml up --build -d

dev-logs:
	docker-compose -f dev-docker-compose.yml logs -f

prod-logs:
	docker-compose -f prod-docker-compose.yml logs -f

push-dev:
	docker push rihbyne/whirlpool-contentseen-dev:latest

push-prod:
	docker push rihbyne/whirlpool-contentseen-prod:latest

tag-dev:
	docker tag whirlpool-contentseen-dev:latest rihbyne/whirlpool-contentseen-dev:latest

tag-prod:
	docker tag whirlpool-contentseen-prod:latest rihbyne/whirlpool-contentseen-prod:latest
