from EchoHiding.audiowave import Wave
from EchoHiding.converter import WavConverter
from EchoHiding.coder import BinaryMessage, System
from pathlib import Path
import numpy

class Coding_factory:
    @staticmethod
    def Encoding(File_Name, File_Path, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path, Key_Folder_Path):
        audio = File_Path
        text = Path(Watermark_Message_Folder_Path)/"original.txt"   
        file_name = str(File_Name).rsplit('.',1)[0]  +".wav"
        output_path = Path(Watermarked_Folder_Path)/(file_name)

        signal = Wave(audio)
        message = BinaryMessage(text)

        stegosystem = System(signal, message)
        stegosystem.create_stego()
        stegosystem.signal.create_stegoaudio(output_path)
        return file_name