import subprocess
import os
import shlex
import sys
import json

FFMPEG_COMMAND = '/usr/bin/ffmpeg -y -progress - -i {0} -c:v h264 -pix_fmt yuv420p -c:a mp3 -strict -2 -threads 1 {1}'
FFPROBE_COMMAND = '/usr/bin/ffprobe -select_streams v:0 -show_entries format=duration -of json {0}'

def parsetime(text):
    s, ms = text.split('.')
    return int(s) * 1e6 + int(ms)

def convert_file(input_file, output_file, progress_callback=None):
    probe = subprocess.Popen(
        shlex.split(FFPROBE_COMMAND.format(shlex.quote(input_file))),
        stderr=subprocess.DEVNULL,
        stdout=subprocess.PIPE
    )
    output = probe.communicate()[0]
    if probe.poll() != 0:
        return probe.poll()
    duration = parsetime(json.loads(output.decode('utf-8'))['format']['duration'])
    proc = subprocess.Popen(
        shlex.split(FFMPEG_COMMAND.format(shlex.quote(input_file), shlex.quote(output_file))),
        stderr=subprocess.DEVNULL,
        stdout=subprocess.PIPE
    )
    while True:
        output = proc.stdout.readline()
        if output == b'' and proc.poll() is not None:
            break
        if output != b'' and output.startswith(b'out_time_ms='):
            if callable(progress_callback):
                progress_callback(100.0 * int(output[12:]) / duration)
    return proc.poll()
