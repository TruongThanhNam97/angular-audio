pushd server-audio
del *.mp3
del *.MP3
del *.wav
del *.WAV
del *.M4A
del *.m4a
del *.flac
del *.FLAC

pushd assets\original-songs
del *.mp3
del *.MP3
del *.wav
del *.WAV
del *.M4A
del *.m4a
del *.flac
del *.FLAC
popd

pushd public\watermark-songs\mp3-128
del *.mp3
del *.MP3
popd 

pushd public\watermark-songs\mp3-320
del *.mp3
del *.MP3
popd

pushd public\watermark-songs\wav
del *.wav
del *.WAV
popd

pushd public\videos
del *.mp4
del *.MP4
popd 

pushd public\images
del *.jpg
del *.JPG
del *.PNG
del *.png
del *.gif
del *.GIF
del *.tif
del *.TIF
del *.webp
del *.WEBP
popd

popd
mongo --eval "db.dropDatabase()" audio 




