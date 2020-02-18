class HammingDecoder:
    # the decoding matrix
    H = ['0001111', '0110011', '1010101']
    Ht = ['001', '010', '011', '100', '101', '110', '111']

    R = ['0010000', '0000100', '0000010', '0000001']

    @staticmethod
    def decode(y):
        z = ''.join([str(bin(int(j, 2) & int(y, 2)).count('1') % 2) for j in HammingDecoder.H])
        if int(z, 2) > 0:
            e = int( HammingDecoder.Ht[int(z, 2) - 1], 2)
            y = list(y)
            y[e - 1] = str(1 - int(y[e - 1]))
            y = ''.join(y)

        x = ''.join([str(bin(int(k, 2) & int(y, 2)).count('1') % 2) for k in HammingDecoder.R])
        return x
