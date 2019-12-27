class String:
    @staticmethod
    def toBitsArray(string):
        result = []

        for c in string:
            bits = format( ord(c), '08b' )
            result.extend([int(b) for b in bits])
        return result

class BitsArray:
    @staticmethod
    def toString(array):
        result = ""
        for b in range(len(array) // 8):
            byte = array[b*8:(b+1)*8]
            result += (chr(int(''.join([str(bit) for bit in byte]), 2)))
        return result