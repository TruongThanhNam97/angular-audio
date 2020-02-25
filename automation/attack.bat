FOR %%i in (watermarked2\*.wav) DO (
    ffmpeg -i "%%i" -y "modified/toMP3/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 64k "modified/toMP3 64/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 96k "modified/toMP3 96/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 128k "modified/toMP3 128/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 192k "modified/toMP3 192/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 320k "modified/toMP3 320/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ac 1 "modified/toMP3 Mono/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 64k "modified/toMP3 Mono 64/%%~ni.mp3"
    ffmpeg -i "%%i" -y -b:a 96k "modified/toMP3 Mono 96/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ac 1 -b:a 128k "modified/toMP3 Mono 128/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ac 1 -b:a 192k "modified/toMP3 Mono 192/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ac 1 -b:a 320k "modified/toMP3 Mono 320/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ar 44100 "modified/toMP3 44k/%%~ni.mp3"
    ffmpeg -i "%%i" -y -ar 48000 "modified/toMP3 48k/%%~ni.mp3"
)