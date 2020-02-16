import ffmpy
import sys
import os
import datetime
import wave
import EchoHiding.utility as utility

class WavConverter:
    def __init__(self, ffmpy_exe_path):
        self.input = ''
        self.input_wav = ''
        self.ffmpy_exe_path = str(ffmpy_exe_path)
        self.was_used = False

    def into_wav(self, _input):
        self.input = str(_input)
        self.input_wav = str(datetime.datetime.now().timestamp() ) + utility.String.generateRandomString() +'.wav'
        sys.stdout = open(os.devnull, "w")

        #retry if failed
        retry_times = 0
        retry_number = 3
        is_done = False
        while(not is_done):
            #break point
            retry_times += 1
            if retry_times >= retry_number:
                is_done = True
            else:
                is_done = False

            try:    
                ffmpy.FFmpeg( executable= self.ffmpy_exe_path, inputs={self.input : None}, outputs={self.input_wav: "-ar 48000"}).run(stdout = None, stderr=sys.stdout )
                is_done = True
            except:
                pass
        
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
