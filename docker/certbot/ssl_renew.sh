#!/bin/bash

/usr/local/bin/docker-compose -f $PWD/docker-compose.yml run certbot renew \
&& /usr/local/bin/docker-compose -f $PWD/docker-compose.yml kill -s SIGHUP nginx
