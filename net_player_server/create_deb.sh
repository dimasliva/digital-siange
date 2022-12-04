#!/bin/bash

function get_version() {
	dpkg-query -s "$1" | grep Version | cut -d' ' -f2
}

PY_VERSION=`python3 -c 'import sys; print("{}.{}".format(*sys.version_info))'`
PY_ORIGINAL=`python3 -c 'import sys; print("{}{}m".format(*sys.version_info))'`
ARCH=`dpkg-architecture --query DEB_HOST_ARCH`
BASEDIR=`pwd`
VERSION="3.9.$(git rev-list --count --first-parent HEAD)~$(git rev-parse --short HEAD)-1"

DEB_ROOT="./debuild"

function prepare_antmediaserver {
	# downloading release from github
	if [ ! -f "antmedia.zip" ]
	then
	    wget -O antmedia.zip https://github.com/ant-media/Ant-Media-Server/releases/download/ams-v1.5.1.1/ant-media-server-community-1.5.1.1-181011_1410.zip
	fi
	# unpacking to debroot
	mkdir -p "${DEB_ROOT}/opt"
	unzip -o antmedia.zip -d "${DEB_ROOT}/opt"
	# configs
	sed -i 's/^\(http.port=[0-9]\+\)$/http.port=5088/' "${DEB_ROOT}/opt/ant-media-server/conf/red5.properties"
	mkdir -p "${DEB_ROOT}/etc/apache2/sites-available"
	cat <<EOF > "${DEB_ROOT}/etc/apache2/sites-available/antproxy.conf"
Listen 5080
<VirtualHost *:5080>
ProxyPass / http://localhost:5088/
</VirtualHost>
EOF
	# services
	mkdir -p "${DEB_ROOT}/lib/systemd/system"
	cat <<EOF > "${DEB_ROOT}/lib/systemd/system/antmedia.service"
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
	# add to postinst
	cat <<'EOF' >> "${DEB_ROOT}/DEBIAN/postinst"
a2enmod proxy && \
a2enmod proxy_http && \
a2ensite antproxy.conf && \
systemctl enable antmedia && \
systemctl start antmedia && \
systemctl restart apache2
EOF
}

function set_ssl {
	cp -r ./certs "${DEB_ROOT}/usr/local/dsserver/certs" && \
	cat <<EOF >> "${DEB_ROOT}/etc/apache2/sites-available/dsserver.conf"
<VirtualHost *:443>
	SLEngine on
    SSLCertificateFile /usr/local/dsserver/certs/cert.pem
    SSLCertificateKeyFile /usr/local/dsserver/certs/privkey.pem
    ProxyPass / http://localhost:80/
</VirtualHost>
EOF
}

function prepare_dsserver {
	# dsserver
	mkdir -p "${DEB_ROOT}/usr/local/dsserver"
	mkdir -p "${DEB_ROOT}/var/dsserver"
	cp -r ./views "${DEB_ROOT}/usr/local/dsserver"
	cp -r ./static "${DEB_ROOT}/usr/local/dsserver"
	cp ./wsgi.py ./compile_conv.py ./compile.py ./controllers.py ./convert.py ./datalayer.py ./distlayer.py ./fallback.json ./ffwrap.py ./locale.json ./Makefile ./start_conv.py "${DEB_ROOT}/usr/local/dsserver"
	if [ ! -n "${OPT_PRECOMPILE}" ]
	then
		cp ./postbuild "${DEB_ROOT}/usr/local/dsserver"
	fi
	# settings
	cat <<EOF > "${DEB_ROOT}/usr/local/dsserver/settings.py"
BASE_DIR   = '/usr/local/dsserver'
MEDIA_DIR  = '/var/dsserver/media'
THUMB_DIR  = '/var/dsserver/thumb'
UPLOAD_DIR = '/var/dsserver/upload'
PACKAGES_DIR = '/var/dsserver/packages'
PROCESSED_DIR = '/var/dsserver/temp'
TELEMETRY_CACHE = '/var/dsserver/tcache.db'
DB_HOST = 'localhost'
DB_USER = 'dsserver'
DB_PASS = 'D!git4SGH9000'
DB_NAME = 'dsserver'
FFMPEG_PATH = '/usr/bin/ffmpeg'
CONVERT_IPC = "tcp://127.0.0.1:9940"
EOF
	# apache virtual hosts
	mkdir -p "${DEB_ROOT}/etc/apache2/sites-available"
	cat <<EOF > "${DEB_ROOT}/etc/apache2/sites-available/dsserver.conf"
<VirtualHost *:80>
	WSGIScriptAlias / "/usr/local/dsserver/wsgi.py"
	Alias /repo "/usr/local/dsserver/dist"
	Alias /static "/usr/local/dsserver/static"
	Alias /media "/var/dsserver/media"
	Alias /thumb "/var/dsserver/thumb"
	Alias /repository "/var/dsserver/packages"
	ErrorLog "/var/log/apache2/dsserver.log"
	CustomLog "/var/log/apache2/dsserver-access.log" combined
	LimitRequestBody 1073741824
	<Directory "/usr/local/dsserver/static">
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
	<Directory "/var/dsserver/packages">
		Require all granted
		Options -Indexes
	</Directory>
	<Directory "/usr/local/dsserver">
		Require all granted
	</Directory>
</VirtualHost>
EOF
	mkdir -p "${DEB_ROOT}/lib/systemd/system"
	cat <<EOF > "${DEB_ROOT}/lib/systemd/system/dssconv.service"
[Unit]
Description=Digital signage conversion service

[Service]
Type=simple
User=www-data
WorkingDirectory=/usr/local/dsserver
ExecStart=/usr/bin/python3 start_conv.py

[Install]
WantedBy=multi-user.target
EOF
}

function precompile_dsserver {
	# compile
	pushd "${DEB_ROOT}/usr/local/dsserver"
	make && \
	make clean && \
	rm controllers.py && \
	rm convert.py && \
	rm datalayer.py && \
	rm distlayer.py
	if [ -n "$COMPAT" ]
	then
		OLD_INFIX="${PY_ORIGINAL}"
		NEW_INFIX=$(echo "${PY_VERSION}m" | tr -d ".")
		for f in *.so; do mv "$f" "${f/${OLD_INFIX}/${NEW_INFIX}}"; done
	fi
	popd
}

function prepare_deb {
	# package stuff
	mkdir -p "${DEB_ROOT}/DEBIAN"
	cat <<EOF > "${DEB_ROOT}/DEBIAN/control"
Package: dsserver
Version: $VERSION
Section: base
Priority: optional
Architecture: $ARCH
Depends: apache2, libapache2-mod-wsgi-py3, mariadb-server, default-libmysqlclient-dev, ffmpeg, python3 (>=$PY_VERSION), python3-setuptools, python3-pip, python3-mysqldb, python3-bottle, python3-bsddb3, python3-requests, python3-zmq, python3-pil, pylint3, default-jre, aapt, libreoffice
Maintainer: Kirill Anikin (akir@mmvs.ru)
Description: Package for mmvs digital signage server
Built-Using: gcc (= `get_version gcc`), python3 (= `get_version python3`), cython3 (= `get_version cython3`)
EOF

	cat <<'EOF' > "${DEB_ROOT}/DEBIAN/postinst"
#!/bin/bash

pip3 install jinja2 bottle-mysql
mkdir -p /var/dsserver/media && \
mkdir -p /var/dsserver/temp && \
mkdir -p /var/dsserver/upload && \
mkdir -p /var/dsserver/thumb && \
mkdir -p /var/dsserver/packages
chown -R www-data:www-data /usr/local/dsserver && \
chown -R www-data:www-data /var/dsserver && \
chmod -R 777 /var/dsserver
systemctl enable mysql
systemctl start mysql && \
{
mysql -u root <<-'MYSQL'
	CREATE DATABASE IF NOT EXISTS dsserver;
	CREATE USER IF NOT EXISTS 'dsserver'@'localhost' IDENTIFIED BY "D!git4SGH9000";
	GRANT ALL PRIVILEGES ON `dsserver`.* TO 'dsserver'@'localhost';
	FLUSH PRIVILEGES;
MYSQL
}
# python3 /usr/local/dsserver/migrate_db.py && \
a2dissite 000-default.conf && \
a2ensite dsserver.conf && \
systemctl restart apache2
systemctl enable dssconv && \
systemctl start dssconv
EOF
	chmod +x "${DEB_ROOT}/DEBIAN/postinst"
}

function assemble_deb {
	dpkg-deb --build "${DEB_ROOT}" .
	rm -rf "${DEB_ROOT}"
}

function usage {
	cat <<EOF
Build digital signage server debian package
Usage:
	${0} [-h] [-c python3version] [-a] [-p]
Options:
	-h                    show this help
	-c python3_version    specify python 3 for compatibility
	-a                    include ant media server in package
	-p                    precompile server
EOF
}

if [ "$1" == "compat35" ]
then
	COMPAT=1
	PY_VERSION="3.5"
fi

while getopts ":hac:p" o; do
	case "${o}" in
		h)	# help
			usage
			exit 0
			;;
		a) 	# include ant media server
			OPT_ANT="1"
			echo "[+] include Ant Media Server"
			;;
		c)	# set compatibility mode
			COMPAT="1"
			PY_VERSION="${OPTARG}"
			echo "[+] try to be compatible with python${PY_VERSION}"
			;;
		p)	# precompile binaries
			OPT_PRECOMPILE="1"
			echo "[+] precompile server with cython"
			;;
	esac
done
prepare_deb && \
prepare_dsserver && \
if [ -n "${OPT_PRECOMPILE}" ]
then
	precompile_dsserver
fi && \
if [ -n "${OPT_ANT}" ]
then
	prepare_antmediaserver
fi && \
assemble_deb
