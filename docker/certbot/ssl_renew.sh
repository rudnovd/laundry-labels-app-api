#!/bin/bash

docker-compose run certbot-service renew && docker-compose kill -s SIGHUP nginx-service
