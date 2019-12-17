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
        output_path = Path(Watermarked_Folder_Path)/(File_Name.split('.')[0]+".wav")

        signal = Wave(audio)
        message = BinaryMessage(text)

        stegosystem = System(signal, message)
        stegosystem.create_stego()
        stegosystem.signal.create_stegoaudio(output_path)