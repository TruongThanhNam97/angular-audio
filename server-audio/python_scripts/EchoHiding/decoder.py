import numpy
import math
from EchoHiding.hamming_decoder import HammingDecoder
from EchoHiding.hamming_coder import HammingCoder
from EchoHiding.config import Config
from EchoHiding.utility import String


class BinaryMessage:
    def __init__(self, orginal_message, is_full_message = False):
        self.bits = []
        self.bits_original_encoded = []
        self.bitslen = 0
        self.input = open(str(orginal_message), 'r')
        self.input_message = self.input.read()
        if(is_full_message):
            self.input_message += ( " " + String.toString32() + String.toString32() )
        self.bits_original = []
        bits = ""

        _code = HammingCoder()

        for ch in self.input_message:
            symb_ord = ord(ch.encode('utf8'))          
            bits = bin(symb_ord)[2:].zfill(8)

            for j in range(8):
                self.bits_original.append( bits[j] )

            left = bits[:4]
            encoded_left = _code.encode(left)
            for k in encoded_left:
                self.bits_original_encoded.append(int(k))

            right = bits[4:]
            encoded_right = _code.encode(right)
            for k in encoded_right:
                self.bits_original_encoded.append(int(k))

        self.bitslen_message = len(self.bits_original_encoded)

    def set_bitslen(self):
        self.bitslen = len(self.bits)

    def decode(self):
        counter = 0
        bin_ord = ''

        flag = False
        left, right = "", ""
        code = HammingDecoder()

        self.set_bitslen()

        message = ""
        decoded_bits = []

        for i in range(self.bitslen):
            bin_ord += str(self.bits[i])
            counter += 1
            if counter == 7:
                if flag:
                    right = code.decode(bin_ord)
                    symb_ord = int(left + right, 2)

                    for j in range(4):
                        decoded_bits.append(left[j])
                    for j in range(4):
                        decoded_bits.append(right[j])

                    if 127 <= symb_ord <= 159 or 0 <= symb_ord <= 31:
                        letter = ' '
                    else:
                        byte_ord = int(symb_ord).to_bytes(1, byteorder='little')
                        letter = byte_ord.decode("utf8",errors='ignore')

                    message = message + letter

                    flag = False
                    left, right = "", ""
                else:
                    left = code.decode(bin_ord)
                    flag = True
                bin_ord = ''
                counter = 0

        return message, decoded_bits

class System:
    def __init__(self, signal, message):
        self.signal = signal
        self.message = message

        self.total_message_frames = self.message.bitslen * Config.segment_len
        self.start_frame = Config.start_second * self.signal.frame_rate
        self.end_frame = self.start_frame + self.total_message_frames


        self.delta_frames = int(numpy.floor( self.signal.frame_rate * Config.delta_per_second ))
        self.alpha_frames = int(numpy.floor( self.signal.frame_rate * Config.alpha_per_second ))

        self.one_distance = self.delta_frames
        self.zero_distance = self.delta_frames + self.alpha_frames

    def decode_section(self, section):

        ab_fft = abs(numpy.fft.fft( section ))
        log_arr = []
        for ele in ab_fft:
            log_arr.append( numpy.log( ele ) )
        rceps = numpy.fft.ifft( log_arr )

        if (rceps[self.one_distance].real > rceps[self.zero_distance].real) :
            return 1
        else :
            return 0

    def extract_stegomessage(self):

        for segment in range(self.message.bitslen_message):        
            start_segment = self.start_frame + Config.segment_len * segment
            end_segment = start_segment + Config.segment_len - 1
            segment_array = self.signal.channels[0][start_segment : end_segment]
            print(segment, " : ",start_segment," : ",end_segment )
            self.message.bits.append( self.decode_section(segment_array) )

        return self.message.decode()

