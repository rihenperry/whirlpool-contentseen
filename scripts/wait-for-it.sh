#!/bin/bash
while ! ((nc -z whirlpool-rmq 5672) &&
             (nc -z whirlpool-mongodb 27017) &&
             (nc -z whirlpool-postgres 5432)); do sleep 3; done
npm start
