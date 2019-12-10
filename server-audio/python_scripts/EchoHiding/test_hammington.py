import hamming_coder
import hamming_decoder
from difflib import SequenceMatcher

f = open("test/input_message.txt", 'r')

#encode
original_string = ""
bits = []
encoder =  hamming_coder.HammingCoder()

for ch in f.read():
    original_string += ch
    symb_ord = ord(ch.encode('utf8'))
    bin_ord = bin(symb_ord)[2:].zfill(8)

    left = bin_ord[:4]
    encoded_left = encoder.encode(left)
    for k in encoded_left:
        bits.append(int(k))

    right = bin_ord[4:]
    encoded_right = encoder.encode(right)
    for k in encoded_right:
        bits.append(int(k))

#decode

bitslen = len(bits)
decoder = hamming_decoder.HammingDecoder()
decoded_string = ""
counter = 0
bin_ord = ''

flag = False
left, right = "", ""

for i in range(bitslen):
    bin_ord += str(bits[i])
    counter += 1
    if counter == 7:
        if flag:
            right = decoder.decode(bin_ord)
            symb_ord = int(left + right, 2)

            # if 127 <= symb_ord <= 159 or 0 <= symb_ord <= 31:
            #     letter = ' '
            # else:
            byte_ord = int(symb_ord).to_bytes(1, byteorder='little')
            letter = byte_ord.decode("utf8")

            decoded_string = decoded_string + letter

            flag = False
            left, right = "", ""
        else:
            left = decoder.decode(bin_ord)
            flag = True
        bin_ord = ''
        counter = 0

print(SequenceMatcher(None, original_string, decoded_string ).ratio())