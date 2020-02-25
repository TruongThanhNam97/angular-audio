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

def readWatermark(filename):
    message , File_Path, is_temp, message_bits, original_bits, user_id = decoding.Decoding_factory.getFullMessage(File_Name,Original_Folder_Path, Watermark_Message_Folder_Path, FFMPEG_EXE_Path)
    if(is_temp):
        os.remove(File_Path)
    return message, user_id

def main():
    watermark, user_arr = readWatermark(File_Name)
    result = json.dumps({ "error" : False,"message" : watermark ,"user_id_arr": user_arr})
    print(result)
    return result

main()