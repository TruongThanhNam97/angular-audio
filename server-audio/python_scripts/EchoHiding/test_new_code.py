import wave
import numpy
import ffmpy
import sys
import os
import datetime
import utility

file_name = "test/memory.mp3" 
start_second = 20

types = {
    1: numpy.int8,
    2: numpy.int16,
    4: numpy.int32
}

segment_len = 8192
delta_per_second = 0.04
alpha_per_second = 0.02
#utility

#encode
def encode(file_name, input_message):

    if file_name[-4:] != '.wav':
        file_wav = str(datetime.datetime.now().timestamp() ) +'_temp.wav'
        sys.stdout = open(os.devnull, "w")
        ffmpy.FFmpeg( inputs={file_name: None}, outputs={file_wav: None}).run(stdout = None, stderr=sys.stdout )
        sys.stdout = sys.__stdout__
        wavein = wave.open( file_wav , 'r' )
    else :
        wavein = wave.open( file_name , 'r')

    # declaration

    frames_num = wavein.getnframes()
    bytes_per_sample = wavein.getsampwidth()
    framerate = wavein.getframerate()
    content = numpy.frombuffer(wavein.readframes(frames_num),
                                dtype=types[bytes_per_sample])
    channels_num = wavein.getnchannels()

    max_int = (2**(8*bytes_per_sample))/2-1
    min_int = -(2**(8*bytes_per_sample))/2

    message_bits = utility.String.toBitsArray(input_message)
    message_bits_len = len(message_bits)
    total_message_frames = message_bits_len*segment_len
    startframe = start_second * framerate
    endframe = startframe + total_message_frames

    delta_frames = int(numpy.floor( framerate * delta_per_second ))
    alpha_frames = int(numpy.floor( framerate * alpha_per_second ))
    one_distance = delta_frames
    zero_distance = delta_frames + alpha_frames

    channels = []
    for n in range(channels_num):
        channels.append(content[n::channels_num])

    echo_amp = 0.4
    #encode

    ##create echo kernel
    one_kernel = numpy.append( numpy.zeros(one_distance) , echo_amp )
    zero_kernel = numpy.append( numpy.zeros(zero_distance) , echo_amp )
    
    
    ##create echo signal
    one_echo_signals = numpy.convolve( channels[0][startframe:endframe], one_kernel )
    zero_echo_signals = numpy.convolve( channels[0][startframe:endframe], zero_kernel )
    
    ##create mixer signal
    mixer_signal = []
    for frame in range(total_message_frames):
        mixer_signal.append (message_bits[frame // segment_len])
    
    #create signal
    stegna_signal = []
    for frame in range(startframe, endframe):
        segment_frame = frame - startframe
        frame_int = int( channels[0][frame] * (0.70)
                        + one_echo_signals[segment_frame]*mixer_signal[segment_frame] 
                        + zero_echo_signals[segment_frame]*(1-mixer_signal[segment_frame]))
        frame_int = min( frame_int, max_int )
        frame_int = max( frame_int, min_int)
        stegna_signal.append( frame_int )

    #unite chanels
    stegna_audio = []
    if(channels_num == 1):
        stegna_audio = stegna_signal
    else :
        for i in range(startframe, endframe):
            stegna_frame = i - startframe
            stegna_audio.append( stegna_signal[stegna_frame] )
            stegna_audio.append( channels[1][i])

    #create bytearray
    stegna_bytes = []
    for frame_int in stegna_audio:
        frame_bytes = int(frame_int).to_bytes( bytes_per_sample, byteorder = "little", signed = True )
        for byte in frame_bytes:
            stegna_bytes.append(byte)

    #write to file
    file_out = "test/out.wav"
    waveout = wave.open( file_out , 'w')
    waveout.setparams(wavein.getparams())

    waveout.writeframesraw( content[:startframe * channels_num] )

    waveout.writeframesraw( bytearray( stegna_bytes ) )

    waveout.writeframesraw( content[endframe*channels_num:] )

    waveout.close()
    return file_out

#decode
def decode(file_name , input_message):

    waveout = wave.open( "test/out_f1.wav" , 'r')

    frames_num = waveout.getnframes()
    bytes_per_sample = waveout.getsampwidth()
    framerate = waveout.getframerate()
    content = numpy.frombuffer(waveout.readframes(frames_num),
                                dtype=types[bytes_per_sample])
    channels_num = waveout.getnchannels()

    message_bits = utility.String.toBitsArray(input_message)
    message_bits_len = len(message_bits)
    total_message_frames = message_bits_len*segment_len
    startframe = start_second * framerate
    endframe = startframe + total_message_frames

    channels = []
    for n in range(channels_num):
        channels.append(content[n::channels_num])

    delta_frames = int(numpy.floor( framerate * delta_per_second ))
    alpha_frames = int(numpy.floor( framerate * alpha_per_second ))
    one_distance = delta_frames
    zero_distance = delta_frames + alpha_frames
    
    data = []

    for segment in range(message_bits_len):
        start_segment = startframe + segment_len*segment
        end_segment = start_segment + segment_len
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
        
    return utility.BitsArray.toString( data )
def main():
    input_message = "TRUONG THANH NAM - DANG XUAN DUY KHUONG"
    
    file_out = encode(file_name, input_message)
    message = decode(file_out, input_message)

    #check bit similar
    bits = utility.String.toBitsArray(input_message)
    decoded_bits = utility.String.toBitsArray(message)
    total = len(bits)
    if len(bits) > len(decoded_bits):
        total = len(decoded_bits)
    
    similar_bits_count = 0.0
    for i in range(total):
        if( int(bits[i]) == int(decoded_bits[i]) ) :
            similar_bits_count += 1.0

    bits_similarity = similar_bits_count / total
    print("bit similarity : " + str(bits_similarity))

    print( message ) 

main()
