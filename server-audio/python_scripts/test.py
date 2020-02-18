import sys
import os
import ffmpy
import threading
from pathlib import Path
from EchoHiding import coding ,decoding
from difflib import SequenceMatcher

Main_File_Path = Path( os.path.abspath(__file__) )
Root_Path = Main_File_Path.parents[1]
Original_Folder_Path = Root_Path/"assets"/"original-songs"
Watermark_Message_Folder_Path = Root_Path/"assets"/"watermark-messages"
Key_Folder_Path = Root_Path/"assets"/"song-keys"
Watermarked_Folder_Path = Root_Path/"public"/"watermark-songs"/"wav"
Watermarked_Folder_Path_128 = Root_Path/"public"/"watermark-songs"/"mp3-128"
Watermarked_Folder_Path_320 = Root_Path/"public"/"watermark-songs"/"mp3-320"
Py_Script_Folder_Path = Root_Path/"python_scripts"
FFMPEG_EXE_Path = Py_Script_Folder_Path/"libs"/"ffmpeg"/"bin"/"ffmpeg.exe"


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
    output_128 = Watermarked_Folder_Path_128/(filename.rsplit('.',1)[0] +".mp3")
    output_320 = Watermarked_Folder_Path_320/(filename.rsplit('.',1)[0] +".mp3")
    param_128 = ["-y","-b:a","128k"]
    param_320 = ["-y","-b:a","320k"]

    def convert(inputfile, outputfile, param):
        ffmpy.FFmpeg( executable= FFMPEG_EXE_Path, inputs={str(input_file) : None}, outputs={str(outputfile) : param}).run(stdout = None, stderr=sys.stdout )
        pass

    sys.stdout = open(os.devnull, "w") 
    convert(input_file, output_128,param_128)
    convert(input_file, output_320,param_320)
    sys.stdout = sys.__stdout__ 
    pass

File_Name = sys.argv[1]

print('Starting to decode')
sys.stdout.flush()

message , File_Path, is_temp, message_bits, original_bits = decoding.Decoding_factory.Decoding(File_Name,Original_Folder_Path, Watermark_Message_Folder_Path, FFMPEG_EXE_Path)
original_message = open( str(Watermark_Message_Folder_Path/"original.txt"),"r" ).read()

print(message)
sys.stdout.flush()

if not isSimilar(message_bits, message, original_message, original_bits):
    print('Starting to encode')
    sys.stdout.flush()
    output = coding.Coding_factory.Encoding(File_Name, File_Path, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path ,Key_Folder_Path)
    ToMP3(output)
    print( "OK" )
    sys.stdout.flush()
else:
    print( "Reup detected : ", message, file=sys.stderr )
    sys.stderr.flush()
if is_temp:
    os.remove(File_Path)
