#!/usr/bin/python3

import cherrypy
from wsgi import application as app
from settings import MEDIA_DIR, THUMB_DIR

import os.path

class Root:
    def _cp_dispatch(self, vpath):
        if not 'path' in cherrypy.request.params:
            cherrypy.request.params['path'] = vpath.pop(0)
        else:
            cherrypy.request.params['path'] = os.path.join(cherrypy.request.params['path'], vpath.pop(0))
        if len(vpath) > 0:
            return self
        else:
            return self.default

    @cherrypy.expose
    def default(self, path):
        return cherrypy.lib.static.serve_file(os.path.join(cherrypy.request.config['my.apphome'], 'static', path))

if __name__=='__main__':
    apphome = os.path.dirname(os.path.abspath(__file__))  # Root static dir is this file's directory.

    cherrypy.config.update( {  # I prefer configuring the server here, instead of in an external file.
            'server.socket_host': '0.0.0.0',
            'server.socket_port': 4501,
            'my.apphome': apphome
        } )
    conf = {
        '/': {  # Root folder.
            'tools.staticdir.on':   True,  # Enable or disable this rule.
            'tools.staticdir.root': os.path.join(apphome, 'static'),
            'tools.staticdir.dir':  '',
        }
    }

def generate_static_config(path):
    return {
        'global': {
            'log.screen': True
        },
        '/': {  # Root folder.
            'tools.staticdir.on':   True,  # Enable or disable this rule.
            'tools.staticdir.root': path,
            'tools.staticdir.dir':  '',
        }
    }

cherrypy.log.error_log.propagate = True
cherrypy.log.access_log.propagate = True

cherrypy.tree.graft(app, '/')
cherrypy.tree.mount(Root(), '/static/', generate_static_config(os.path.join(apphome, 'static')))
cherrypy.tree.mount(Root(), '/media/', generate_static_config(MEDIA_DIR))
cherrypy.tree.mount(Root(), '/thumb/', generate_static_config(THUMB_DIR))
cherrypy.engine.start()
cherrypy.engine.block()


