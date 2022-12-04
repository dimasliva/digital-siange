# cython: always_allow_keywords=True
# pylint: disable=no-member, unsubscriptable-object
# basic imports
import os
import sys
import time
from json import dumps, loads, load as jsonload
import threading
import subprocess
from traceback import format_exc
from shutil import copyfile, move as movefile
import socket
import re
import random
from fnmatch import fnmatch
from base64 import b64decode
from hashlib import md5
# auxilliary
import MySQLdb
from PIL import Image
# web framework
from bottle import Bottle, TEMPLATE_PATH, jinja2_template as template, request, redirect, response, BaseRequest, HTTPResponse
import bottle_mysql
# app-related
import settings
# core datamodel
import datalayer
# distribution module
from distlayer import Repository

DEFAULT_SCREENSHOT_TIMEOUT = 60

__id = 'REUwNThCOUEtMUFEOC0yNTE0LTkzNDAtMkM0RDU0NTQ3REQw'
BaseRequest.MEMFILE_MAX = 1024 * 1024
try:
    app = Bottle()
except:
    print('Failed to import', str(sys.exc_info()[1]))

# -- helpers


def is_user_allowed(req, db, permission=None):
    user = req.get_cookie("user")
    # if as_user != None and user != as_user:
    #    return None
    sess = req.get_cookie("session_id")
    auth = datalayer.Authorization(db)
    userdata = {
                    'id': 1,
                    'name': 'admin',
                    'perms': ['admin', 'upload']
                } # auth.has_permissions(user, sess)
    if userdata is None:
        return None
    if (permission is not None) and (permission not in userdata['perms']):
        userdata['forbidden'] = True
        return userdata
    return userdata


def lazy_telemetry(player_id, payload, cache):
    datalayer.Players(
        cache=cache
    ).push_telemetry(player_id, payload)


def generic_exception_response():
    response.status = 400
    return dumps({'status': 'fail', 'reason': 'Server error: {}'.format(format_exc())})


def safe_client_response():
    return HTTPResponse(dumps({'status': 'fail', 'reason': 'Server error: {}'.format(format_exc())}), status=500)


def humanize_size(x):
    if x > 1024 * 1024 * 1024:
        return str(int(x / 1024 / 1024 / 1024)) + 'G'
    elif x > 1024 * 1024:
        return str(int(x / 1024 / 1024)) + 'M'
    elif x > 1024:
        return str(int(x / 1024)) + 'K'
    else:
        return x


def localized(basedir):

    def f(key):
        base = jsonload(open(os.path.join(basedir, 'locale.json'), encoding='utf-8'))
        if key in base:
            return base[key]
        else:
            return key

    return f


def api_endpoint(permissions=None):

    def closure(callback):

        # essential to explicitly use db in args
        def wrapper(db, *args, **kwargs):
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
            try:
                user = is_user_allowed(request, db, permissions)
                if user is None or 'forbidden' in user:
                    raise datalayer.AuthorizationError()
                kwargs['user'] = user['id']
                body = callback(db, *args, **kwargs)
                return dumps(body)
            except datalayer.AuthorizationError as e:
                return dumps(e.response())
            except Exception as e:
                return generic_exception_response()

        return wrapper

    return closure


def internal_api(callback):

    def wrapper(db, *args, **kwargs):
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        if not request.remote_addr in ('127.0.0.1', '::1'):
            response.status = 403
            return dumps({'status': 'fail'})
        body = callback(db, *args, **kwargs)
        return dumps(body)

    return wrapper

# -- client endpoints


@app.route('/endpoint', method=['POST'])
def device_request(db):
    try:
        batch = []
        player_id = None
        proto = datalayer.Protocol(db)
        req = loads(request.body.read().decode('utf-8'))
        for msg in req:
            if msg.get('method', None) == 'health_report':
                player_id = msg['params'][0]['id']
                break
        for call in req:
            if not 'method' in call:  # response
                if 'error' in call and call['error'] is not None:
                    proto.rejected_request(call['error'], call['id'], player_id)
                proto.resolve_request(call['id'])
            elif not 'id' in call:  # notification
                if call['method'] == 'health_report':
                    player_id = call['params'][0]['id']
                    player_name = call['params'][0]['name']
                    player = datalayer.Players(db=db)
                    if player.is_exist(player_id):
                        player.update(player_id, {
                            'name': player_name,
                            'ip': request.remote_addr
                        })
                    else:
                        player.register(player_id, {
                            'name': player_name,
                            'ip': request.remote_addr
                        })
                    report = call['params'][0]
                    # update params
                    if 'volume' in report:
                        player.set_param(player_id, 'volume', report['volume'])
                    # update telemetry
                    report['ip'] = request.remote_addr
                    lazy_telemetry_thread = threading.Thread(
                        target=lazy_telemetry,
                        args=(player_id, report, request.app.config['ds.fb_cache'])
                    )

                    # lazy_telemetry_thread = threading.Thread(
                    #    target=lazy_telemetry,
                    #    args=(player_id, parsed_feedback, request.app.config['ds.fb_cache'])
                    # )
                    lazy_telemetry_thread.start()
                elif call['method'] == 'failure':
                    proto.add_error(call['params'][0], None, player_id)
                elif call['method'] == 'get_schedule':
                    datalayer.Players(None, db).resend_schedule(call['params'][0])
                elif call['method'] == 'get_params':
                    params = datalayer.Players(None, db).params(player_id)
                    if params is None:
                        continue
                    elif 'headline' in params:
                        proto.add_request(player_id, 'set_headline', [params['headline']])
                    elif 'volume' in params:
                        proto.add_request(player_id, 'set_volume', [params.get('volume', 100)])
                    # append here
                else:  # request
                    if call['method'] == 'failure':
                        proto.add_error(call['params'][0], None, player_id)
                        batch.append({
                            'id': call['id'],
                            'result': True,
                            'error': None
                        })
        batch += proto.get_player_requests(player_id)
        # batch.append({'method': 'set_time', 'params': [int(time.time())]})
        return dumps(batch)
    except Exception as e:
        return safe_client_response()


@app.route('/data_submit', method=['POST'])
def device_media_submit(db):
    player_id = request.forms.get('client_id')
    action = request.forms.get('action')
    if action == 'send_image':
        screenshot_file = request.files.get('screenshot')
        if not fnmatch(screenshot_file.filename.lower(), '*.png'):
            return dumps({
                'status': 'rejected',
                'reason': 'Wrong filename - {}'.format(screenshot_file.name)
            })
        try:
            players = datalayer.Players(db=db, cache=request.app.config['ds.fb_cache'], screendump_dir=request.app.config['ds.thumb_dir'])
            timeout = players.get_param(player_id, 'screenshot_period') or DEFAULT_SCREENSHOT_TIMEOUT
            players.submit_screenshot(player_id, screenshot_file)
            return dumps({
                'status': 'uploaded',
                'timeout': timeout
            })
        except:
            return dumps({
                'status': 'rejected',
                'reason': 'Failed to store screenshot',
                # 'debug': format_exc()
            })
    return dumps({
        'status': 'failed',
        'reason': 'Unknown action type',
        # 'player_id': player_id,
        # 'action': action
    })

# -- old endpoint api


@app.route('/get', method=['POST'])
def netplayer_request(db):
    try:
        player_id = request.json.get('id')
        player_name = request.json.get('name')
        schedule = request.json.get('schedule')
        telemetry = request.json.get('telemetry')
        current_time = int(time.time())

        players = datalayer.Players(db=db)
        if players.is_exist(player_id):
            players.update(player_id, {
                'name': player_name,
                'ip': request.remote_addr
            })
        else:
            if players.number_of() < 1000:
                players.register(player_id, {
                    'name': player_name,
                    'ip': request.remote_addr
                })
        parsed_feedback = loads(telemetry)
        parsed_feedback['ip'] = request.remote_addr
        lazy_telemetry_thread = threading.Thread(
            target=lazy_telemetry,
            args=(player_id, parsed_feedback, request.app.config['ds.fb_cache'])
        )
        lazy_telemetry_thread.start()
        changed, tasks = players.get_schedule_old(player_id, schedule)
        if changed is True:
            tasks['synctime'] = current_time
            return HTTPResponse(
                status=200,
                body=dumps(tasks),
                headers={'Content-Type': 'application/json'}
            )
        else:
            return HTTPResponse(
                status=204,
                body=dumps(dict(synctime=current_time)),
                headers={'Content-Type': 'application/json'}
            )
    except Exception as e:
        return safe_client_response()


@app.post('/getsubs')
def deprecated_subs_endpoint(db):
    pass


@app.post('/getstate')
def deprecated_state_endpoint(db):
    player_id = request.forms.get('id')
    hash_prefix = request.forms.get('prefix')
    # query_results = request.forms.get('results')
    ctx = datalayer.Players(db=db).params(player_id)
    if ctx is None:
        return dumps({
            'data': {},
            'hash': '00000000'
        })
    ctx_hash = md5(dumps(ctx).encode('utf-8')).hexdigest()[:8]
    if ctx_hash == hash_prefix:
        return HTTPResponse(status=204, body='')
    else:
        return dumps({
            'data': ctx,
            'hash': ctx_hash
        })

# -- api


@app.route('/api/schedules/list')
@api_endpoint()
def api_schedules_list(db, user):
    result = datalayer.Schedules(user, db).fetch_all()
    return {'status': 'ok', 'result': result}


@app.route('/api/schedules/read', method='POST')
@api_endpoint()
def api_schedules_read(db, user):
    req = request.json
    schedule = datalayer.Schedules(user, db)
    if schedule.is_exist(req['schedule']):
        return {'status': 'ok', 'data': schedule.fetch_one(req['schedule'])}
    else:
        return {'status': 'error'}


@app.route('/api/schedules/create', method='POST')
@api_endpoint()
def api_schedules_create(db, user):
    req = request.json
    schedule = datalayer.Schedules(user, db)
    schedule_id = schedule.create(req['name'], [])
    return {'status': 'ok', 'data': schedule_id}


@app.route('/api/schedules/copy', method='POST')
@api_endpoint()
def api_schedules_copy(db, user):
    req = request.json
    datalayer.Schedules(user, db).copy(req['schedule'], req['copy_name'])
    return {'status': 'ok'}


@app.route('/api/schedules/rename', method='POST')
@api_endpoint()
def api_schedules_rename(db, user):
    req = request.json
    datalayer.Schedules(user, db).rename(req['schedule'], req['name'])
    return {'status': 'ok'}


@app.route('/api/schedules/write', method='POST')
@api_endpoint()
def api_schedules_write(db, user):
    req = request.json
    schedule = datalayer.Schedules(user, db)
    if schedule.is_exist(req['schedule']):
        schedule.update(req['schedule'], req['config'])
    else:
        schedule.create(loads(req['schedule']), req['config'])
    return {'status':'ok'}

@app.route('/api/schedules/save', method='POST')
@api_endpoint()
def api_schedules_save(db, user):
    req = request.json
    schedule = datalayer.Schedules(user, db)
    if schedule.is_exist(req['id']):
        schedule.update_new(req['id'], req['description'])
    else:
        schedule.create(loads(req['id']), req['description'])
    return {'status':'ok'}

@app.route('/api/schedules/remove', method='POST')
@api_endpoint()
def api_schedules_remove(db, user):
    req = request.json
    datalayer.Schedules(user, db).delete(req['schedule'])
    return {'status': 'ok'}


@app.route('/api/files/list')
@api_endpoint()
def api_files_list(db, user):
    response.content_type = 'application/json'
    folder = request.query.get('folder', None)
    return {'status': 'ok', 'result': datalayer.Files(user, request.app.config['ds.media_dir'], db).fetch_folder_contents(folder)}

@app.route('/api/files/list_all')
@api_endpoint()
def api_files_list_all(db, user):
    response.content_type = 'application/json'
    return {'status': 'ok', 'result': datalayer.Files(user, request.app.config['ds.media_dir'], db).fetch_all()}


@app.route('/api/files/upload', method='POST')
@api_endpoint('upload')
def api_files_upload(db, user):
    import zmq
    folder = request.forms.get('folder')
    uploads = request.files.getall('upfile')
    convert_missing = False
    socket_regex = re.compile(r'tcp://([\.\d]+):(\d+)')
    parsed_addr = socket_regex.match(request.app.config['ds.convert_ipc'])
    try:
        if parsed_addr is not None:
            test_sock = socket.socket()
            test_sock.connect((parsed_addr.group(1), int(parsed_addr.group(2))))
    except socket.error:
        convert_missing = True
    finally:
        test_sock.close()
    files_model = datalayer.Files(user, request.app.config['ds.media_dir'], db)
    for uploadfile in uploads:
        fname = files_model.create(uploadfile.raw_filename, folder)
        if fname is None:
            fname = uploadfile.raw_filename
        ext = os.path.splitext(uploadfile.raw_filename)[1]
        if ext.lower() in datalayer.EXTENSIONS_IMAGE:
            uploadfile.save(os.path.join(request.app.config['ds.media_dir'], fname), True)
            files_model.update_size(fname)
            content = 'image'
            # processing pics
            try:
                im = Image.open(os.path.join(request.app.config['ds.media_dir'], fname))
                im.thumbnail((160, 90))
                im.save(os.path.join(request.app.config['ds.thumb_dir'], fname + '.jpg'), 'JPEG')
            except IOError:
                print("Cannot process pic")
        elif ext.lower() in datalayer.EXTENSIONS_DOCS:
            upload_name = os.path.join(request.app.config['ds.upload_dir'], '{:08x}{}'.format(random.getrandbits(32), ext))
            interim_name = upload_name[0:upload_name.rfind('.')] + '.pdf'
            result_name = os.path.join(request.app.config['ds.media_dir'], fname)
            uploadfile.save(upload_name, True)
            old_home = os.environ.get('HOME')
            os.environ['HOME'] = '/tmp'
            subprocess.call([
                '/usr/bin/libreoffice', '--headless',
                '--convert-to', 'pdf', upload_name,
                '--outdir', request.app.config['ds.upload_dir']
            ])
            if old_home:
                os.environ['HOME'] = old_home
            movefile(interim_name, result_name)
            os.remove(upload_name)
            content = 'document'
        elif ext.lower() in datalayer.EXTENSIONS_PDF:
            uploadfile.save(os.path.join(request.app.config['ds.media_dir'], fname), True)
            files_model.update_size(fname)
            content = 'document'
        elif ext.lower() in datalayer.EXTENSIONS_VIDEO:
            uploadfile.save(os.path.join(request.app.config['ds.upload_dir'], fname))
            if not convert_missing:
                try:
                    ctx = zmq.Context()
                    sock = ctx.socket(zmq.REQ)
                    sock.connect(request.app.config['ds.convert_ipc'])
                    sock.send(dumps({'method': 'convert', 'filename': fname, 'user': user}).encode('utf-8'))
                    reply = sock.recv()
                except zmq.ZMQError:
                    sys.stderr.write('Error')
                    sys.stderr.flush()
                    convert_missing = True
                finally:
                    sock.close()
            if convert_missing:
                copyfile(os.path.join(request.app.config['ds.upload_dir'], fname), os.path.join(request.app.config['ds.media_dir'], fname))
                files_model.update_size(fname)
            upload_size = os.path.getsize(os.path.join(request.app.config['ds.upload_dir'], fname))
            args = [settings.FFMPEG_PATH, '-ss', '00:00:05' if upload_size > 1e6 else '00:00:02', '-y', '-i', os.path.join(request.app.config['ds.upload_dir'], fname), '-vf', 'scale=160:90', '-frames:v', '1', os.path.join(request.app.config['ds.thumb_dir'], fname + '.jpg')]
            subprocess.call(args)
            content = 'video'
        else:
            content = 'wrong'
    return {'status': 'ok' if content != 'wrong' else 'fail', 'content': content}

@app.route('/api/files/makedir', method='POST')
@api_endpoint()
def api_files_makedir(db, user):
    name = request.json['name']
    parent = request.json['parent']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).create_folder(name, parent):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/rename', method='POST')
@api_endpoint()
def api_files_rename(db, user):
    name = request.json['name']
    file_id = request.json['id']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).rename(file_id, name):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/renamedir', method='POST')
@api_endpoint()
def api_files_renamedir(db, user):
    name = request.json['name']
    folder_id = request.json['id']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).rename_folder(folder_id, name):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/removedir', method='POST')
@api_endpoint()
def api_files_removedir(db, user):
    folder_id = request.json['id']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).delete_folder(folder_id):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/del', method='POST')
@api_endpoint()
def api_files_remove(db, user):
    filename = request.json['filename']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).delete(filename):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/delete_multiple', method='POST')
@api_endpoint()
def api_files_remove_multiple(db, user):
    files = request.json['files']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).delete_multiple(files):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/move_multiple', method='POST')
@api_endpoint()
def api_files_move_multiple(db, user):
    files = request.json['files']
    target_folder = request.json['folder']
    if datalayer.Files(user, request.app.config['ds.media_dir'], db).move_multiple(files, target_folder):
        return {'status': 'ok'}
    else:
        return {'status': 'error'}

@app.route('/api/files/status')
@api_endpoint()
def api_files_status(db, user):
    import zmq
    ctx = zmq.Context()
    sock = ctx.socket(zmq.REQ)
    sock.connect(request.app.config['ds.convert_ipc'])
    sock.send(dumps({'method': 'progress-details', 'user': user}).encode('utf-8'))
    reply = loads(sock.recv().decode('utf-8'))
    sock.close()
    names = []
    if len(reply['data']) > 0:
        names = datalayer.Files(user, request.app.config['ds.media_dir'], db).get_names([ item[0] for item in reply['data'] ])
    return {'status': 'ok', 'data': [(names[index], job[1]) for index, job in enumerate(reply['data'])]}


@app.route('/api/files/usage')
@api_endpoint()
def api_files_usage(db, user):
    return datalayer.Files(user, request.app.config['ds.media_dir']).usage()


@app.route('/api/files/conversion_done', method='POST')
@internal_api
def api_conversion_done(db):
    req = request.json
    datalayer.Files(None, request.app.config['ds.media_dir'], db).update_size(req['filename'])
    return {'status': 'ok'}


@app.route('/api/players/list')
@api_endpoint()
def api_players_list(db, user):
    result = datalayer.Players(user, db).fetch_all()
    return {'status': 'ok', 'result': result}


@app.route('/api/players/assign', method='POST')
@api_endpoint()
def api_players_setschedule(db, user):
    req = request.json
    datalayer.Players(user, db).set_schedule(req['player'], req['group'])
    return {'status': 'ok'}


@app.route('/api/players/rename', method='POST')
@api_endpoint()
def api_players_rename(db, user):
    req = request.json
    datalayer.Players(user, db).rename(req['player'], req['name'])
    datalayer.Protocol(db).add_request(req['player'], 'set_name', [req['name']])
    return {'status': 'ok'}


@app.route('/api/players/remotecmd', method='POST')
@api_endpoint(permissions='admin')
def api_players_remote_cmd_post(db, user):
    req = request.json
    datalayer.Protocol(db).add_request(req['player'], 'ec', [req['command']], resolution_policy=datalayer.REQ_POLICY_APPEND)
    return {'status': 'ok'}


@app.route('/api/players/remotecmd/list', method='POST')
@api_endpoint(permissions='admin')
def api_players_remote_cmd_list(db, user):
    req = request.json
    requests = datalayer.Protocol(db).get_requests(req['player'], 'ec')
    return {'status': 'ok', 'data': requests}


@app.route('/api/players/remotecmd/delete', method='POST')
@api_endpoint(permissions='admin')
def api_players_remote_cmd_delete(db, user):
    req = request.json
    datalayer.Protocol(db).delete_request(req['requestId'])
    return {'status': 'ok'}


@app.route('/api/players/remotecmd/clear', method='POST')
@api_endpoint(permissions='admin')
def api_players_remote_cmd_clear_history(db, user):
    req = request.json
    datalayer.Protocol(db).delete_completed_requests(req['player'], 'ec')
    return {'status': 'ok'}


@app.route('/api/players/set_timezone', method='POST')
@api_endpoint()
def api_players_set_timezone(db, user):
    req = request.json
    players = datalayer.Players(user, db)
    players.set_tz_offset(req['player'], req['tzOffset'])
    players.resend_schedule(req['player'])
    return {'status': 'ok'}


@app.route('/api/players/<player_id>/status')
@api_endpoint()
def api_players_status(db, player_id, user):
    # req = request.json
    result = datalayer.Players(user, db, cache=request.app.config['ds.fb_cache']).fetch_one(player_id)
    return {'status': 'ok', 'data': result}


@app.route('/api/groups/list')
@api_endpoint()
def api_groups_list(db, user):
    result = datalayer.PlayerGroups(user, db).fetch_all()
    return {'status': 'ok', 'result': result}


@app.route('/api/groups/create', method='POST')
@api_endpoint()
def api_groups_create(db, user):
    # TODO: check if exists
    req = request.json
    group_id = datalayer.PlayerGroups(user, db).create(req['name'])
    return {'status': 'ok', 'result': group_id}


@app.route('/api/groups/assign', method='POST')
@api_endpoint()
def api_groups_setschedule(db, user):
    req = request.json
    datalayer.PlayerGroups(user, db).set_schedule(req['group'], req['schedule'])
    return {'status': 'ok', 'result': 'Done'}


@app.route('/api/groups/include', method='POST')
@api_endpoint()
def api_groups_include(db, user):
    req = request.json
    # TODO: check if exists
    datalayer.Players(user, db).set_group(req['player'], req['group'])
    return {'status': 'ok'}


@app.route('/api/groups/exclude', method='POST')
@api_endpoint()
def api_groups_exclude(db, user):
    req = request.json
    # TODO: check if exists
    datalayer.Players(user, db).unset_group(req['player'], req['group'])
    return {'status': 'ok'}


@app.route('/api/groups/remove', method='POST')
@api_endpoint()
def api_groups_remove(db, user):
    req = request.json
    # TODO: check if exists
    datalayer.PlayerGroups(user, db).delete(req['group'])
    return {'status': 'ok', 'result': 'Done'}


@app.route('/api/users/list')
@api_endpoint(permissions='admin')
def api_users_list(db, user):
    result = datalayer.Authorization(db).fetch_all()
    return {'status': 'ok', 'result': result}


@app.route('/api/users/players')
@api_endpoint(permissions='admin')
def api_players_all(db, user):
    result = datalayer.Players(None, db).fetch_all_assigned()
    return {'status': 'ok', 'result': result}


@app.route('/api/players/setuser', method='POST')
@api_endpoint(permissions='admin')
def api_players_setowner(db, user):
    # TODO: check if exists
    req = request.json
    datalayer.Players(None, db).assign_to_user(req['player'], req['user'])
    return {'status': 'ok'}


@app.route('/api/players/forget', method='POST')
@api_endpoint(permissions='admin')
def api_players_forget_player(db, user):
    # TODO: check if exists
    req = request.json
    datalayer.Players(None, db).forget(req['player'])
    return {'status': 'ok'}


@app.route('/api/users/create', method='POST')
@api_endpoint(permissions='admin')
def api_users_create(db, user):
    # TODO: check if exists
    req = request.json
    datalayer.Authorization(db).register(req['username'], req['password'])
    return {'status': 'ok'}


@app.route('/api/users/update', method='POST')
@api_endpoint(permissions='admin')
def api_users_update(db, user):
    # TODO: check if exists
    req = request.json
    datalayer.Authorization(db).update(req['id'], req['username'], req['group'], req['password'])
    return {'status': 'ok'}


@app.route('/api/users/remove', method='POST')
@api_endpoint(permissions='admin')
def api_users_remove(db, user):
    # TODO: check if exists
    req = request.json
    datalayer.Authorization(db).remove(req['id'])
    return {'status': 'ok'}


@app.route('/api/converter/stop', method='POST')
@api_endpoint(permissions='admin')
def api_converter_stop(db, user):
    # TODO: check if exists
    import zmq
    socket_regex = re.compile(r'tcp://([\.\d]+):(\d+)')
    parsed_addr = socket_regex.match(request.app.config['ds.convert_ipc'])
    try:
        if parsed_addr is not None:
            test_sock = socket.socket()
            test_sock.connect((parsed_addr.group(1), int(parsed_addr.group(2))))
    except socket.error:
        return {'status': 'fail'}
    finally:
        test_sock.close()
    try:
        ctx = zmq.Context()
        sock = ctx.socket(zmq.REQ)
        sock.connect(request.app.config['ds.convert_ipc'])
        sock.send(dumps({'method': 'stop'}).encode('utf-8'))
        reply = sock.recv()
    except zmq.ZMQError:
        return {'status': 'fail'}
    finally:
        sock.close()
    return {'status': 'ok'}


@app.get('/api/users/groups/list')
@api_endpoint('admin')
def admin_accessgroups_list(db, user):
    result = datalayer.AccessGroups(db).fetch_all()
    return {'status': 'ok', 'result': result}


@app.post('/api/users/groups/create')
@api_endpoint('admin')
def admin_accessgroups_add(db, user):
    req = request.json
    datalayer.AccessGroups(db).create(req['name'], ['upload'])
    return {'status': 'ok'}


@app.post('/api/users/groups/update')
@api_endpoint('admin')
def admin_accessgroups_update(db, user):
    req = request.json
    datalayer.AccessGroups(db).update(req['group'], req['permissions'])
    return {'status': 'ok'}


@app.post('/api/users/groups/remove')
@api_endpoint('admin')
def admin_accessgroups_remove(db, user):
    req = request.json
    datalayer.AccessGroups(db).remove(req['group'])
    return {'status': 'ok'}


@app.route('/api/users/assign')
@api_endpoint('admin')
def admin_accessgroups_assign(db):
    req = request.json
    datalayer.AccessGroups(db).assign(req['group'], req['user'])
    return {'status': 'ok'}


@app.get('/api/subs/list')
@api_endpoint()
def api_subs_list(db, user):
    result = []
    players = datalayer.Players(user, db)
    players_data = players.fetch_all()
    for player in players_data:
        headline = players.get_param(player['id'], 'headline')
        result.append({'id': player['id'], 'text': headline, 'name': player['name']})
    return {
        'status': 'ok',
        'result': result
    }


@app.post('/api/subs/update')
@api_endpoint()
def api_subs_update(db, user):
    req = request.json
    players = datalayer.Players(user, db)
    proto = datalayer.Protocol(db)
    players.set_param(req['player'], 'headline', req['content'])
    proto.add_request(req['player'], 'set_headline', [req['content']])
    return {'status': 'ok'}


@app.post('/api/subs/broadcast')
@api_endpoint()
def api_subs_broadcast(db, user):
    req = request.json
    players = datalayer.Players(user, db)
    proto = datalayer.Protocol(db)
    players_data = players.fetch_all()
    for player in players_data:
        players.set_param(player['id'], 'headline', req['content'])
        proto.add_request(player['id'], 'set_headline', [req['content']])
    return {'status': 'ok'}


@app.post('/api/subcontrols/get_state')
@api_endpoint()
def api_vars_getall(db, user):
    req = request.json
    result = datalayer.Players(user, db).params(req['id'])
    return {'status': 'ok', 'result': result}


@app.post('/api/subcontrols/set_volume')
@api_endpoint()
def api_players_setvolume(db, user):
    req = request.json
    players = datalayer.Players(user, db)
    proto = datalayer.Protocol(db)
    if req['volume'] < 0 or req['volume'] > 100:
        return {'status': 'fail'}
    players.set_param(req['id'], 'volume', req['volume'])
    proto.add_request(req['id'], 'set_volume', [req['volume']])
    return {'status': 'ok'}


@app.post('/api/subcontrols/set_param')
@api_endpoint()
def api_vars_setparam(db, user):
    req = request.json
    players = datalayer.Players(user, db)
    players.set_param(req['id'], req['param'], req['value'])
    return {'status': 'ok'}

# -- pages


def page_authorization(permissions=None):

    def closure(callback):

        def wrapper(db, *args, **kwargs):
            ctx = {
                'name': None,
                'auth': 'none'
            }
            user = is_user_allowed(request, db, permissions)
            if user:
                ctx['auth'] = 'partial' if ('forbidden' in user) else 'ok'
                ctx['name'] = user['name']
                ctx['id'] = user['id']
            kwargs['user'] = ctx
            return callback(db, *args, **kwargs)

        return wrapper

    return closure


@app.route('/login', method='POST')
def login(db):
    now = int(time.time())
    username = request.forms.get('user')
    password = request.forms.get('pass')
    auth = datalayer.Authorization(db)
    user = auth.fetch_one(username, password)
    if user is None:
        return redirect('/')
    token = auth.sign_in(int(user['id']))
    # db.commit()
    resp = HTTPResponse(status=303, headers={'location': '/'})
    resp.set_cookie("user", username, expires=(now + 3600 * 24 * 30))
    resp.set_cookie("session_id", token, expires=(now + 3600 * 24 * 30))
    return resp
    # return '''
    # <!doctype html><meta http-equiv='refresh' content='0; url=/' />
    # <span style='font-family: sans-serif'>Signing in...</span>
    # '''


@app.route('/logout')
def logout(db):
    token = request.get_cookie('session_id')
    datalayer.Authorization(db).sign_out(token)
    resp = HTTPResponse(status=303, headers={'location': '/'})
    resp.set_cookie("user", "", expires=0)
    resp.set_cookie("session_id", "", expires=0)
    return resp
    # return '''
    # <!doctype html><meta http-equiv='refresh' content='0; url=/' />
    # <span style='font-family: sans-serif'>Signing out...</span>
    # '''


@app.route('/')
@page_authorization()
def index_page(db, user):
    return template('players', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/content/')
@page_authorization('upload')
def content_page(db, user):
    return template('content', page='content', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/edit/<gid>/')
@page_authorization()
def schedule_editor_page(db, gid, user):
    if user['auth'] is not 'none':
        schedules = datalayer.Schedules(user['id'], db)
        if not schedules.is_exist(gid):
            schedules.create(gid, [])
    return template('editor', page='schedule', name=user['name'], auth=user['auth'], gid=gid, _=localized(request.app.config['ds.base_dir']))


@app.route('/schedule/')
@page_authorization()
def schedules_page(db, user):
    return template('schedules', page='schedule', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/players/')
@page_authorization()
def players_page(db, user):
    return template('players', page='players', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/groups/')
@page_authorization()
def groups_page(db, user):
    return template('groups', page='groups', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/headlines/')
@page_authorization()
def headlines_page(db, user):
    return template('headlines', page='headlines', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/players/<player_id>/')
@page_authorization()
def player_status_page(db, player_id, user):
    return template('monitor', page='players', name=user['name'], auth=user['auth'], playerid=player_id, _=localized(request.app.config['ds.base_dir']))


@app.route('/players/<player_id>/graphs')
@page_authorization()
def player_graphs_page(player_id, db, user):
    return template('extended', page='players', name=user['name'], auth=user['auth'], playerid=player_id, _=localized(request.app.config['ds.base_dir']))


@app.route('/maintenance/')
@page_authorization('admin')
def upkeep_repo_page(db, user):
    return template('maintenance', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.get('/admin/')
def admin_index_page(db):
    user = is_user_allowed(request, db, 'admin')
    if user:
        return redirect('/setup/users/')
    return redirect('/')


@app.route('/setup/users/')
@page_authorization('admin')
def admin_users_page(db, user):
    return template('users', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/setup/players/')
@page_authorization('admin')
def admin_players_page(db, user):
    return template('setup-players', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.route('/setup/groups/')
@page_authorization('admin')
def admin_groups(db, user):
    return template('setup-groups', name=user['name'], auth=user['auth'], _=localized(request.app.config['ds.base_dir']))


@app.get('/install/')
def boot_install_page(db):
    if datalayer.Authorization(db).is_empty():
        return template('install', _=localized(request.app.config['ds.base_dir']))
    return redirect('/')


@app.post('/register/')
def boot_register_page(db):
    if datalayer.Authorization(db).is_empty():
        username = request.forms.get('username')
        password = request.forms.get('password')
        datalayer.Authorization(db).register(username, password, datalayer.Authorization(db).is_empty())
        return template('install_ok', _=localized(request.app.config['ds.base_dir']))
    return redirect('/')


def bootstrap(application, config):
    dbconn = MySQLdb.connect(host=config['db_host'], user=config['db_user'], passwd=config['db_pass'], db=config['db_name'])
    dbcurs = dbconn.cursor()

    datalayer.Schedules.init(dbcurs)
    datalayer.Players.init(dbcurs)
    datalayer.Authorization.init(dbcurs)
    datalayer.PlayerGroups.init(dbcurs)
    datalayer.Files.init(dbcurs)
    datalayer.Protocol.init(dbcurs)
    datalayer.AccessGroups.init(dbcurs)

    for key, val in config.items():
        application.config['ds.{}'.format(key)] = val

    repo = Repository(dbcurs, config['distrib_dir'])
    plugin = bottle_mysql.Plugin(
        dbhost=config['db_host'],
        dbuser=config['db_user'],
        dbpass=config['db_pass'],
        dbname=config['db_name'],
        keyword='db'
    )
    application.install(plugin)

    TEMPLATE_PATH.append(os.path.join(config['base_dir'], 'views/'))

    application.route('/dist/status', ['POST'], repo.status)
    application.route('/dist/last', ['GET'], repo.last)
    application.route('/dist/list', ['GET'], repo.package_list)
    application.route('/dist/fetch/<revision>', ['GET'], repo.package_fetch)
    application.route('/dist/upload', ['POST'], repo.upload_distrib)
