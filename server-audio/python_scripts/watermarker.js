const fs = require('fs');
const spawn = require('child_process').spawn;
const Path = require("path");


class Watermarker {
    constructor() {

    }

    Watermark(req, next = null, on_error = null) {
        const listFiles = req.files;
        const arrNameArtist = JSON.parse(req.body.arrNameArtist);
        const arrSongContent = JSON.parse(req.body.arrSongContent);
        let count = 0;
        let arrFilesLength = req.files.length;
        for (let i = 0; i < arrFilesLength; i++) {
            const pyWatermarker = spawn(
                'py',
                [Path.resolve(__dirname, 'watermark.py'), listFiles[i].filename, req.user._id, req.user.username],
                {
                    cwd: __dirname
                });
            pyWatermarker.stdout.on('data', (data) => {
                if (data.toString().includes("OK")) {
                    count++;
                    const obj = {
                        name: arrNameArtist[i].name,
                        artist: arrNameArtist[i].artist,
                        fileName: listFiles[i].filename,
                        count,
                        arrFilesLength,
                        detail: arrSongContent[i]
                    };
                    next(obj);
                }
            });
            pyWatermarker.stderr.on('data', (data) => {
                count++;
                on_error({ message: data.toString(), count, arrFilesLength });
            })
        }
    }

    readWatermark(req, next= null, on_error = null){
        const listFiles = req.files;
        let count = 0;
        let arrFilesLength = req.files.length;
        for (let i = 0; i < arrFilesLength; i++) {
            const pyWatermarker = spawn(
                'py',
                [Path.resolve(__dirname, 'readWatermark.py'), listFiles[i].filename],
                {
                    cwd: __dirname
                });
            pyWatermarker.stdout.on('data', (data) => {
                let result = JSON.parse(data.toString()) ;
                if(result){                  
                    let message = "Something's wrong";
                    if( result.message ){
                        message = result.message;
                        console.log(result);
                    }
                    if( result.error && result.error == false )
                        next(result);
                    else
                        on_error({ message: "Something's wrong", count, arrFilesLength });
                }
                on_error({ message: "Something's wrong", count, arrFilesLength });
            });
            pyWatermarker.stderr.on('data', (data) => {
                count++;
                on_error({ message: data.toString(), count, arrFilesLength });
            })
        }
    }
}

module.exports = new Watermarker();