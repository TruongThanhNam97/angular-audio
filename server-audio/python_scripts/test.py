import sys
import os
from pathlib import Path
from EchoHiding import coding
from EchoHiding import audiowave

Main_File_Path = Path( os.path.abspath(__file__) )
Root_Path = Main_File_Path.parents[1]
Original_Folder_Path = Root_Path/"assets"/"original-songs"
Watermark_Message_Folder_Path = Root_Path/"assets"/"watermark-messages"
Key_Folder_Path = Root_Path/"assets"/"song-keys"
Watermarked_Folder_Path = Root_Path/"public"/"watermark-songs"
Py_Script_Folder_Path = Root_Path/"python_scripts"
FFMPEG_EXE_Path = Py_Script_Folder_Path/"libs"/"ffmpeg"/"bin"/"ffmpeg.exe"


File_Name = sys.argv[1]

coding.Coding_factory.Encoding(File_Name, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path ,Key_Folder_Path, FFMPEG_EXE_Path)

print( "OK" )
sys.stdout.flush()
