import hamming_decoder
import hamming_coder

class String:
    @staticmethod
    def toBitsArray(string):
        result = []

        for c in string:
            bits = format( ord(c), '08b' )
            result.extend([int(b) for b in bits])
        return result

    def encodeHammingCode(string):
        result = ""

        original_bits = String.toBitsArray(string)
        for b in range(len(original_bits) // 4):
            byte = ''.join(map(str, original_bits[b*4:(b+1)*4]))
            result += hamming_coder.HammingCoder.encode(byte)
            result = list(map(int, result))

        return result

class BitsArray:
    @staticmethod
    def toString(array):
        result = ""
        for b in range(len(array) // 8):
            byte = array[b*8:(b+1)*8]         
            try:
                result += (chr(int(''.join([str(bit) for bit in byte]), 2)))
            except expression as identifier:
                pass
        return result

    @staticmethod
    def decodeHammingCode(array):
        result = []

        for b in range(len(array) // 7):
            byte = ''.join(map(str, array[b*7:(b+1)*7]))
            result += hamming_decoder.HammingDecoder.decode(byte)
            result = list(map(int, result))
        return BitsArray.toString(result)

