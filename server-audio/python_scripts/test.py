import sys
import os
from pathlib import Path
from EchoHiding import coding ,decoding
from difflib import SequenceMatcher

Main_File_Path = Path( os.path.abspath(__file__) )
Root_Path = Main_File_Path.parents[1]
Original_Folder_Path = Root_Path/"assets"/"original-songs"
Watermark_Message_Folder_Path = Root_Path/"assets"/"watermark-messages"
Key_Folder_Path = Root_Path/"assets"/"song-keys"
Watermarked_Folder_Path = Root_Path/"public"/"watermark-songs"
Py_Script_Folder_Path = Root_Path/"python_scripts"
FFMPEG_EXE_Path = Py_Script_Folder_Path/"libs"/"ffmpeg"/"bin"/"ffmpeg.exe"
match_threshhold = 0.50

File_Name = sys.argv[1]
message , File_Path, is_temp, bits = decoding.Decoding_factory.Decoding(File_Name,Original_Folder_Path, Watermark_Message_Folder_Path, FFMPEG_EXE_Path)
original_message = open( str(Watermark_Message_Folder_Path/"original.txt"),"r" ).read()
print(bits)
print("extracted")
sys.stdout.flush()
if SequenceMatcher(None, message, original_message ).ratio() <= match_threshhold:
    coding.Coding_factory.Encoding(File_Name, File_Path, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path ,Key_Folder_Path)
    print( "OK" )
    sys.stdout.flush()
else:
    print( "Reup detected : ", message, file=sys.stderr )
    sys.stderr.flush()
if is_temp:
    os.remove(File_Path)
