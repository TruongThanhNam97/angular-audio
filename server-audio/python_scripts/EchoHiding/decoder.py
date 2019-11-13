import numpy
import math
from EchoHiding.hamming_decoder import HammingDecoder
from EchoHiding.hamming_coder import HammingCoder


class BinaryMessage:
    def __init__(self, orginal_message):
        self.bits = []
        self.bits_original = []
        self.bitslen = 0
        self.output_txt = "message.txt"
        self.input_message = open(str(orginal_message), 'r')

        _code = HammingCoder()

        for ch in self.input_message.read():
            symb_ord = ord(ch.encode('utf8'))
            bin_ord = bin(symb_ord)[2:].zfill(8)

            left = bin_ord[:4]
            encoded_left = _code.encode(left)
            for k in encoded_left:
                self.bits_original.append(int(k))

            right = bin_ord[4:]
            encoded_right = _code.encode(right)
            for k in encoded_right:
                self.bits_original.append(int(k))

        self.bitslen_message = len(self.bits_original)

    def set_bitslen(self):
        self.bitslen = len(self.bits)

    def save_text(self):
        counter = 0
        bin_ord = ''

        flag = False
        left, right = "", ""
        code = HammingDecoder()

        self.set_bitslen()

        message = ""

        for i in range(self.bitslen):
            bin_ord += str(self.bits[i])
            counter += 1
            if counter == 7:
                if flag:
                    right = code.decode(bin_ord)
                    symb_ord = int(left + right, 2)

                    if symb_ord == 152 or 0 <= symb_ord <= 2:
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

        return message


class Key:
    def __init__(self):
        self.delta = 30, 40
        self.begin, self.end = 0, 0

class System:
    def __init__(self, signal, message, key):
        self.signal = signal
        self.message = message
        self.key = key
  
        self.hidden_bits_per_second = 16
        self.samples_per_section = self.signal.frame_rate // self.hidden_bits_per_second
        self.diff = self.signal.frame_rate % self.hidden_bits_per_second

        self.key.begin = 15 * self.signal.frame_rate
        div_part = self.message.bitslen_message // self.hidden_bits_per_second * self.signal.frame_rate
        mod_part = self.message.bitslen_message % self.hidden_bits_per_second * self.samples_per_section
        self.key.end = self.key.begin + div_part + mod_part

    def get_mod(self, x):
        return math.sqrt(x.real ** 2 + x.imag ** 2)

    def decode_section(self, section):
        extended_section = []
        extension = 4

        for s in section:
            for d in range(extension):
                extended_section.append(s - d)

        dft = numpy.fft.fft(extended_section)

        sqr_lg = []
        for elem in dft:
            sqr_lg.append((numpy.log(elem)) ** 2)

        ift = numpy.fft.ifft(sqr_lg)

        i0, i1 = extension*self.key.delta[0], extension*self.key.delta[1]
        imax0, imax1 = i0, i1

        for d in range(-2, 2):
            if self.get_mod(ift[i0 + d]) > self.get_mod(ift[imax0]):
                imax0 = i0 + d
            if self.get_mod(ift[i1 + d]) > self.get_mod(ift[imax1]):
                imax1 = i1 + d

        if self.get_mod(ift[imax0]) > self.get_mod(ift[imax1]):
            return "0"
        else:
            return "1"

    def extract_stegomessage(self):
        counter = self.key.begin
        section_counter = 0

        while counter < self.key.end:
            section = self.signal.channels[0][counter:counter + self.samples_per_section]
            self.message.bits.append(self.decode_section(section))

            counter += self.samples_per_section
            section_counter += 1

            if section_counter == self.hidden_bits_per_second:
                counter += self.diff
                section_counter = 0

        return self.message.save_text()

