import wave
import math
import numpy
from EchoHiding.config import Config

class Wave:
    types = {
        1: numpy.int8,
        2: numpy.int16,
        4: numpy.int32
    }

    def __init__(self,input_wav):
        self.wavein = wave.open( str(input_wav) , 'r')
        self.channels_num = self.wavein.getnchannels()  # mono / stereo
        self.bytes_per_sample = self.wavein.getsampwidth()  # 1 / 2 / 4
        self.frame_rate = self.wavein.getframerate()  # 8000 / 44100 / 48000 / 96000
        self.frames_num = self.wavein.getnframes()
        self.content = numpy.fromstring(self.wavein.readframes(self.frames_num),
                                        dtype=self.types[self.bytes_per_sample])
        self.wavein.close()

        self.channels = []
        for n in range(self.channels_num):
            self.channels.append(self.content[n::self.channels_num])

        self.output = []

    def create_bitarray(self, signal):
        audio_bytearray = []
        for frame_int in signal:
            frame_bytes = int(frame_int).to_bytes( self.bytes_per_sample, byteorder = "little", signed = True )
            for byte in frame_bytes:
                audio_bytearray.append(byte)
        return bytearray(audio_bytearray)

    def create_stegoaudio(self,output_path):
        wave_out = wave.open( str(output_path) , 'w')
        wave_out.setparams(self.wavein.getparams())

        wave_out.writeframesraw( self.create_bitarray(self.output))

        wave_out.close()
        
