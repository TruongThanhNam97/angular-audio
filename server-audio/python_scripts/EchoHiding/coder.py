import math
import numpy
import random
from EchoHiding.hamming_coder import HammingCoder
from EchoHiding.config import Config
from EchoHiding.utility import String

class BinaryMessage:
    def CreateEncodeString(self):
        user_id_moded = String.toString32(self.user_id)
        user_name_moded = String.toString32(self.user_name)
        return self.watermark + " " + user_id_moded + " " + user_name_moded

    def __init__(self, input_txt, user_id, user_name):
        self.bits = []
        self.input = open(input_txt, 'r')
        self.user_id = user_id
        self.user_name = user_name
        self.watermark = self.input.read()

        self.encodeString = self.CreateEncodeString()

        code = HammingCoder()

        for ch in self.encodeString:
            symb_ord = ord(ch.encode('utf8'))
            bin_ord = bin(symb_ord)[2:].zfill(8)

            left = bin_ord[:4]
            encoded_left = code.encode(left)
            for k in encoded_left:
                self.bits.append(int(k))

            right = bin_ord[4:]
            encoded_right = code.encode(right)
            for k in encoded_right:
                self.bits.append(int(k))

        self.bitslen = len(self.bits)

class System:
    def __init__(self, signal, message):
        self.signal = signal
        self.message = message

        self.total_message_frames = self.count_frames()     # for encoded message

        self.max_int = (2**(8*self.signal.bytes_per_sample))/2-1
        self.min_int = -(2**(8*self.signal.bytes_per_sample))/2

        self.start_frame = Config.start_second * self.signal.frame_rate
        self.end_frame = self.start_frame + self.total_message_frames
        
        self.delta_frames = int(numpy.floor( self.signal.frame_rate * Config.delta_per_second ))
        self.alpha_frames = int(numpy.floor( self.signal.frame_rate * Config.alpha_per_second ))
        
        self.one_distance = self.delta_frames
        self.zero_distance = self.delta_frames + self.alpha_frames

        self.stegochannels = []

    def count_frames(self):
        return self.message.bitslen * Config.segment_len

    def is_message_valid(self):        # in sample's number     
        acceptable_begin = self.signal.frames_num - self.total_message_frames
        
        if acceptable_begin < self.start_frame:
            print("Message is too big")
            return False
        # max_second = acceptable_begin // self.signal.frame_rate
        # rand_second = random.randint(math.floor(max_second * 0.05), max_second)
        return True

    def create_stego_signal(self, channel):
        stego_signal = []

        ##create echo signal
        one_kernel = numpy.append( numpy.zeros(self.one_distance) , Config.echo_amplitute )
        zero_kernel = numpy.append( numpy.zeros(self.zero_distance) , Config.echo_amplitute )

        ##create echo kernel
        one_echo_signals = numpy.convolve( channel, one_kernel )
        zero_echo_signals = numpy.convolve( channel, zero_kernel )

        ##create mixer signal
        mixer_signal = []
        for frame in range(self.total_message_frames):
            mixer_signal.append(self.message.bits[frame // Config.segment_len])

        #create signal
        for frame in range( len(channel) ) :
            frame_int = int( channel[frame] * (0.70)
                            + one_echo_signals[frame]*mixer_signal[frame] 
                            + zero_echo_signals[frame]*(1-mixer_signal[frame]))
            frame_int = min( frame_int, self.max_int )
            frame_int = max( frame_int, self.min_int)
            stego_signal.append( frame_int )
        return stego_signal

    def create_stego_channel(self, channel):
        stego_channel = []
        stego_channel.extend( self.signal.channels[0][:self.start_frame] )

        stego_signal = self.create_stego_signal(self.signal.channels[0][self.start_frame:self.end_frame] )

        stego_channel.extend( stego_signal[:])

        stego_channel.extend( self.signal.channels[0][self.end_frame:])
        return stego_channel

    def unite_channels(self, channels):
        content = []
        for i in range( min( len(channels[0]) , len(channels[1]) ) ):
            for j in range(2):
                content.append(channels[j][i])
        return content

    def create_stego(self):
        stego_channel = self.create_stego_channel(self.signal.channels[0])
    
        if self.signal.channels_num == 2:
            self.stegochannels = []

            self.stegochannels.append( stego_channel )
            self.stegochannels.append( self.signal.channels[1] )
            
            output = self.unite_channels( self.stegochannels )     
            self.signal.output = output
        else:
            self.signal.output = stego_channel
