FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y apache2 libapache2-mod-wsgi-py3 \
        mariadb-server default-libmysqlclient-dev \
        ffmpeg python3 python3-setuptools python3-pip \
        python3-mysqldb python3-bottle python3-bsddb3 \
        python3-requests python3-zmq python3-pil aapt \
        libreoffice && \
    pip3 install jinja2 bottle-mysql

RUN mkdir -p /home/dserver && \
    mkdir -p /var/dserver/media && \
    mkdir -p /var/dserver/thumb && \
    mkdir -p /var/dserver/upload && \
    mkdir -p /var/dserver/packages && \
    mkdir -p /tmp/dserver && \
    chown -R www-data:www-data /var/dserver && \
    chmod 777 /var/dserver

COPY views /home/dserver/views
COPY static /home/dserver/static
COPY wsgi.py convert.py controllers.py datalayer.py distlayer.py migrate_db.py fallback.json ffwrap.py locale.json start_conv.py docker/settings.py docker/prepare.sql docker/startup.sh /home/dserver/
COPY docker/dserver.conf /etc/apache2/sites-available/

RUN service mysql start && \
    a2dissite 000-default.conf && \
    a2ensite dserver.conf && \
    service apache2 restart

ENTRYPOINT ["/bin/sh", "/home/dserver/startup.sh"]
