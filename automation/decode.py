import os
import sys
import wave
import math
import ffmpy
import numpy
import config
import utility
import datetime

def decode(filename):
    need_delete = False
    if filename[-4:] != '.wav':
        need_delete = True
        file_wav = str(datetime.datetime.now().timestamp() ) +'_temp.wav'
        sys.stdout = open(os.devnull, "w")
        ffmpy.FFmpeg( inputs={filename: None}, outputs={file_wav:  "-ar 44100"}).run(stdout = None, stderr=sys.stdout )
        sys.stdout = sys.__stdout__
        waveout = wave.open( file_wav , 'r' )
    else :
        waveout = wave.open( filename , 'r')

    frames_num = waveout.getnframes()
    bytes_per_sample = waveout.getsampwidth()
    framerate = waveout.getframerate()
    content = numpy.frombuffer(waveout.readframes(frames_num),
                                dtype=config.types[bytes_per_sample])
    channels_num = waveout.getnchannels()

    message_bits = utility.String.toBitsArray(config.input_message)
    message_bits_len = len(message_bits) *7 // 4
    total_message_frames = message_bits_len*config.segment_len
    startframe = config.start_second * framerate
    endframe = startframe + total_message_frames

    channels = []
    for n in range(channels_num):
        channels.append(content[n::channels_num])

    delta_frames = int(numpy.floor( framerate * config.delta_per_second ))
    alpha_frames = int(numpy.floor( framerate * config.alpha_per_second ))
    one_distance = delta_frames
    zero_distance = delta_frames + alpha_frames
    
    data = []

    for segment in range(message_bits_len):
        start_segment = startframe + config.segment_len*segment
        end_segment = start_segment + config.segment_len
        segment_array = channels[0][start_segment : end_segment]

        ab_fft = abs(numpy.fft.fft( segment_array ))
        log_arr = []
        for ele in ab_fft:
            log_arr.append( numpy.log( ele ) )
        rceps = numpy.fft.ifft( log_arr )

        if (rceps[one_distance].real > rceps[zero_distance].real) :
            data.append(1)
        else :
            data.append(0)

    waveout.close()
    if need_delete:
        os.remove(file_wav)
        
    return utility.BitsArray.decodeHammingCode( data ), data

def main():
    message, bit_decoded = decode(sys.argv[1])

    message_bits = utility.String.encodeHammingCode(config.input_message)

    
    similiar_count = 0
    min_total = min( len(bit_decoded), len(message_bits) )
    max_total = max( len(bit_decoded), len(message_bits) )
    NC_total = 0
    NC_decoded_total =0
    NC_message_total =0
    for b in range( min_total ):

        #get BER
        if bit_decoded[b] == message_bits[b]:
            similiar_count += 1

        #get NC
        NC_total += int(bit_decoded[b]) * int(message_bits[b])
        NC_decoded_total += int(bit_decoded[b])
        NC_message_total += int(message_bits[b])

    BER = 1 - similiar_count/max_total
    NC = NC_total / math.sqrt( NC_decoded_total*NC_message_total )

    file_name = sys.argv[1].split('\\')
    print(file_name[2] + "," + "," + file_name[1] + "," + str(BER) + ","+ str(NC) )

main()