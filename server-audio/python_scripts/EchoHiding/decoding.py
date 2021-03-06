from EchoHiding.audiowave import Wave
from EchoHiding.converter import WavConverter
from EchoHiding.decoder import BinaryMessage, System
from pathlib import Path

class Decoding_factory:
    @staticmethod
    def Decoding( File_Name, Original_Folder_Path ,Watermark_Message_Folder_Path ,FFMPEG_EXE_Path , is_full_message = False):
        audio = Path(Original_Folder_Path)/File_Name
        ffmpy_exe_path = FFMPEG_EXE_Path
        message =  Path(Watermark_Message_Folder_Path)/"original.txt"

        audioconverter = WavConverter(ffmpy_exe_path)
        need2convert = audioconverter.is_needed(audio)
        if need2convert:
            audio = audioconverter.into_wav(audio)
        
        signal = Wave(audio)
        message = BinaryMessage(message, is_full_message)

        stegosystem = System(signal, message)
        decoded_message, decoded_bits, user_id = stegosystem.extract_stegomessage()
        return decoded_message , str(audio), need2convert, message.bits_original ,decoded_bits, user_id

    @staticmethod
    def getFullMessage( File_Name, Original_Folder_Path ,Watermark_Message_Folder_Path ,FFMPEG_EXE_Path):
        return Decoding_factory.Decoding( File_Name, Original_Folder_Path ,Watermark_Message_Folder_Path ,FFMPEG_EXE_Path , is_full_message = True)

