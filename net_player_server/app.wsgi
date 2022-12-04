#!/usr/bin/python
import sys
import os
from glob import glob
sys.path.append(os.path.dirname(__file__))
import settings
for f in glob(os.path.join(settings.UPLOAD_DIR, '*')):
    os.remove(f)
from controllers import bootstrap, app as application
bootstrap(application, {
    'db_host': settings.DB_HOST,
    'db_name': settings.DB_NAME,
    'db_user': settings.DB_USER,
    'db_pass': settings.DB_PASS,
    'base_dir': settings.BASE_DIR,
    'media_dir': settings.MEDIA_DIR,
    'thumb_dir': settings.THUMB_DIR,
    'upload_dir': settings.UPLOAD_DIR,
    'convert_ipc': settings.CONVERT_IPC,
    'fb_cache': settings.TELEMETRY_CACHE
})
