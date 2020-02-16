import ffmpy
import sys
import os
import datetime
import wave

class WavConverter:
    def __init__(self, ffmpy_exe_path):
        self.input = ''
        self.input_wav = ''
        self.ffmpy_exe_path = str(ffmpy_exe_path)
        self.was_used = False

    def into_wav(self, _input):
        self.input = str(_input)
        self.input_wav = str(datetime.datetime.now().timestamp() ) +'_temp.wav'
        sys.stdout = open(os.devnull, "w")
        ffmpy.FFmpeg( executable= self.ffmpy_exe_path, inputs={self.input : None}, outputs={self.input_wav: "-ar 48000"}).run(stdout = None, stderr=sys.stdout )
        sys.stdout = sys.__stdout__
        self.was_used = True
        return self.input_wav

    def is_needed(self, name):
        name = str(name)
        if name[-4:] != '.wav':
            return True
        wavein = wave.open( str(name) , 'r')
        if wavein.getframerate() != 48000:
            return True
        return False


    def delete_temps(self):
        if self.was_used:
            os.remove(self.input_wav)
