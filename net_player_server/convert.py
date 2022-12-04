import logging
import zmq
import os
import sys
import json
import threading
import http.client
from queue import Queue
import subprocess
import time
from glob import glob
from shlex import split as cmd_split
from shutil import move as movefile
from settings import UPLOAD_DIR, PROCESSED_DIR, MEDIA_DIR, CONVERT_IPC, SERVER_PORT
from ffwrap import convert_file


class _ipcQuery(object):
    __slots__ = ['method', 'subject', 'data']

    def __init__(self, method=None, subject=None, data=None):
        self.method = method
        self.subject = subject
        self.data = data

    def __str__(self):
        return '<ipc-request {} {} {}>'.format(self.method, self.subject, self.data)


class _processState(object):
    __slots__ = ['code', 'status', 'user']

    def __init__(self, user):
        self.code = None
        self.user = user
        self.status = 0


logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

# FFMPEG_CMD = '/usr/bin/ffmpeg -y -i {1}/{0} -c:v h264 -pix_fmt yuv420p -strict -2 -threads 1 {2}/{0}'
# DEVNULL = open(os.devnull)


class ConversionProcess(threading.Thread):

    def __init__(self, filename, user, chan):
        super().__init__()
        self.filename = filename
        self.user = user
        self.chan = chan

    def progress(self, percent):
        self.chan.put(_ipcQuery('state', self.filename, percent))

    def run(self):
        try:
            logging.info('Started conversion: {}'.format(self.filename))
            self.chan.put(_ipcQuery('add', self.filename, self.user))
            name, ext = os.path.splitext(self.filename)
            retcode = convert_file(os.path.join(UPLOAD_DIR, self.filename), os.path.join(PROCESSED_DIR, name + '.mp4'), self.progress)
            logging.info('Done {} - {}'.format(self.filename, retcode))
            if retcode == 0:
                movefile(os.path.join(PROCESSED_DIR, name + '.mp4'), os.path.join(MEDIA_DIR, name + '.mp4'))
            os.remove(os.path.join(UPLOAD_DIR, self.filename))
        except:
            logging.warn('Error occured during processing: {}'.format(sys.exc_info()[1]))
            retcode = -999
        finally:
            self.chan.put(_ipcQuery('del', self.filename, retcode))


def parse_request(req):
    try:
        logging.debug('Got {}'.format(req))
        return json.loads(req.decode('utf-8'))
    except:
        return None


class OverSeer(threading.Thread):

    def __init__(self, inc, outc, quit_event):
        super().__init__()
        self.incoming = inc
        self.outcoming = outc
        self.table = dict()
        self.counter = 0
        self.queue = Queue()
        self.quit_event = quit_event
        self.max_tasks = 2

    def file_converted(self, filename):
        print('Converted file {}'.format(filename))
        conn = http.client.HTTPConnection('localhost', SERVER_PORT)
        conn.request('POST', '/api/files/conversion_done', json.dumps({
            'filename': filename
        }), {'Content-Type': 'application/json'})
        response = conn.getresponse()
        print('Response {}'.format(response.status))
        conn.close()

    def run(self):
        done = 0
        while not self.quit_event.is_set():
            request = self.incoming.get()
            logging.debug('Overseer got {}'.format(request))
            if request.method == 'add':
                # self.counter += 1
                self.table[request.subject] = _processState(request.data)
            elif request.method == 'queue':
                self.queue.put({'file': request.subject, 'user': request.data})
                logging.debug('Push to queue // A: %s / Q: %s / D: %s', self.counter, self.queue.qsize(), done)
            elif request.method == 'del':
                done += 1
                self.counter -= 1
                self.table[request.subject].status = 100.0
                self.table[request.subject].code = request.data
                self.file_converted(request.subject)
            elif request.method == 'count':
                self.outcoming.put(self.counter)
            elif request.method == 'progress':
                if self.counter == 0:
                    self.outcoming.put(0.0)
                    continue
                retval = 0.0
                counter = 0
                for v in self.table.values():
                    if (v.code is None) and (v.user == request.subject):
                        retval += v.status
                        counter += 1
                self.outcoming.put(retval / counter if counter > 0 else 0.0)
            elif request.method == 'progress-details':
                jobs = []
                for k, v in self.table.items():
                    if (v.code is None) and (v.user == request.subject):
                        jobs.append((k, v.status))
                self.outcoming.put(jobs)
            elif request.method == 'state':
                self.table[request.subject].status = request.data
            elif request.method == 'halt':
                break
            else:
                logging.info('Overseer: no command')
            # put queued task into conversion
            while (self.queue.qsize() > 0) and (self.counter < self.max_tasks):
                task = self.queue.get()
                if not task is None:
                    self.counter += 1
                    logging.debug('Pull from queue // A: %s / Q: %s / D: %s', self.counter, self.queue.qsize(), done)
                    ConversionProcess(task['file'], task['user'], self.incoming).start()


def main():
    try:
        logging.info('Starting')
        logging.info('Cleaning up temporary folders')
        for f in glob(os.path.join(PROCESSED_DIR, '*')):
            os.remove(f)
        upstream = Queue()
        dnstream = Queue()
        quit_event = threading.Event()
        OverSeer(upstream, dnstream, quit_event).start()
        ctx = zmq.Context()
        sock = ctx.socket(zmq.REP)
        sock.bind(CONVERT_IPC)
        while not quit_event.is_set():
            request = parse_request(sock.recv())
            reply = None
            if request['method'] == 'convert':
                upstream.put(_ipcQuery('queue', request['filename'], request['user']))
            elif request['method'] == 'status':
                upstream.put(_ipcQuery('count'))
                reply = dnstream.get()
            elif request['method'] == 'progress':
                upstream.put(_ipcQuery('progress', request['user']))
                reply = dnstream.get()
            elif request['method'] == 'progress-details':
                upstream.put(_ipcQuery('progress-details', request['user']))
                reply = dnstream.get()
            elif request['method'] == 'stop':
                quit_event.set()
            else:
                logging.info('Not implemented')
            sock.send(json.dumps({'status': 'ok', 'data': reply}).encode('utf-8'))
    except KeyboardInterrupt:
        logging.info('Shutting down')
        upstream.put(_ipcQuery('halt'))
    except:
        logging.warning('Error occured: {}'.format(sys.exc_info()[1]))
    finally:
        logging.info('Graceful shutdown')
