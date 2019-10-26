import ffmpy
import os


class WavConverter:
    def __init__(self):
        self.input = ''
        self.input_wav = ''
        self.was_used = False

    def into_wav(self, input):
        self.input = str(input)
        self.input_wav = 'temp.wav'
        ffmpy.FFmpeg(inputs={self.input : None}, outputs={self.input_wav: None}).run()
        self.was_used = True
        return self.input_wav

    def is_needed(self, name):
        return name[-4:] != '.wav'

    def delete_temps(self):
        if self.was_used:
            os.remove(self.input_wav)
