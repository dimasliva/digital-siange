#!/bin/sh

service mysql start
service apache2 start
mysql -u root < /home/dserver/prepare.sql
/usr/bin/python3 /home/dserver/migrate_db.py
/usr/bin/python3 /home/dserver/start_conv.py