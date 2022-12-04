#!/bin/bash

service mysql start
service mongodb start
# cd /usr/local/antmedia
# nohup /usr/local/antmedia/start.sh &
service antmedia start
service apache2 start

/usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
