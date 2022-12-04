import os, sys, tempfile, traceback, hashlib, time, subprocess
from bottle import response, request, redirect, abort
from glob import glob
from datetime import datetime
from json import dumps, loads

from bsddb3 import db as berkeley


class Repository(object):

    def __init__(self, cursor, datadir):
        self.datadir = datadir
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS Repository(
        Revision INT PRIMARY KEY NOT NULL,
        PackageFile TEXT,
        PackageChecksum TEXT
        )''')

    def status(self, db):
        data = request.json
        device_db = berkeley.DB()
        device_db.open(os.path.join(self.datadir, 'upkeep.db'), None, berkeley.DB_HASH, berkeley.DB_CREATE)
        device_db.put(
            str(data['id']).encode('utf-8'),
            dumps({
                'build': data['version'],
                'rtime': int(time.time())
            }).encode('utf-8')
        )
        device_db.close()
        db.execute('SELECT Revision FROM Repository ORDER BY Revision DESC')
        resp = db.fetchone()
        if resp is None:
            return dumps({
                'success': False,
                'error': 'No package available'
            })
        return dumps({
            'success': True,
            'version': resp['Revision']
        })

    @staticmethod
    def extract_apk_version(filename):
        try:
            proc = subprocess.Popen(['/usr/bin/aapt', 'dump', 'badging', filename], stdout=subprocess.PIPE)
            data = proc.communicate()[0].decode('utf-8')
            package_line = data.find('package: ', 0)
            if package_line == -1:
                return None
            version_start = data.find('versionCode=', package_line) + len('versionCode=') + 1
            version_end = version_start
            while data[version_end] != '\'':
                version_end += 1
            return int(data[version_start:version_end])
        except:
            sys.stderr.write(traceback.format_exc())
            sys.stderr.flush()
            return None

    def last(self, db):
        db.execute('SELECT Revision, PackageFile, PackageChecksum FROM Repository ORDER BY Revision DESC')
        resp = db.fetchone()
        response.headers['Content-Type'] = 'application/json'
        if resp:
            return dumps({
                'success': True,
                'build': resp['Revision'],
                'link': '/repository/' + resp['PackageFile'],
                'file': resp['PackageFile'],
                'checksum': resp['PackageChecksum']
            })
        else:
            return dumps({
                'success': False
            })

    def package_list(self, db):
        db.execute('SELECT Revision, PackageFile, PackageChecksum ORDER BY Revision DESC')
        resp = db.fetchall()
        packages = []
        for p in resp:
            packages.append({
                'revision': p['Revision'],
                'package': p['PackageFile']
            })
        return dumps({
            'success': True,
            'packages': packages
        })

    def package_fetch(self, db, revision):
        db.execute('SELECT PackageFile FROM Repository WHERE Revision = %s', (revision,))
        resp = db.fetchone()
        if resp:
            return redirect('/repository/' + resp['PackageFile'])
        else:
            return abort(404)

    def upload_distrib(self, db):
        try:
            response.headers['Content-Type'] = 'application/json'
            upload = request.files.get('upfile')
            _, ext = os.path.splitext(upload.filename)
            package_name = datetime.utcnow().strftime("%Y%m%dT%H%M%S") + ext
            upload.save(os.path.join(self.datadir, package_name))
            revision = Repository.extract_apk_version(os.path.join(self.datadir, package_name))
            if revision is None:
                return dumps({
                    'success': False,
                    'error': 'Failed to recognize APK version'    
                })
            db.execute('SELECT Revision, PackageFile FROM Repository WHERE Revision = %s', (revision, ))
            checksum = hashlib.md5(open(os.path.join(self.datadir, package_name), 'rb').read()).hexdigest()
            result = db.fetchone()
            if result:
                if os.path.isfile(os.path.join(self.datadir, result['PackageFile'])):
                    os.remove(os.path.join(self.datadir, result['PackageFile']))
                db.execute('UPDATE Repository SET PackageFile = %s, PackageChecksum = %s WHERE Revision = %s',
                    (package_name, checksum, revision))
            else:
                db.execute('INSERT INTO Repository(Revision, PackageFile, PackageChecksum) VALUES(%s, %s, %s)',
                    (revision, package_name, checksum))
            return dumps({
                'success': True,
                'result': package_name
            })
        except:
            return dumps({
                'success': False,
                'error': traceback.format_exc()
            })
