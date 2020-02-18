import os
import sys
import wave
import ffmpy
import numpy
import config
import utility
import datetime

def encode(file_name):

    need_delete = False
    if file_name[-4:] != '.wav':
        need_delete = True
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
                                dtype=config.types[bytes_per_sample])
    channels_num = wavein.getnchannels()

    max_int = (2**(8*bytes_per_sample))/2-1
    min_int = -(2**(8*bytes_per_sample))/2

    message_bits = utility.String.encodeHammingCode( config.input_message )
    message_bits_len = len(message_bits)
    total_message_frames = message_bits_len * config.segment_len
    startframe = config.start_second * framerate
    endframe = startframe + total_message_frames

    delta_frames = int(numpy.floor( framerate * config.delta_per_second ))
    alpha_frames = int(numpy.floor( framerate * config.alpha_per_second ))
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
        mixer_signal.append (message_bits[frame // config.segment_len])
    
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
    file_out = "watermarked2/"+ file_name[9:-4] +".wav"
    waveout = wave.open( file_out , 'w')
    waveout.setparams(wavein.getparams())

    waveout.writeframesraw( content[:startframe * channels_num] )

    waveout.writeframesraw( bytearray( stegna_bytes ) )

    waveout.writeframesraw( content[endframe*channels_num:] )

    waveout.close()
    wavein.close()
    if need_delete:
        os.remove(file_wav)

def main():
    print(sys.argv[1])
    encode(sys.argv[1]) 
    print("")

main()