all: server converter

server:
	python3 compile.py build_ext --inplace

converter:
	python3 compile_conv.py build_ext --inplace

clean:
	rm -rf build
	rm *.c
