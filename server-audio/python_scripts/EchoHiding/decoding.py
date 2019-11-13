from EchoHiding.audiowave import Wave
from EchoHiding.converter import WavConverter
from EchoHiding.decoder import BinaryMessage, Key, System
from pathlib import Path

class Decoding_factory:
    @staticmethod
    def Decoding( File_Name, Original_Folder_Path ,Watermark_Message_Folder_Path ,FFMPEG_EXE_Path):
        audio = Path(Original_Folder_Path)/File_Name
        ffmpy_exe_path = FFMPEG_EXE_Path
        message =  Path(Watermark_Message_Folder_Path)/"original.txt"

        audioconverter = WavConverter(ffmpy_exe_path)
        need2convert = audioconverter.is_needed(File_Name)
        if need2convert:
            audio = audioconverter.into_wav(audio)
        
        signal = Wave(audio)
        message = BinaryMessage(message)
        key = Key()

        stegosystem = System(signal, message, key)
        return stegosystem.extract_stegomessage() , str(audio), need2convert
