import sys
import os
from pathlib import Path
from EchoHiding import coding
from EchoHiding import audiowave

Main_File_Path = Path( os.path.abspath(__file__) )
Root_Path = Main_File_Path.parents[1]
Original_Folder_Path = Root_Path/"assets"/"original-songs"
Watermark_Message_Folder_Path = Root_Path/"assets"/"watermark-messages"
Watermarked_Folder_Path = Root_Path/"public"/"watermark-songs"

#File_Name = sys.argv[1]
File_Name = "1571840826929-Nuoc Mat Em Lau Bang Tinh Yeu Moi - Da L.mp3"

coding.Coding_factory.Encoding(File_Name, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path)

print( "OK" )
sys.stdout.flush()
