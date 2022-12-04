#!/bin/bash

function check_status {
	if [ $? -ne 0 ]
	then
		printf "[\x1b[31mFAIL\x1b[0m] %s\n" "$1"
		printf "Type \"yes\" to continue ignoring errors? "
		read confirmation
		if [ "$confirmation" != "yes" ]
		then
			printf "Log located at /tmp/dssetup.log\n"
			exit 1
		fi
	else
		printf "[ \x1b[32mOK\x1b[0m ] %s\n" "$1"
	fi
}

# commenting out cdrom as repo
sed -i -e "/^deb\scdrom:/ s/^/# /;" /etc/apt/sources.list

apt-get update
apt-get install -y apache2 libapache2-mod-wsgi-py3 mongodb-server mariadb-server default-libmysqlclient-dev ffmpeg python3 python3-setuptools python3-pip python3-mysqldb python3-bottle python3-bsddb3 python3-pymongo python3-requests python3-zmq python3-pil pylint3 cython3 make default-jre unzip
check_status "Installing system-wide packages"

pip3 install jinja2 bottle-mysql bottle-mongo
check_status "Installing python modules"

mkdir -p /var/www/dsserver && \
mkdir -p /home/dsserver/media && \
mkdir -p /home/dsserver/temp && \
mkdir -p /home/dsserver/upload && \
mkdir -p /home/dsserver/thumb && \
ln -s /home/dsserver /var/dsserver
check_status "Setting up directory structure"

cd /tmp
wget -O dsserver.zip http://192.168.100.150/dist/dsserver-latest.zip && \
unzip -o dsserver.zip -d /var/www/dsserver
check_status "Installing server distributive"

chown www-data:www-data /var/www/dsserver && \
chown -R www-data:www-data /var/dsserver && \
chmod -R 777 /var/dsserver
check_status "Setting up directory permissions"

cat <<EOF > /etc/apache2/sites-available/dsserver.conf
<VirtualHost *:80>
	WSGIScriptAlias / "/var/www/dsserver/app.wsgi"
	Alias /repo "/var/www/dsserver/dist"
	Alias /static "/var/www/dsserver/static"
	Alias /media "/var/dsserver/media"
	Alias /thumb "/var/dsserver/thumb"
	ErrorLog "/var/log/apache2/dsserver.log"
	LimitRequestBody 1073741824
	<Directory "/var/www/dsserver/static">
		Require all granted
		Options -Indexes
	</Directory>
	<Directory "/var/dsserver/media">
		Require all granted
		Options -Indexes
	</Directory>
	<Directory "/var/dsserver/thumb">
		Require all granted
		Options -Indexes
	</Directory>
	<Directory "/var/www/dsserver">
	<Files controllers.py>
		Require all granted
	</Files>
	</Directory>
</VirtualHost>
EOF

a2dissite 000-default.conf && \
a2ensite dsserver.conf
check_status "Setting up apache virtual host"

cat <<'EOF' > db.sql
CREATE DATABASE IF NOT EXISTS dsserver;
CREATE USER IF NOT EXISTS 'dsserver'@'localhost' IDENTIFIED BY "D!git4SGH9000";
GRANT ALL PRIVILEGES ON `dsserver`.* TO 'dsserver'@'localhost';
FLUSH PRIVILEGES;
EOF

mysql -u root < db.sql && rm db.sql
check_status "Setting up database"

cat <<EOF > /var/www/dsserver/settings.py
BASE_DIR   = '/var/www/dsserver'
MEDIA_DIR  = '/var/dsserver/media'
THUMB_DIR  = '/var/dsserver/thumb'
UPLOAD_DIR = '/var/dsserver/upload'
PROCESSED_DIR = '/var/dsserver/temp'
TELEMETRY_CACHE = '/var/www/dsserver/tcache.db'
DB_HOST = 'localhost'
DB_USER = 'dsserver'
DB_PASS = 'D!git4SGH9000'
DB_NAME = 'dsserver'
FFMPEG_PATH = '/usr/bin/ffmpeg'
CONVERT_IPC = "tcp://127.0.0.1:9940"
EOF

cat <<EOF > /lib/systemd/system/dssconv.service
[Unit]
Description=Digital signage conversion service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dsserver
ExecStart=/usr/bin/python3 start_conv.py

[Install]
WantedBy=multi-user.target
EOF

wget -O antmedia.zip https://github.com/ant-media/Ant-Media-Server/releases/download/ams-v1.5.1.1/ant-media-server-community-1.5.1.1-181011_1410.zip && \
unzip -o antmedia.zip -d /opt
check_status "Installing ant media server"

cat <<EOF > /lib/systemd/system/antmedia.service
[Unit]
Description=AntMedia

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ant-media-server
ExecStart=/bin/bash /opt/ant-media-server/start.sh
ExecStop=/bin/bash /opt/ant-media-server/shutdown.sh

[Install]
WantedBy=multi-user.target
EOF

sed -i 's/^\(http.port=[0-9]\+\)$/http.port=5088/' /opt/ant-media-server/conf/red5.properties

cat <<EOF > /etc/apache2/sites-available/antproxy.conf
Listen 5080
<VirtualHost *:5080>
ProxyPass / http://localhost:5088/
</VirtualHost>
EOF

a2ensite antproxy.conf && \
a2enmod proxy && \
a2enmod proxy_http
check_status "Setting up ant media server proxy for api"

systemctl enable antmedia && \
systemctl start antmedia
check_status "Starting up ant media server"

cd /var/www/dsserver
make && \
make clean
check_status "Compiling server to binaries"
rm controllers.py && \
rm convert.py && \
rm datalayer.py && \
rm distlayer.py
check_status "Removing server source code"

systemctl enable dssconv && \
systemctl start dssconv
check_status "Starting up conversion service"
systemctl restart apache2
check_status "Restarting web server"
