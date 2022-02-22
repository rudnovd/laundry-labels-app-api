#!/bin/bash

docker-compose run certbot-service renew --dry-run && docker-compose kill -s SIGHUP nginx-service
