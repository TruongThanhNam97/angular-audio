import os
import sys
import config
import wave
import numpy
import math
import datetime
import ffmpy

def SNR(file_name):
    watermarked_file = wave.open(config.watermarked_folder+"\\"+file_name[:-4]+".wav")
    original_file_path = config.original_folder+"\\"+file_name

    need_delete = False
    if file_name[-4:] != '.wav':
        need_delete = True
        file_wav = str(datetime.datetime.now().timestamp() ) +'_temp.wav'
        sys.stdout = open(os.devnull, "w")
        ffmpy.FFmpeg( inputs={original_file_path: None}, outputs={file_wav: None}).run(stdout = None, stderr=sys.stdout )
        sys.stdout = sys.__stdout__
        original_file =  wave.open(file_wav,"r")
    else :
        original_file =  wave.open(original_file_path,"r")

    original_bytes_per_sample = original_file.getsampwidth()
    watermarked_bytes_per_sample = watermarked_file.getsampwidth()

    original_frame_num = original_file.getnframes()
    watermarked_frame_num = watermarked_file.getnframes()

    original_content = numpy.frombuffer(original_file.readframes(original_frame_num),
                                dtype=config.types[original_bytes_per_sample])
    watermarked_content = numpy.frombuffer(watermarked_file.readframes(watermarked_frame_num),
                                dtype=config.types[watermarked_bytes_per_sample])

    max_len = max(len(original_content),len(watermarked_content))
    min_len = min(len(original_content),len(watermarked_content))

    total_original_signal = 0.0
    total_noise_signal = 0.0
    for i in range(min_len):
        total_original_signal += pow(original_content[i],2)
        total_noise_signal += pow(watermarked_content[i] - original_content[i],2)

    SNR = 10* math.log10( total_original_signal/total_noise_signal )

    watermarked_file.close()
    original_file.close()
    if need_delete:
        os.remove(file_wav)

    return str(SNR)

def main():
    file_name = sys.argv[1].split("\\")[1]
    print( file_name +","+ SNR(file_name) )

main()