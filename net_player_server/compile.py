from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext

ext_modules = [
	Extension("controllers", ["controllers.py"]),
	Extension("datalayer", ["datalayer.py"]),
	Extension("distlayer", ["distlayer.py"]),
]

setup(
	name = 'DS Server',
	cmdclass = {'build_ext': build_ext},
	ext_modules = ext_modules
)

