#!/bin/bash

if ! [ $(id -u) -eq 0 ]; then
    echo "Root privileges required"
    exit 1
fi

case "$1" in
    build)
        docker build -t dsserver:beta .
        ;;
    deploy)
        docker stop dsserver
        docker rm dsserver
        docker run -dit \
            -p 8888:80 \
            -p 8855:5080 \
            -p 1935:1935 \
            -p 5554:5554 \
            --cap-add DAC_READ_SEARCH \
            --name dsserver \
            dsserver:beta
        ;;
    export)
        docker run -dit \
            -p 8888:80 \
            -p 8855:5080 \
            --cap-add DAC_READ_SEARCH \
            --name dss_exportable \
            dsserver:beta
        docker stop dss_exportable
        docker export -o dss_container.tar dss_exportable
        ;;
    altbuild)
    	docker build -f Dockerfile.alt -t dsserver:alpha .
    	;;
    altdeploy)
    	HOST=$(ip route get 1 | head -n 1 | awk '{for(i = 0; i <= NF; i++){ if($i == "src"){ break } } print $(i + 1)}')
    	docker stop dsserver_alt
        docker rm dsserver_alt
        docker run -dit \
            -p 8889:80 \
            --cap-add DAC_READ_SEARCH \
            --add-host dockerhost:$HOST \
            --mount type=bind,source=/var/docker-dss,target=/data \
            --name dsserver_alt \
            dsserver:alpha
    	;;
    altshell)
    	docker exec -it dsserver_alt bash
    	;;
    litebuild)
        docker build -f Dockerfile.lite -t dsserver:2.1 .
        ;;
    litedeploy)
        docker stop dsserver2
        docker rm dsserver2
        docker run -dit \
            -p 8888:80 \
            --add-host dockerhost:127.0.0.1 \
            --name dsserver2 \
            dsserver:2.1
        ;;
    *)
        echo "Usage: $0 build|deploy"
        exit 1
esac
