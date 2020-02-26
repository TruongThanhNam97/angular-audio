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

string_match_threshhold = 0.50
bit_match_threshhold = 0.80