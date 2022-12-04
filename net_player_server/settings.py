import os

SERVER_PORT = 80

BASE_DIR   = os.path.abspath(os.path.dirname(__file__))
MEDIA_DIR  = '/var/dsserver/media'
THUMB_DIR  = '/var/dsserver/thumb'
UPLOAD_DIR = '/var/dsserver/upload'
PROCESSED_DIR = '/var/dsserver/temp'
PACKAGES_DIR = os.path.join(BASE_DIR, 'dist')

TELEMETRY_CACHE = os.path.join(BASE_DIR, 'tcache.db')

DB_HOST = 'localhost'
DB_USER = 'dsserver'
DB_PASS = 'dsserver'
DB_NAME = 'dsserver-testing'

FFMPEG_PATH = '/usr/bin/ffmpeg'

CONVERT_IPC = "tcp://127.0.0.1:13570"
