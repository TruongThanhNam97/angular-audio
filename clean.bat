pushd server-audio
del *.wav
del *.mp3

pushd assets\original-songs
del *.wav
del *.mp3
popd

pushd public\watermark-songs
del *.wav
del *.mp3
popd 
popd
mongo --eval "db.dropDatabase()" audio 




