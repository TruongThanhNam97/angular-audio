import string
import random

class String:
    @staticmethod
    def toBitsArray(string):
        result = []
        for c in string:
            bits = format( ord(c), '08b' )
            result.extend([int(b) for b in bits])
        return result

    @staticmethod
    def generateRandomString(length = 10):
        letters = string.ascii_letters
        return ''.join(random.choice(letters) for i in range(length))

    @staticmethod
    def toString32(string = "", char = '-'):
        if ( len(string) > 32 ):
            string = string[0,31]
        return string.center(32, char)
        
class BitsArray:
    @staticmethod
    def toString(array):
        result = ""
        for b in range(len(array) // 8):
            byte = array[b*8:(b+1)*8]
            result += (chr(int(''.join([str(bit) for bit in byte]), 2)))
        return result
