### whirlpool-contentseen

steps to build and push the service after pulling the repository.

`
docker build --no-cache -t whirlpool-contentseen-dev:latest --target whirlpool-contentseen-dev .
`

`
docker tag whirlpool-contentseen-dev:latest rihbyne/whirlpool-contentseen-dev:latest
`

`
docker push rihbyne/whirlpool-contentseen-dev:latest
`

`
docker-compose -f dev-docker-compose.yml build --no-cache whirlpool-contentseen
`

start the container with build flag in detach mode (will build all the images before starting)
`
docker-compose -f dev-docker-compose.yml up --build -d whirlpool-contentseen
`

stop the container by removing non-running containers 
`
docker-compose -f dev-docker-compose.yml down --remove-orphans
`

Start with no dependencies
`docker-compose run --no-deps SERVICE COMMAND [ARGS...]`

