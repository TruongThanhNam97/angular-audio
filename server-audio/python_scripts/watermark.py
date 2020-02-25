import sys
import os
import ffmpy
import threading
from pathlib import Path
from EchoHiding import coding ,decoding
from difflib import SequenceMatcher
import config

Main_File_Path = config.Main_File_Path
Root_Path = config.Root_Path
Original_Folder_Path = config.Original_Folder_Path
Watermark_Message_Folder_Path = config.Watermark_Message_Folder_Path
Key_Folder_Path = config.Key_Folder_Path
Watermarked_Folder_Path = config.Watermarked_Folder_Path
Watermarked_Folder_Path_128 = config.Watermarked_Folder_Path_128
Watermarked_Folder_Path_320 = config.Watermarked_Folder_Path_320
Py_Script_Folder_Path = config.Py_Script_Folder_Path
FFMPEG_EXE_Path = config.FFMPEG_EXE_Path


def isSimilar(bits, message, original, original_bits):
    string_match_threshhold = 0.50
    bit_match_threshhold = 0.80


    #check bit similar
    total = len(bits)
    if len(bits) > len(original_bits):
        total = len(original_bits)
    
    similar_bits_count = 0.0
    for i in range(total):
        if( int(bits[i]) == int(original_bits[i]) ) :
            similar_bits_count += 1.0

    bits_similarity = similar_bits_count / total
    string_similarity = SequenceMatcher(None, message, original_message ).ratio()

    print("bit similarity : " + str(bits_similarity))
    print("string similarity : " + str(string_similarity))
    sys.stdout.flush()

    if bits_similarity >= bit_match_threshhold:
        return True

    if string_similarity >= string_match_threshhold:
        return True

    return False

def ToMP3(filename):

    input_file = Watermarked_Folder_Path/filename
    output_128 = Watermarked_Folder_Path_128/(str(filename).rsplit('.',1)[0] +".mp3")
    output_320 = Watermarked_Folder_Path_320/(str(filename).rsplit('.',1)[0] +".mp3")
    param_128 = ["-y","-b:a","128k"]
    param_320 = ["-y","-b:a","320k"]

    def convert(inputfile, outputfile, param):
        ffmpy.FFmpeg( executable= str(FFMPEG_EXE_Path), inputs={str(input_file) : None}, outputs={str(outputfile) : param}).run(stdout = None, stderr=sys.stdout )
        pass

    sys.stdout = open(os.devnull, "w") 
    convert(input_file, output_128,param_128)
    convert(input_file, output_320,param_320)
    sys.stdout = sys.__stdout__ 
    pass

File_Name = sys.argv[1]
User_ID = sys.argv[2]
User_Name = sys.argv[3]

print('Starting to decode')
sys.stdout.flush()

message , File_Path, is_temp, message_bits, original_bits = decoding.Decoding_factory.Decoding(File_Name,Original_Folder_Path, Watermark_Message_Folder_Path, FFMPEG_EXE_Path)
original_message = open( str(Watermark_Message_Folder_Path/"original.txt"),"r" ).read()

print(message)
sys.stdout.flush()

if not isSimilar(message_bits, message, original_message, original_bits):
    print('Starting to encode')
    sys.stdout.flush()
    output = coding.Coding_factory.Encoding(File_Name, File_Path, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path ,Key_Folder_Path, User_ID, User_Name)
    ToMP3(output)
    print( "OK" )
    sys.stdout.flush()
else:
    print( "Reup detected : ", message, file=sys.stderr )
    sys.stderr.flush()
if is_temp:
    os.remove(File_Path)
