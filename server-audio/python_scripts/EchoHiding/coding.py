from EchoHiding.audiowave import Wave
from EchoHiding.converter import WavConverter
from EchoHiding.coder import BinaryMessage, Key, System
from pathlib import Path
import numpy

class Coding_factory:
    @staticmethod
    def Encoding( File_Name, Original_Folder_Path, Watermarked_Folder_Path, Watermark_Message_Folder_Path ):
        audio = Path(Original_Folder_Path)/File_Name
        text = Path(Watermark_Message_Folder_Path)/"original.txt"

        audioconverter = WavConverter()
        if audioconverter.is_needed(File_Name):
            audio = audioconverter.into_wav(audio)

        signal = Wave(audio)
        message = BinaryMessage(text)
        key = Key()

        stegosystem = System(signal, message, key)
        stegosystem.create_stego()
        stegosystem.signal.create_stegoaudio(stegosystem.key)

        audioconverter.delete_temps()