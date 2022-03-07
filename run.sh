#!/bin/sh
git pull
docker rm -f auth
docker images
read IMAGE
docker image rm $IMAGE
docker build . -t server-auth
docker run -d -p 127.0.0.1:8080:8080 --link mongodb:mongodb --name auth server-auth
docker logs -f auth