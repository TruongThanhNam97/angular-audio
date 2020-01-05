pushd server-audio
del *.wav
del *.WAV
del *.mp3
del *.MP3

pushd assets\original-songs
del *.wav
del *.mp3
del *.MP3
del *.WAV
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

pushd public\images
del *.jpg
del *.JPG
del *.PNG
del *.png
del *.gif
del *.GIF
del *.tif
del *.TIF
popd

popd
mongo --eval "db.dropDatabase()" audio 




