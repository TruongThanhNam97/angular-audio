import sys
import os
import ffmpy
import threading
from pathlib import Path
from EchoHiding import coding ,decoding
from difflib import SequenceMatcher
import json
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

File_Name = sys.argv[1]

def isSimilar(bits, message, original, original_bits):
    string_match_threshhold = config.string_match_threshhold
    bit_match_threshhold = config.bit_match_threshhold


    #check bit similar
    total = len(bits)
    if len(bits) > len(original_bits):
        total = len(original_bits)
    
    similar_bits_count = 0.0
    for i in range(total):
        if( int(bits[i]) == int(original_bits[i]) ) :
            similar_bits_count += 1.0

    bits_similarity = similar_bits_count / total
    string_similarity = SequenceMatcher(None, message, original ).ratio()

    if bits_similarity >= bit_match_threshhold:
        return True

    if string_similarity >= string_match_threshhold:
        return True

    return False

def readWatermark(filename):
    message , File_Path, is_temp, message_bits, original_bits, user_id = decoding.Decoding_factory.getFullMessage(File_Name,Original_Folder_Path, Watermark_Message_Folder_Path, FFMPEG_EXE_Path)
    if(is_temp):
        os.remove(File_Path)
    return message , message_bits, original_bits, user_id

def main():
    message , message_bits, original_bits, user_id = readWatermark(File_Name)
    print(message)
    original_message = open( str(Watermark_Message_Folder_Path/"original.txt"),"r" ).read()
    is_watermarked = isSimilar(message_bits, message, original_message, original_bits)
    result = json.dumps({ "watermarked" : is_watermarked,"userid" : user_id.replace('-','') })
    print(result)
    return result

main()