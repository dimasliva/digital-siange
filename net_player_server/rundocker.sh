#!/bin/bash

SERVER_VERSION="3.9.$(git rev-list --count --first-parent HEAD).$(git rev-parse --short HEAD)"

docker rm -f digitalsignage || true
docker build \
    -t dserver:unstable \
    -f docker/server.Dockerfile \
    .
docker run \
    --name digitalsignage \
    -it \
    -d \
    --env DSS_VERSION=${SERVER_VERSION} \
    -p 8008:80 \
    -v ds2db:/var/lib/mysql \
    -v ds2data:/var/dserver \
    dserver:unstable
