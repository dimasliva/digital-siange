from collections import deque
import os
import sys
import ctypes  # windows-only
from json import loads, dumps
from functools import reduce
from time import time as unixtime
from random import getrandbits
from bsddb3 import db as berkeley
import uuid
import typing
# import base64
import time
import random
import binascii
from zlib import adler32
from hashlib import md5
# from subprocess import check_output
# from settings import TELEMETRY_CACHE

# helper function

REQ_POLICY_OVERRIDE = 'override'  # Override request if there is request with same method
REQ_POLICY_APPEND = 'append'  # Append request if there is request with same method
REQ_POLICY_CURRENT = 'current'  # Leave current request if there is PENDING request with same method

EXTENSIONS_VIDEO = ('.mp4', '.mkv', '.mpg', '.wmv', '.flv', '.mp2', '.webm', '.avi')
EXTENSIONS_IMAGE = ('.png', '.jpg', '.jpeg')
EXTENSIONS_DOCS = ('.doc', '.docx', '.odt', '.ppt', '.pptx', '.rtf', '.xls', '.xlsx', '.pps', '.ppsx')
EXTENSIONS_PDF = ('.pdf',)

def has_key(obj, path):
    keys = path.split('.')
    _obj = obj
    while len(keys) > 0:
        key = keys.pop(0)
        if _obj is None or not key in _obj:
            return False
        _obj = _obj[key]
    return True


def backport_tasks(tasks):
    """convert tasks to v1 format
    """
    result = []
    for t in tasks:
        current = [t['method'], t['resource']]
        if t['schedule'] is not None:
            current.append(['{hour}:{minute}'.format(**x) for x in t['schedule']])
        result.append(current)
    return result


def safeget(dictionary, key, default):
    return dictionary[key] if key in dictionary else default


__id = 'REUwNThCOUEtMUFEOC0yNTE0LTkzNDAtMkM0RDU0NTQ3REQw'
try:

    class AuthorizationError(Exception):

        def __init__(self):
            # possible to add journalizing
            super().__init__(self)

        def response(self):
            return {'status': 'fail', 'reason': 'Authorization error'}

    class Authorization:

        def __init__(self, db):
            self.db = db

        @staticmethod
        def init(db):
            """создание таблиц отвечающих за хранение данных авторизации
            """
            db.execute('''
            CREATE TABLE IF NOT EXISTS `users` (
                `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
                `username` VARCHAR(255),
                `password` VARCHAR(255),
                `group` INTEGER,
                `staff` TINYINT(1) NOT NULL DEFAULT 0
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `sessions` (
                `id` VARCHAR(20),
                `user` INTEGER
            )
            ''')
            db.execute('''
            SELECT `id` FROM `users`
            ''')
            if db.fetchone() is None:
                db.execute('''
                INSERT INTO `users`(`id`, `username`, `password`, `group`, `staff`)
                VALUES(1, "admin", "equirectangular", 1, 1)
                ''')
            return True

        def sign_in(self, user_id):
            db = self.db
            token = '{:08X}-{:08X}'.format(int(unixtime()), getrandbits(32))
            db.execute('''
            INSERT INTO
            sessions(user, id)
            VALUES
            (%s, %s)
            ''', (user_id, token))
            return token

        def sign_out(self, token):
            db = self.db
            db.execute('''
            DELETE FROM
            sessions
            WHERE id = %s
            ''', (token,))
            return True

        def fetch_one(self, username, password):
            db = self.db
            db.execute('''
            SELECT id
            FROM users
            WHERE username = %s
            AND BINARY password = %s
            ''', (username, password))
            result = db.fetchone()
            return {'id': result['id'], 'name': username} if result else None

        def fetch_all(self):
            db = self.db
            db.execute('''
            SELECT `id`, `username`, `group`
            FROM `users`
            ORDER BY `username` ASC
            ''')
            users = db.fetchall()
            return [{'id': u['id'], 'username': u['username'], 'group': u['group']} for u in users]

        def has_permissions(self, user_id, token):
            """проверка прав пользователя
            """
            db = self.db
            db.execute('''
            SELECT U.id as uid, U.username as name, A.permissions as perms
            FROM sessions S
            JOIN users U
            ON S.user = U.id
            LEFT JOIN accessgroups A
            ON U.group = A.id
            WHERE S.id = %s
            AND U.username = %s
            ''', (token, user_id))
            result = db.fetchone()
            if result:
                return {
                    'id': result['uid'],
                    'name': result['name'],
                    'perms': [] if result['perms'] is None else result['perms'].split(',')
                }
            return None

        def is_empty(self):
            db = self.db
            db.execute('''
            SELECT id
            FROM users
            ''')
            result = db.fetchone()
            return result is None

        def register(self, username, password, staff=False):
            db = self.db
            db.execute('''
            INSERT INTO users(username, password, staff)
            VALUES (%s, %s, %s)
            ''', (username, password, 1 if staff else 0))
            return True

        def set_password(self, user_id, password):
            db = self.db
            db.execute('''
            UPDATE users
            SET password = %s
            WHERE id = %s
            ''', (password, user_id))
            return True

        def set_group(self, user_id, group_id):
            db = self.db
            db.execute('''
            UPDATE `users`
            SET `group` = %s
            WHERE `id` = %s
            ''', (group_id, user_id))
            return True

        def update(self, user_id, name, group, password=None):
            db = self.db
            db.execute('''
            UPDATE `users`
            SET `username` = %s,
            `group` = %s
            WHERE `id` = %s
            ''', (name, group, user_id))
            if password is not None:
                self.set_password(user_id, password)
            return True

        def remove(self, user_id):
            db = self.db
            db.execute('''
            DELETE FROM users
            WHERE id = %s
            ''', (user_id,))
            return True

    class AccessGroups:

        def __init__(self, db):
            self.db = db

        @staticmethod
        def init(db):
            db.execute('''
            CREATE TABLE IF NOT EXISTS `accessgroups` (
                `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(50) NOT NULL,
                `permissions` VARCHAR(200) NOT NULL
            )
            ''')
            db.execute('''
            SELECT `id` FROM `accessgroups`
            ''')
            if db.fetchone() is None:
                db.execute('''
                INSERT INTO `accessgroups`(`id`, `name`, `permissions`)
                VALUES(1, "Administrators", "upload,admin")
                ''')
            return True

        def create(self, name, permissions):
            db = self.db
            db.execute('''
            INSERT INTO `accessgroups`(`name`, `permissions`)
            VALUES(%s, %s)
            ''', (name, ','.join(permissions)))
            return db.lastrowid

        def fetch_all(self):
            db = self.db
            db.execute('''
            SELECT `id`, `name`, `permissions`
            FROM `accessgroups`
            ''')
            return db.fetchall()

        def fetch_info(self, group_id):
            db = self.db
            db.execute('''
            SELECT `id`, `name`, `permissions`
            FROM `accessgroups`
            WHERE `id` = %s
            ''', (group_id,))
            return db.fetchall()

        def fetch_members(self, group_id):
            db = self.db
            db.execute('''
            SELECT `id`, `username`, `staff`
            FROM `users`
            WHERE `group` = %s
            ''', (group_id,))
            return db.fetchall()

        def update(self, group_id, permissions):
            db = self.db
            db.execute('''
            UPDATE `accessgroups`
            SET `permissions` = %s
            WHERE `id` = %s
            ''', (','.join(permissions), group_id))

        def remove(self, group_id):
            db = self.db
            db.execute('''
            DELETE FROM `accessgroups`
            WHERE `id` = %s
            ''', (group_id,))
            return True

        def grant(self, group_id, permission):
            db = self.db
            db.execute('''
            SELECT `permissions`
            FROM `accessgroups`
            WHERE `id` = %s
            ''', (group_id,))
            result = db.fetchall()
            if result is None:
                return False
            permissions = set(result['permissions'].split(','))
            permissions.add(permission)
            db.execute('''
            UPDATE `accessgroups`
            SET `permissions` = %s
            WHERE `id` = %s
            ''', (','.join(permissions), group_id))
            return True

        def revoke(self, group_id, permission):
            db = self.db
            db.execute('''
            SELECT `permissions`
            FROM `accessgroups`
            WHERE `id` = %s
            ''', (group_id,))
            result = db.fetchall()
            if result is None:
                return False
            permissions = set(result['permissions'].split(','))
            if permission in permissions:
                permissions.remove(permission)
            db.execute('''
            UPDATE `accessgroups`
            SET `permissions` = %s
            WHERE `id` = %s
            ''', (','.join(permissions), group_id))
            return True

    class Schedules:

        def __init__(self, user, db):
            self.db = db
            self.user = user

        @staticmethod
        def init(db):
            """создание таблиц с данными о расписаниях
            """
            db.execute('''
            CREATE TABLE IF NOT EXISTS `schedules` (
                `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(100),
                `schedule` TEXT,
                `compiled_schedule` TEXT,
                `required_space` BIGINT,
                `accessed` INTEGER,
                `modified` INTEGER,
                `hash` BINARY(16) NOT NULL,
                `user` INTEGER
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `parameters` (
                `player_id` VARCHAR(100),
                `parameter` VARCHAR(200),
                `value` TEXT
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `linked_folders` (
                `folder_id` CHAR(36) NOT NULL,
                `schedule_id` INTEGER NOT NULL
            )
            ''')
            return True

        def fetch_all(self):
            """получить список всех расписаний
            """
            db = self.db
            retval = []
            db.execute('''
            SELECT id, name, modified
            FROM schedules
            WHERE user = %s
            ORDER BY name ASC
            ''', (self.user,))
            result = db.fetchall()
            for row in result:
                retval.append({
                    'id': row['id'],
                    'name': row['name'],
                    'lastmod': row['modified']
                })
            return retval

        def fetch_one(self, schedule_id):
            """получить расписание
            """
            db = self.db
            db.execute('''
            SELECT name, schedule, compiled_schedule, required_space, hash
            FROM schedules
            WHERE id = %s
            AND user = %s
            ''', (schedule_id, self.user))
            result = db.fetchone()
            return {
                'name': result['name'],
                'hash': binascii.hexlify(result['hash']).decode('ascii'),
                'schedule': loads(result['schedule']),
                'compiled_schedule': loads(result['compiled_schedule']),
                'required_space': result['required_space']
            } if result else None

        def is_exist(self, schedule_id):
            """проверка на существования расписания
            """
            db = self.db
            db.execute('''
            SELECT schedule
            FROM schedules
            WHERE id = %s
            AND user = %s
            ''', (schedule_id, self.user))
            result = db.fetchone()
            return True if result else False

        def calculate_space(self, configuration):
            db = self.db
            files = []
            for item in configuration:
                if item['method'] in ('play', 'slideshow'):
                    for mediafile in item['resource']:
                        files.append(mediafile)
            if len(files) < 1:
                return 0
            db.execute('''
            SELECT sum(size) as total
            FROM files
            WHERE id in ({})
            '''.format(', '.join(['"' + id_ + '"' for id_ in files ])))
            result = db.fetchone()
            if result and result['total']:
                return int(result['total'])
            return 0

        def create(self, name, configuration):
            """создать расписание
            """
            db = self.db
            timestamp = int(time.time())
            config_json = dumps(configuration)
            compiled_configuration, required_space = self.expand_configuration(configuration)
            db.execute('''
            INSERT INTO
            schedules(name, schedule, compiled_schedule, accessed, modified, required_space, user, hash)
            VALUES
            (%s, %s, %s, 0, %s, %s, %s, %s)
            ''', (
                name,
                config_json,
                dumps(compiled_configuration),
                timestamp,
                required_space,
                self.user,
                md5((config_json + str(time.time())).encode('ascii')).digest()
            ))
            return db.lastrowid
        
        def expand_configuration(self, configuration):
            db = self.db
            folders = [] # references folders
            files = [] # references files
            files_in_folders = {} # key - folder_id, value - file_id
            total_size = 0
            for task in configuration:
                if isinstance(task['resource'], list):
                    for item in task['resource']:
                        if item['folder']:
                            folders.append(item['id'])
                        else:
                            files.append(item['id'])
            if files:
                db.execute('''
                SELECT sum(size) as total
                FROM files
                WHERE id in ({})
                '''.format(', '.join(['"' + id_ + '"' for id_ in files ])))
                result = db.fetchone()
                if result and result['total']:
                    total_size += int(result['total'])
            if folders:
                db.execute('''
                SELECT id, folder, size
                FROM files
                WHERE folder in ({})
                '''.format(', '.join(['"' + id_ + '"' for id_ in folders ])))
                for row in db.fetchall():
                    total_size += row['size']
                    if row['folder'] in files_in_folders:
                        files_in_folders[row['folder']].append(row['id'])
                    else:
                        files_in_folders[row['folder']] = [row['id']]
            #
            # expanding folders
            #
            for task in configuration:
                if isinstance(task['resource'], list):
                    if task['method'] == 'play':
                        allowed_extensions = EXTENSIONS_VIDEO
                    elif task['method'] == 'slideshow':
                        allowed_extensions = EXTENSIONS_IMAGE
                    elif task['method'] == 'doc':
                        allowed_extensions = EXTENSIONS_PDF + EXTENSIONS_DOCS
                    expanded_resources = []
                    for item in task['resource']:
                        if item['folder']:
                            if item['id'] in files_in_folders:
                                # TODO: filter by type
                                expanded_resources.extend(filter(
                                    lambda x: os.path.splitext(x)[1] in allowed_extensions,
                                    files_in_folders[item['id']]
                                ))
                        else:
                            expanded_resources.append(item['id'])
                    task['resource'] = expanded_resources
            return (configuration, total_size)


        def update_new(self, schedule_id, configuration=None):
            db = self.db
            # NOTE: если метод вызван без нового расписания,
            # значит обновились файлы и надо "пересобрать" расписание
            if configuration is None:
                db.execute('SELECT schedule FROM schedules WHERE id = %s', (schedule_id, ))
                result = db.fetchone()
                if result is None:
                    raise ValueError('Missing schedule {}. Something terrific occured.'.format(schedule_id))
                configuration = loads(result['schedule'])
            else:
                new_linked_folders = set([])
                for task in configuration:
                    if isinstance(task['resource'], list):
                        for item in task['resource']:
                            if item['folder']:
                                new_linked_folders.add(item['id'])
                db.execute('SELECT folder_id FROM linked_folders WHERE schedule_id = %s', (schedule_id, ))
                old_linked_folders = set([row['folder_id'] for row in db.fetchall()])
                #
                # update linked folders
                #
                folders_to_add = set(new_linked_folders - old_linked_folders)
                folders_to_del = set(old_linked_folders - new_linked_folders)
                if len(folders_to_add):
                    db.executemany('INSERT INTO linked_folders(folder_id, schedule_id) VALUES(%s, %s)', [
                        (folder_id, schedule_id)
                        for folder_id in folders_to_add
                    ])
                if len(folders_to_del):
                    db.executemany('DELETE FROM linked_folders WHERE folder_id = %s AND schedule_id = %s', [
                        (folder_id, schedule_id)
                        for folder_id in folders_to_del
                    ])
            # 
            # store in db
            #
            timestamp = int(time.time())
            # NOTE: ugly hack to avoid mutating configuration in expander function
            stored_configuration = dumps(configuration)
            raw_configuration, required_space = self.expand_configuration(configuration)
            print(raw_configuration)
            new_hash = md5((dumps(configuration) + str(time.time())).encode('ascii')).digest()
            db.execute('''
            UPDATE schedules
            SET schedule = %s,
            compiled_schedule = %s,
            modified = %s,
            required_space = %s,
            hash = %s
            WHERE id = %s
            AND user = %s
            ''', (
                stored_configuration,
                dumps(raw_configuration),
                timestamp,
                required_space,
                new_hash,
                schedule_id,
                self.user
            ))
            db.execute('''
            UPDATE players
            SET next_schedule = schedule, last_error_id = NULL
            WHERE schedule = %s
            ''', (schedule_id,))
            Protocol(db).batch_set_schedule(schedule_id, raw_configuration, required_space)
            return True

        def update(self, schedule_id, configuration):
            """изменить расписание
            """
            db = self.db
            timestamp = int(time.time())
            required_space = self.calculate_space(loads(configuration))
            new_hash = md5((configuration + str(time.time())).encode('ascii')).digest()
            db.execute('''
            UPDATE schedules
            SET schedule = %s,
            modified = %s,
            required_space = %s,
            hash = %s
            WHERE id = %s
            AND user = %s
            ''', (
                configuration,
                timestamp,
                required_space,
                new_hash,
                schedule_id,
                self.user
            ))
            # fix for resolve_request, otherwise both schedule and next_schedule become NULL
            db.execute('''
            UPDATE players
            SET next_schedule = schedule, last_error_id = NULL
            WHERE schedule = %s
            ''', (schedule_id,))
            Protocol(db).batch_set_schedule(schedule_id, loads(configuration), required_space)
            return True

        def delete(self, schedule_id):
            """удалить расписание
            """
            db = self.db
            db.execute('''
            DELETE
            FROM schedules
            WHERE id = %s
            AND user = %s
            ''', (schedule_id, self.user))
            return True

        def copy(self, schedule_id, copy_name):
            db = self.db
            db.execute('''
            INSERT INTO schedules(name, accessed, modified, schedule, compiled_schedule, required_space, user, hash)
            SELECT name, accessed, modified, schedule, compiled_schedule, required_space, user, hash
            FROM schedules
            WHERE id = %s
            ''', (schedule_id,))
            new_id = db.lastrowid
            db.execute('SELECT schedule FROM schedules WHERE id = %s', (schedule_id,))
            new_hash = md5((db.fetchone()['schedule'] + str(time.time())).encode('ascii')).digest()
            db.execute('''
            UPDATE schedules
            SET name = %s,
            hash = %s
            WHERE id = %s
            ''', (copy_name, new_hash, new_id))
            return True

        def rename(self, schedule_id, name):
            db = self.db
            db.execute('''
            UPDATE schedules
            SET name = %s
            WHERE id = %s
            ''', (name, schedule_id))
            return True

    class Players:

        def __init__(self, user=None, db=None, cache=None, screendump_dir=None):
            self.db = db
            self.cache = cache
            self.user = user
            self.screen_directory = screendump_dir

        @staticmethod
        def init(db):
            """создать таблицу плееров в БД
            """
            db.execute('''
            CREATE TABLE IF NOT EXISTS `players` (
                `id` VARCHAR(100) PRIMARY KEY,
                `name` VARCHAR(200),
                `schedule` VARCHAR(50),
                `next_schedule` VARCHAR(50),
                `last_error_id` VARCHAR(32),
                `accessed` INTEGER,
                `user` INTEGER,
                `tz_offset` INTEGER(3) NOT NULL DEFAULT 0
            )
            ''')
            return True

        def fetch_all(self):
            """получить список плееров
            """
            db = self.db
            if db is None:
                return []
            now = int(time.time())
            response = {
                'live': [],
                'deadline': [],
                'offline': []
            }
            db.execute('''
            SELECT
            P.id as id,
            P.name as name,
            P.schedule as schedule,
            S.name as scheduleName,
            P.accessed as accessed,
            P.next_schedule as next_schedule,
            P.last_error_id as last_error_id,
            P.tz_offset as tz_offset
            FROM players P
            LEFT JOIN schedules S ON S.id = P.schedule
            WHERE P.user = %s
            ORDER BY P.name ASC
            ''', (self.user,))
            result = db.fetchall()
            schedule_mod = Schedules(db=db, user=self.user)
            for row in result:
                next_schedule_name = None
                lastError = None
                diff = now - row['accessed']
                if diff > 1800:
                    status = 'offline'
                elif diff > 90:
                    status = 'deadline'
                else:
                    status = 'live'
                if row['next_schedule'] is not None:
                    next_schedule = schedule_mod.fetch_one(row['next_schedule'])
                    next_schedule_name = next_schedule['name'] if next_schedule is not None else '-'
                if row['last_error_id'] is not None:
                    lastError = Protocol(db=db).get_error(row['last_error_id'])
                    # ultimatively ugly way of doing this
                    # convert to more terse error object
                    if has_key(lastError, 'request.attributes.schedule_id'):
                        schedule = schedule_mod.fetch_one(lastError['request']['attributes']['schedule_id'])
                        lastError['request']['scheduleName'] = schedule['name'] if schedule is not None else lastError['request']['attributes']['schedule_id']
                response[status].append({
                    'id': row['id'],
                    'name': row['name'],
                    'group': row['schedule'],
                    'next': row['next_schedule'],
                    'scheduleName': row['scheduleName'],
                    'nextScheduleName': next_schedule_name,
                    'lastError': lastError,
                    'lastacc': row['accessed'],
                    'status': status
                })
            return response['live'] + response['deadline'] + response['offline']

        def fetch_all_assigned(self):
            """получить список плееров
            """
            db = self.db
            if db is None:
                return []
            retval = []
            db.execute('''
            SELECT P.id, P.name, P.user, U.username
            FROM players P
            LEFT JOIN users U ON U.id = P.user
            ORDER BY id ASC
            ''')
            result = db.fetchall()
            for row in result:
                retval.append({
                    'id': row['id'],
                    'name': row['name'],
                    'userid': row['user'],
                    'username': row['username']
                })
            return retval

        def number_of(self):
            """
            """
            db = self.db
            if db is None:
                return 1000
            # TODO: keep limit for user in SaaS scenario
            db.execute('''
            SELECT COUNT(id) AS playerscount
            FROM players
            ''')
            result = db.fetchone()
            return int(result['playerscount']) if result else 0

        def fetch_one(self, player_id):
            """получить сведения о плеере
            """
            db = self.db
            if db is None:
                return None
            db.execute('''
            SELECT
                P.id,
                P.name,
                P.schedule as schedule_id,
                S.name as schedule,
                P.accessed,
                P.tz_offset,
                P.next_schedule as next_schedule,
                NS.name as next_name
            FROM players P
            LEFT JOIN schedules S
            ON P.schedule = S.id
            LEFT JOIN schedules NS
            ON P.next_schedule = NS.id
            WHERE P.id = %s
            AND P.user = %s
            ''', (player_id, self.user))
            db_result = db.fetchone()
            cache = berkeley.DB()
            cache.open(self.cache, None, berkeley.DB_HASH, berkeley.DB_CREATE)
            player_info = cache.get('info:{}'.format(player_id).encode('utf-8'))
            player_screen = cache.get('screenshot:{}'.format(player_id).encode('utf-8'))
            if player_screen is None:
                screenshot_info = { 'updated': None }
            else:
                screenshot_info = loads(player_screen)
            cache.close()
            return {
                'id': db_result['id'],
                'name': db_result['name'],
                'group': db_result['schedule'],
                'schedule_id': db_result['schedule_id'],
                'next_schedule_id': db_result['next_schedule'],
                'lastacc': db_result['accessed'],
                'stats': {} if player_info is None else loads(player_info.decode('utf-8')),
                'screenshot_time': screenshot_info['updated'],
                'tz_offset': db_result['tz_offset']
            }

        def assign_to_user(self, player_id, user_id):
            db = self.db
            if db is None:
                return False
            db.execute('''
            UPDATE players
            SET user = %s
            WHERE id = %s
            ''', (user_id, player_id))
            return True

        def register(self, player_id, payload):
            """зарегистрировать плеер
            """
            db = self.db
            if db is None:
                return False
            timestamp = int(time.time())
            db.execute('''
            SELECT id
            FROM users
            WHERE staff != 0
            ''')
            admin = db.fetchone()
            if admin is not None:
                admin = admin['id']
            else:
                admin = 1
            db.execute('''
            INSERT INTO
            players(`id`, `name`, `schedule`, `next_schedule`, `accessed`, `user`)
            VALUES (%s, %s, %s, %s, %s, %s)
            ''', (player_id, payload['name'], 1, None, timestamp, admin))
            return True

        def forget(self, player_id):
            """убрать плеер из БД
            """
            db = self.db
            db.execute('DELETE FROM players WHERE id = %s', (player_id,))
            return True

        def update(self, player_id, payload):
            """обновить данные о плеере
            """
            db = self.db
            if db is None:
                return False
            timestamp = int(time.time())
            # WARNING: workaround for set_name flow
            db.execute('SELECT receiver FROM requests WHERE receiver = %s AND method = "set_name"', (player_id,))
            if db.fetchone() is not None:
                db.execute('''
                UPDATE players
                SET accessed = %s,
                name = %s
                WHERE id = %s
                ''', (timestamp, payload['name'], player_id))
            else:
                db.execute('''
                UPDATE players
                SET accessed = %s
                WHERE id = %s
                ''', (timestamp, player_id))
            return True

        def push_telemetry(self, player_id, payload):
            """добавить запись телеметрии
            """
            timestamp = int(time.time())
            cache = berkeley.DB()
            cache.open(self.cache, None, berkeley.DB_HASH, berkeley.DB_CREATE)
            cache.put(
                'info:{}'.format(player_id).encode('utf-8'),
                dumps({
                    'timestamp': timestamp,
                    'cpu': safeget(payload, 'cpu', 0),
                    'ram': safeget(payload, 'ram', 0),
                    'temperature': safeget(payload, 'temperature', 0),
                    'process_executable': safeget(payload, 'process', 'n/a'),
                    'process_status': safeget(payload, 'status', 'n/a'),
                    'poll_time': safeget(payload, 'polltime', 1),
                    'ip_address': safeget(payload, 'ip', '127.0.0.1')
                }).encode('utf-8')
            )
            cache.close()
            return None

        def is_exist(self, player_id):
            """проверка регистрации плеера
            """
            db = self.db
            if db is None:
                return False
            if player_id is None:
                return False
            db.execute('''
            SELECT id
            FROM players
            WHERE id = %s
            ''', (player_id,))
            result = db.fetchone()
            return True if result else False

        def set_schedule(self, player_id, schedule_id):
            """установить расписание для плеера
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            UPDATE players
            SET next_schedule = %s, last_error_id = NULL
            WHERE id = %s
            AND user = %s
            ''', (schedule_id, player_id, self.user))
            schedule = Schedules(self.user, db).fetch_one(schedule_id)
            db.execute('SELECT tz_offset FROM players WHERE id = %s', (player_id,))
            result = db.fetchone()
            timezone_offset = result['tz_offset']
            Protocol(db).add_request(player_id, 'set_schedule', [dict(
                requiredSpace=schedule['required_space'],
                # hash=schedule['hash'],
                tasks=schedule['compiled_schedule']
            ), timezone_offset], {'schedule_id': schedule_id})
            return True

        def rename(self, player_id, new_name):
            """установить расписание для плеера
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            UPDATE players
            SET name = %s
            WHERE id = %s
            AND user = %s
            ''', (new_name, player_id, self.user))
            return True

        def get_schedule(self, player_id):
            """получить расписание для плеера
            """
            db = self.db
            db.execute('''
            SELECT S.id, S.schedule, S.compiled_schedule, S.required_space, S.modified, S.hash
            FROM schedules S
            JOIN players P
            ON P.schedule = S.id
            WHERE P.id = %s
            AND S.user = P.user
            ''', (player_id,))
            result = db.fetchone()
            if result:
                return {
                    'id': result['id'],
                    'hash': binascii.hexlify(result['hash']).decode('ascii'),
                    'schedule': loads(result['compiled_schedule']),
                    'required_space': result['required_space']
                }
            else:
                return None

        def resend_schedule(self, player_id):
            """установить расписание для плеера
            """
            db = self.db
            if db is None:
                return False
            player_schedule = self.get_schedule(player_id)
            if player_schedule is not None:
                db.execute('SELECT tz_offset FROM players WHERE id = %s', (player_id,))
                result = db.fetchone()
                timezone_offset = result['tz_offset']
                request_sent = Protocol(db).add_request(player_id, 'set_schedule', [dict(
                    requiredSpace=player_schedule['required_space'],
                    # hash=schedule['hash'],
                    tasks=player_schedule['schedule']
                ), timezone_offset], {'schedule_id': player_schedule['id']}, REQ_POLICY_CURRENT)
                if request_sent:
                    db.execute('''
                    UPDATE players
                    SET next_schedule = %s, last_error_id = NULL
                    WHERE id = %s
                    ''', (player_schedule['id'], player_id))
            else:
                player_schedule = {
                    'id': 0,
                    'required_space': 0,
                    'schedule': []
                }
            return True

        def get_schedule_old(self, player_id, schedule):
            """get_schedule совместимый со старым контроллером и протоколом
            """
            db = self.db
            db.execute('''
            SELECT S.schedule, S.modified
            FROM schedules S
            JOIN players P
            ON P.schedule = S.id
            WHERE P.id = %s
            AND S.user = P.user
            ''', (player_id,))
            result = db.fetchone()
            if result:
                if str(result['modified']) == str(schedule):
                    return (False, None)
                retval = {
                    'timestamp': result['modified'],
                    'config': backport_tasks(loads(result['schedule']))
                }
            else:
                retval = {
                    'timestamp': 0,
                    'config': []
                }
            return (True, retval)

        def set_group(self, player_id, group_id):
            """прикрепить плеер к группе
            """
            if group_id == 0:
                return False
            db = self.db
            if db is None:
                return False
            db.execute('''
            INSERT INTO
            playerbindings(`player`, `group`)
            VALUES
            (%s, %s)
            ''', (player_id, group_id))
            return True

        def unset_group(self, player_id, group_id):
            """открепить плеер от группы
            """
            if group_id == 0:
                return False
            db = self.db
            if db is None:
                return False
            db.execute('''
            DELETE
            FROM `playerbindings`
            WHERE `player` = %s
            AND `group` = %s
            ''', (player_id, group_id))
            return True

        def set_tz_offset(self, player_id, offset):
            db = self.db
            db.execute('UPDATE `players` SET `tz_offset` = %s  WHERE `id` = %s', (offset, player_id))
            return True

        def set_param(self, player_id, parameter, value):
            db = self.db
            if self.get_param(player_id, parameter):
                db.execute('''
                UPDATE `parameters`
                SET `value` = %s
                WHERE `parameter` = %s AND `player_id` = %s
                ''', (value, parameter, player_id))
            else:
                db.execute('''
                INSERT INTO `parameters`(`player_id`, `parameter`, `value`)
                VALUES(%s, %s, %s)
                ''', (player_id, parameter, value))
            return True

        def get_param(self, player_id, parameter):
            db = self.db
            db.execute('''
            SELECT `value`
            FROM `parameters`
            WHERE `player_id` = %s AND `parameter` = %s
            ''', (player_id, parameter))
            result = db.fetchone()
            if result:
                return result['value']
            else:
                return None

        def params(self, player_id):
            db = self.db
            db.execute('''
            SELECT `parameter`, `value`
            FROM `parameters`
            WHERE `player_id` = %s
            ''', (player_id,))
            result = db.fetchall()
            if result:
                return dict([(row['parameter'], row['value']) for row in result])
            else:
                return None

        def errors(self, player_id):
            db = self.db
            db.execute('''
            SELECT `error`, `timestamp`
            FROM `errors`
            WHERE `sender` = %s
            ''', (player_id,))
            return db.fetchall()

        def submit_screenshot(self, player_id, screenshot_file):
            screenshot_location = os.path.join(self.screen_directory, player_id + '.png')
            screenshot_file.save(screenshot_location, overwrite=True)
            cache = berkeley.DB()
            cache.open(self.cache, None, berkeley.DB_HASH, berkeley.DB_CREATE)
            cache.put(
                'screenshot:{}'.format(player_id).encode('utf-8'),
                dumps({
                    'updated': int(time.time()),
                    'filename': screenshot_location
                }).encode('utf-8')
            )
            cache.close()
            return None

    class PlayerGroups:

        def __init__(self, user, db):
            self.db = db
            self.user = user

        @staticmethod
        def init(db):
            """method docstring
            """
            db.execute('''
            CREATE TABLE IF NOT EXISTS `groups` (
                `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(200),
                `user` INTEGER
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `playerbindings` (
                `id` INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
                `player` VARCHAR(200),
                `group` INTEGER
            )
            ''')
            return True

        def fetch_all(self):
            """получить список групп
            """
            db = self.db
            db.execute('''
            SELECT
            `id` as `id`,
            `name` as `name`
            FROM groups
            WHERE user = %s
            ORDER BY `name` ASC
            ''', (self.user,))
            groups = db.fetchall()
            db.execute('''
            SELECT
            P.`id` as `id`,
            P.`name` as `name`,
            B.`group` as `group`
            FROM playerbindings B
            JOIN players P ON P.id = B.player
            WHERE P.user = %s
            ''', (self.user,))
            bindings = db.fetchall()
            db.execute('''
            SELECT id, name
            FROM players
            WHERE user = %s
            ''', (self.user,))
            all_players = db.fetchall()
            retval = [{'id': 0, 'name': 'Все', 'players': all_players}]
            for g in groups:
                retval.append({
                'id': g['id'],
                'name': g['name'],
                'players': [x for x in list(filter(lambda x: (x['group'] == g['id']), list(bindings)))]
                })
            return retval

        def create(self, group_id):
            """создать группу
            """
            db = self.db
            db.execute('''
            INSERT INTO
            groups(name, user)
            VALUES
            (%s, %s)
            ''', (group_id, self.user))
            return db.lastrowid

        def delete(self, group_id):
            """удалить группу
            """
            db = self.db
            if group_id == 0:
                return False
            db.execute('''
            DELETE
            FROM `playerbindings`
            WHERE `group` = %s
            ''', (group_id,))
            db.execute('''
            DELETE
            FROM `groups`
            WHERE `id` = %s
            AND `user` = %s
            ''', (group_id, self.user))
            return True

        def set_schedule(self, group_id, schedule_id):
            """установить расписание для устройств группы
            """
            db = self.db
            schedule = Schedules(self.user, db).fetch_one(schedule_id)
            if group_id == 0:
                db.execute('''
                UPDATE players
                SET next_schedule = %s, last_error_id = NULL
                WHERE user = %s
                ''', (schedule_id, self.user))
            else:
                db.execute('''
                UPDATE players P
                JOIN playerbindings B ON `B`.`player` = `P`.`id`
                JOIN groups G ON `G`.`id` = `B`.`group`
                SET `P`.`next_schedule` = %s, `P`.`last_error_id` = NULL
                WHERE `G`.`id` = %s
                AND `G`.`user` = %s
                ''', (schedule_id, group_id, self.user))
            Protocol(db, user=self.user).batch_set_schedule_by_group(group_id, schedule_id, schedule['compiled_schedule'], schedule['required_space'])
            return True

    class Files:

        def __init__(self, user=None, location=None, db=None):
            self.location = location
            self.user = user
            self.db = db

        @staticmethod
        def init(db):
            """method docstring
            """
            db.execute('''
            CREATE TABLE IF NOT EXISTS `files` (
                `id` VARCHAR(255) NOT NULL,
                `name` VARCHAR(200) NOT NULL,
                `size` BIGINT NOT NULL DEFAULT 0,
                `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                `folder` CHAR(36) DEFAULT NULL,
                `user` INTEGER NOT NULL
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `folders` (
                `id` CHAR(36) NOT NULL,
                `name` VARCHAR(200) NOT NULL,
                `user` INTEGER NOT NULL,
                `folder` CHAR(36) DEFAULT NULL
            )
            ''')
            return True

        def get_name(self, file_id):
            db = self.db
            if db is None:
                return None
            db.execute('''
            SELECT name
            FROM files
            WHERE id = %s
            ''', (file_id,))
            result = db.fetchone()
            return result['name'] if result is not None else file_id
        
        def get_names(self, file_ids: list):
            db = self.db
            if db is None:
                return None
            where_in_clause = ', '.join(['"{}"'.format(id) for id in file_ids])
            db.execute('''
            SELECT id, name
            FROM files
            WHERE id IN ({})
            '''.format(where_in_clause))
            names_map = {}
            for row in db.fetchall():
                names_map[row['id']] = row['name']
            return [names_map[item] if item in names_map else item for item in file_ids]

        def is_exist(self, file_id):
            """проверка на существования расписания
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            SELECT id
            FROM files
            WHERE id = %s
            ''', (file_id,))
            result = db.fetchone()
            return True if result else False
        
        def is_folder_accessible(self, folder_id):
            """проверка на существования расписания
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            SELECT id
            FROM folders
            WHERE id = %s
            AND user = %s
            ''', (folder_id, self.user))
            result = db.fetchone()
            return True if result else False
        
        def is_folder_with_name_exist(self, name, user):
            """проверка на существования расписания
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            SELECT id
            FROM folders
            WHERE name = %s
            AND user = %s
            AND folder IS NULL
            ''', (name, user))
            result = db.fetchone()
            return True if result else False

        def update_size(self, filename):
            db = self.db
            if db is None:
                return None
            size = os.path.getsize(os.path.join(self.location, filename))
            db.execute('UPDATE files SET size = %s WHERE id = %s', (size, filename))
            # NOTE: предполагаем, что эта функция вызывается, когда файл готов
            # и надо триггернуть изменения связанные с папками
            db.execute('''
            SELECT linked_folders.schedule_id AS schedule_id
            FROM linked_folders
            JOIN folders ON linked_folders.folder_id = folders.id
            JOIN files ON files.folder = folders.id
            WHERE files.id = %s
            ''', (filename, ))
            affected_schedules = [row['schedule_id'] for row in db.fetchall()]
            for schedule_id in affected_schedules:
                Schedules(self.user, db).update_new(schedule_id)
            return True

        def create(self, filename, parent_folder=None):
            db = self.db
            if db is None:
                return None
            _, ext = os.path.splitext(filename.lower())
            if ext.lower() in ('.mp4', '.mkv', '.mpg', '.wmv', '.flv', '.mp2', '.webm', '.avi'):
                ext = '.mp4'
            elif ext.lower() in ('.doc', '.docx', '.odt', '.ppt', '.pptx', '.rtf', '.xls', '.xlsx', '.pps', '.ppsx'):
                ext = '.pdf'
            new_name = '{:04x}{:04x}{:08x}{:08x}{}'.format(
                random.randrange(0xFFFF),
                self.user,
                adler32(filename.encode('utf-8')),
                int(time.time()),
                ext
            )
            if not self.is_exist(new_name):
                db.execute('''
                INSERT INTO files(id, name, user, folder)
                VALUES(%s, %s, %s, %s)
                ''', (new_name, filename, self.user, parent_folder))
            return new_name
        
        def rename(self, file_id, name):
            db = self.db
            if db is None:
                return None
            if self.is_exist(file_id):
                db.execute('''
                UPDATE files
                SET name = %s
                WHERE id = %s
                AND user = %s
                ''', (name, file_id, self.user))
                return True
            return False
        
        def create_folder(self, name, parent_folder=None):
            db = self.db
            if db is None:
                return None
            if parent_folder is None and not self.is_folder_with_name_exist(name, self.user):
                folder_id = str(uuid.uuid4())
                db.execute('''
                INSERT INTO folders(id, name, user, folder)
                VALUES(%s, %s, %s, %s)
                ''', (folder_id, name, self.user, parent_folder))
                return True
            return False
        
        def rename_folder(self, folder_id, name):
            db = self.db
            if db is None:
                return None
            if self.is_folder_accessible(folder_id):
                db.execute('''
                UPDATE folders
                SET name = %s
                WHERE id = %s
                ''', (name, folder_id))
                return True
            return False
        
        def delete_folder(self, folder_id):
            db = self.db
            if db is None:
                return None
            if self.is_folder_accessible(folder_id):
                folders = []
                q = deque([folder_id])
                while len(q):
                    folder = q.popleft()
                    folders.append(folder)
                    db.execute('''
                    SELECT id FROM folders WHERE folder = %s
                    ''', (folder, ))
                    result = db.fetchall()
                    q.extend([row['id'] for row in result])
                where_in_clause = ', '.join(['"{}"'.format(id) for id in folders])
                db.execute('''
                SELECT id FROM files
                WHERE folder IN ({})
                '''.format(where_in_clause))
                files_to_delete = [row['id'] for row in db.fetchall()]
                for file_id in files_to_delete:
                    if os.path.exists(os.path.join(self.location, file_id)):
                        os.remove(os.path.join(self.location, file_id))
                # TODO: remove thumbnails
                db.execute('''
                DELETE FROM folders
                WHERE id IN ({})
                '''.format(where_in_clause))
                db.execute('''
                DELETE FROM files
                WHERE folder IN ({})
                '''.format(where_in_clause))
                db.execute('''
                SELECT schedule_id
                FROM linked_folders
                WHERE folder_id IN ({})
                '''.format(where_in_clause))
                print(where_in_clause)
                for row in db.fetchall():
                    print(row)
                    Schedules(self.user, db).update_new(row['schedule_id'])
                db.execute('DELETE FROM linked_folders WHERE folder_id IN ({})'.format(where_in_clause))
                return True
            return False
        
        def fetch_folder_contents(self, folder=None):
            db = self.db
            if db is None:
                return None
            if folder is None:
                db.execute('''
                SELECT id, name
                FROM folders
                WHERE folder IS NULL
                AND user = %s
                ORDER BY name ASC
                ''', (self.user, ))
                folders = db.fetchall()
                db.execute('''
                SELECT id, name, size, DATE_FORMAT(uploaded_at, "%%Y-%%m-%%d %%H:%%M:%%S")
                FROM files
                WHERE folder IS NULL
                AND user = %s
                ORDER BY name ASC
                ''', (self.user, ))
                files = db.fetchall()
            else:
                db.execute('''
                SELECT id, name
                FROM folders
                WHERE folder = %s
                AND user = %s
                ORDER BY name ASC
                ''', (folder, self.user))
                folders = db.fetchall()
                db.execute('''
                SELECT id, name, size, DATE_FORMAT(uploaded_at, "%%Y-%%m-%%d %%H:%%M:%%S") date
                FROM files
                WHERE folder = %s
                AND user = %s
                ORDER BY name ASC
                ''', (folder, self.user))
                files = db.fetchall()
            return list([{ **item, 'isFolder': True } for item in folders]) + \
                   [{**item, 'isFolder': False} for item in filter(lambda x: os.path.exists(os.path.join(self.location, x['id'])), files)]

        def fetch_all(self):
            """получить список файлов
            """
            db = self.db
            if db is None:
                return []
            db.execute('''
            SELECT id, name, folder
            FROM folders
            WHERE user = %s
            ORDER BY name ASC
            ''', (self.user, ))
            folders = db.fetchall()
            db.execute('''
            SELECT id, name, size, folder, DATE_FORMAT(uploaded_at, "%%Y-%%m-%%d %%H:%%M:%%S") date
            FROM files
            WHERE user = %s
            ORDER BY name ASC
            ''', (self.user,))
            files = db.fetchall()
            return list([{ **item, 'isFolder': True } for item in folders]) + \
                   [{**item, 'isFolder': False} for item in filter(lambda x: os.path.exists(os.path.join(self.location, x['id'])), files)]

        def delete(self, file_id):
            """удалить файл
            """
            db = self.db
            if db is None:
                return False
            db.execute('''
            SELECT linked_folders.schedule_id AS schedule_id
            FROM linked_folders
            JOIN folders ON linked_folders.folder_id = folders.id
            JOIN files ON files.folder = folders.id
            WHERE files.id = %s
            ''', (file_id, ))
            affected_schedules = [row['schedule_id'] for row in db.fetchall()]
            db.execute('''
            DELETE FROM files
            WHERE id = %s
            AND user = %s
            ''', (file_id, self.user))
            # обновляем расписание, если файл был в папке из расписания
            for schedule_id in affected_schedules:
                Schedules(self.user, db).update_new(schedule_id)
            if os.path.exists(os.path.join(self.location, file_id)):
                os.remove(os.path.join(self.location, file_id))
                return True
            else:
                return False
        
        def delete_multiple(self, files):
            db = self.db
            if db is None:
                return False
            where_in_clause = ', '.join(['"{}"'.format(id) for id in files])
            # получаем файлы, которые действительно принадлежат пользователю
            db.execute('SELECT id FROM files WHERE user = %s AND id IN ({})'.format(where_in_clause), (self.user, ))
            files_to_delete = [row['id'] for row in db.fetchall()]
            # получаем зависимые расписания
            db.execute('''
            SELECT linked_folders.schedule_id AS schedule_id
            FROM linked_folders
            JOIN folders ON linked_folders.folder_id = folders.id
            JOIN files ON files.folder = folders.id
            WHERE files.id IN ({}) AND files.user = %s
            '''.format(where_in_clause), (self.user, ))
            affected_schedules = [row['schedule_id'] for row in db.fetchall()]
            db.execute('DELETE FROM files WHERE user = %s AND id IN ({})'.format(where_in_clause), (self.user, ))
            for schedule_id in affected_schedules:
                Schedules(self.user, db).update_new(schedule_id)
            for file_id in files_to_delete:
                if os.path.exists(os.path.join(self.location, file_id)):
                    os.remove(os.path.join(self.location, file_id))
            return True

        def move_multiple(self, files, folder):
            db = self.db
            if db is None:
                return False
            where_in_clause = ', '.join(['"{}"'.format(id) for id in files])
            # получаем зависимые расписания
            db.execute('''
            SELECT linked_folders.schedule_id AS schedule_id
            FROM linked_folders
            JOIN folders ON linked_folders.folder_id = folders.id
            JOIN files ON files.folder = folders.id
            WHERE (files.id IN ({}) AND files.user = %s) OR (linked_folders.folder_id = %s)
            '''.format(where_in_clause), (self.user, folder))
            affected_schedules = [row['schedule_id'] for row in db.fetchall()]
            db.execute('''
            UPDATE files
            SET folder = %s
            WHERE id IN ({}) AND user = %s
            '''.format(where_in_clause), (folder, self.user))
            for schedule_id in affected_schedules:
                Schedules(self.user, db).update_new(schedule_id)
            return True

        def usage(self):
            """получить сведения о использовании диска
            """
            videosize = reduce(
                lambda res, x: res + x,
                [os.path.getsize(os.path.join(self.location, f)) for f in os.listdir(os.path.join(self.location))],
                0
            )
            if os.name == 'nt':
                _, total, free = ctypes.c_ulonglong(), ctypes.c_ulonglong(), ctypes.c_ulonglong()
                fun = ctypes.windll.kernel32.GetDiskFreeSpaceExW
                ret = fun(self.location, ctypes.byref(_), ctypes.byref(total), ctypes.byref(free))
                if ret == 0:
                    raise ctypes.WinError()
                return {
                    'free': free.value,
                    'total': total.value,
                    'media': videosize
                }
            elif os.name == 'posix':
                statvfs = os.statvfs(self.location)
                return {
                    'free': statvfs.f_frsize * statvfs.f_bavail,
                    'total': statvfs.f_frsize * statvfs.f_blocks,
                    'media': videosize
                }
            else:
                return {
                    'free': 0,
                    'total': videosize,
                    'media': videosize
                }

        @staticmethod
        def escape(filename):
            """экранировать символы юникода
            """
            return filename.encode('unicode-escape').decode('utf-8')

        @staticmethod
        def unescape(filename):
            """разэкранировать символы юникода
            """
            return filename.encode('utf-8').decode('unicode-escape')

    class Protocol():

        def __init__(self, db, user=None):
            self.db = db
            self.user = user

        @staticmethod
        def init(db):
            db.execute('''
            CREATE TABLE IF NOT EXISTS `requests` (
                `id` VARCHAR(50) NOT NULL PRIMARY KEY,
                `receiver` VARCHAR(100) NOT NULL,
                `method` VARCHAR(100),
                `params` TEXT,
                `attributes` TEXT,
                `status` INTEGER NOT NULL DEFAULT 0,
                `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            db.execute('''
            CREATE TABLE IF NOT EXISTS `errors` (
                `id` VARCHAR(36) PRIMARY KEY NOT NULL,
                `source` VARCHAR(36),
                `sender` VARCHAR(100) NOT NULL,
                `error` TEXT,
                `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')

        def add_request(self, receiver: str, method: str, params: typing.List[str], attributes=None, resolution_policy=REQ_POLICY_OVERRIDE) -> str:
            db = self.db
            db.execute('''
            SELECT id, status FROM requests
            WHERE receiver = %s AND method = %s
            ''', (receiver, method))
            result = db.fetchone()
            if result:
                if resolution_policy == REQ_POLICY_CURRENT and result['status'] == 0:
                    return None
                if resolution_policy != REQ_POLICY_APPEND:
                    db.execute('DELETE FROM requests WHERE id = %s', (result['id'],))
            req_id = uuid.uuid4().hex
            db.execute('''
            INSERT INTO requests(id, receiver, method, params, attributes)
            VALUES (%s, %s, %s, %s, %s)
            ''', (req_id, receiver, method, dumps(params), dumps(attributes)))
            return req_id

        def batch_request(self, receivers: typing.List[str], method: str, params: typing.List[str], attributes=None) -> typing.List[str]:
            request_ids = []
            for receiver in receivers:
                request_ids.append(self.add_request(receiver, method, params, attributes))
            return request_ids

        def batch_request_by_schedule(self, schedule_id: str, method: str, params: typing.List[str], attributes=None) -> typing.List[str]:
            db = self.db
            request_ids = []
            db.execute('''
            SELECT `id`
            FROM `players`
            WHERE `schedule` = %s
            ''', (schedule_id,))
            for row in db.fetchall():
                request_ids.append(self.add_request(row['id'], method, params, attributes))
            return request_ids

        def batch_set_schedule(self, schedule_id: str, tasks, required_space):
            db = self.db
            request_ids = []
            db.execute('''
            SELECT `id`, `tz_offset`
            FROM `players`
            WHERE `schedule` = %s
            ''', (schedule_id,))
            for row in db.fetchall():
                request_ids.append(self.add_request(
                    row['id'],
                    'set_schedule',
                    [
                        {
                            'requiredSpace': required_space,
                            'tasks': tasks
                        },
                        row['tz_offset']
                    ],
                    {"schedule_id": schedule_id}
                ))
            return request_ids

        def batch_set_schedule_by_group(self, group_id: str, schedule_id: str, tasks, required_space):
            db = self.db
            request_ids = []
            if group_id != 0:
                db.execute('''
                SELECT B.player, P.tz_offset
                FROM `playerbindings` B
                JOIN `players` P ON B.player = P.id
                WHERE `group` = %s
                ''', (group_id,))
            else:
                db.execute('''
                SELECT `id` as `player`, `tz_offset`
                FROM `players`
                WHERE `user` = %s
                ''', (self.user,))
            for row in db.fetchall():
                request_ids.append(self.add_request(
                    row['player'],
                    'set_schedule',
                    [
                        {
                            'requiredSpace': required_space,
                            'tasks': tasks
                        },
                        row['tz_offset']
                    ],
                    {"schedule_id": schedule_id}
                ))
            return request_ids

        def batch_request_by_group(self, group_id: str, method: str, params: typing.List[str], attributes=None) -> typing.List[str]:
            db = self.db
            request_ids = []
            if group_id != 0:
                db.execute('''
                SELECT `player`
                FROM `playerbindings`
                WHERE `group` = %s
                ''', (group_id,))
            else:
                db.execute('''
                SELECT `id` as `player`
                FROM `players`
                WHERE `user` = %s
                ''', (self.user,))
            for row in db.fetchall():
                request_ids.append(self.add_request(row['player'], method, params, attributes))
            return request_ids

        def add_error(self, error: dict, message_id: int, sender: typing.Optional[str]=None) -> str:
            db = self.db
            error_id = uuid.uuid4().hex
            if sender is not None:
                db.execute('''
                INSERT INTO errors(id, source, sender, error)
                VALUES (%s, %s, %s, %s)
                ''', (error_id, message_id, sender, dumps(error)))
            else:
                db.execute('''
                INSERT INTO errors(source, sender, error, id)
                SELECT id, receiver, %s, %s
                FROM requests WHERE id = %s
                ''', (dumps(error), error_id, message_id))
            return error_id

        def get_error(self, error_id):
            db = self.db
            db.execute('''
            SELECT
            errors.sender,
            errors.error,
            requests.method,
            requests.params,
            requests.status,
            requests.attributes
            FROM errors
            LEFT JOIN requests ON errors.source = requests.id
            WHERE errors.id = %s
            ''', (error_id,))
            result = db.fetchone()
            if result:
                return {
                    'player_id': result['sender'],
                    'error': loads(result['error']),
                    'request': {
                        'method': result['method'],
                        'params': loads(result['params']),
                        'status': result['status'],
                        'attributes': loads(result['attributes']) if result['attributes'] is not None else None
                    } if result['method'] is not None else None
                }
            else:
                return None

        def resolve_request(self, req_id: str) -> None:
            db = self.db
            # TODO: implement resolution logic
            db.execute('SELECT method, receiver, params FROM requests WHERE id = %s', (req_id,))
            result = db.fetchone()
            if result:
                if result['method'] == 'set_schedule':
                    # TODO: checking schedule hashes would be nice
                    # do not update if next is NULL as it occur on get_schedule
                    db.execute('''
                    UPDATE players
                    SET schedule = next_schedule,
                    next_schedule = NULL,
                    last_error_id = NULL
                    WHERE id = %s
                    AND next_schedule IS NOT NULL''', (result['receiver'],))

            db.execute('UPDATE requests SET status = 1 WHERE id = %s', (req_id,))

        def rejected_request(self, error: dict, request_id: typing.Optional[str]=None, sender: typing.Optional[str]=None) -> str:
            db = self.db
            db.execute('SELECT method, receiver, params, attributes FROM requests WHERE id = %s', (request_id,))
            result = db.fetchone()
            error_id = self.add_error(error, request_id, sender)
            if result:
                if result['method'] == 'set_schedule':
                    # TODO: checking schedule hashes would be nice
                    db.execute('UPDATE players SET next_schedule = NULL, last_error_id = %s WHERE id = %s', (error_id, result['receiver']))
            if request_id is not None:
                db.execute('UPDATE requests SET status = 2 WHERE id = %s', (request_id,))
            return error_id

        def get_player_requests(self, device_id: str) -> typing.List[typing.Any]:
            db = self.db
            retval = []
            db.execute('''
            SELECT id, method, params FROM requests
            WHERE receiver = %s AND status = 0
            ''', (device_id,))
            for row in db.fetchall():
                retval.append({'id': row['id'], 'method': row['method'], 'params': loads(row['params'])})
            return retval

        def get_requests(self, player_id, method):
            db = self.db
            retval = []
            db.execute('''
            SELECT id, params, status, timestamp FROM requests
            WHERE receiver = %s and method = %s
            ORDER BY timestamp DESC
            ''', (player_id, method))
            for row in db.fetchall():
                retval.append({'id': row['id'], 'params': loads(row['params']), 'status': row['status'], 'timestamp': row['timestamp'].isoformat()})
            return retval

        def delete_request(self, request_id):
            db = self.db
            db.execute('DELETE FROM requests WHERE id = %s', (request_id,))
            return True

        def delete_completed_requests(self, player_id, method):
            db = self.db
            db.execute('DELETE FROM requests WHERE receiver = %s and method = %s and status != 0', (player_id, method))
            return True

except:
    print('Failed to import', str(sys.exc_info()[1]))
