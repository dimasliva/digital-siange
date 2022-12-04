import os
import time
import zipfile

BASEDIR = os.path.abspath(os.path.dirname(__file__))

REQUIRED_FILES = [
    'app.wsgi', 'compile_conv.py', 'compile.py', 'controllers.py',
    'convert.py', 'datalayer.py', 'distlayer.py', 'fallback.json',
    'ffwrap.py', 'locale.json', 'Makefile', 'requirements.txt',
    'start_conv.py'
]

def zip_dir(zfile, path):
    for file in os.listdir(os.path.join(BASEDIR, path)):
        if os.path.isdir(os.path.join(BASEDIR, path, file)):
            zip_dir(zfile, os.path.join(path, file))
        else:
            zfile.write(os.path.join(BASEDIR, path, file), os.path.join(path, file))

if __name__ == '__main__':
    currentdate = time.gmtime()
    name = 'dsserver-{}.{}.{}.zip'.format(currentdate.tm_year - 2016, currentdate.tm_mon, currentdate.tm_mday)
    os.chdir(BASEDIR)
    bundle = zipfile.ZipFile(name, 'w', zipfile.ZIP_STORED)
    zip_dir(bundle, 'views')
    zip_dir(bundle, 'static')
    for f in REQUIRED_FILES:
        bundle.write(os.path.join(BASEDIR, f), f)
    bundle.writestr(zipfile.ZipInfo('dist/'), '')
    bundle.close()
