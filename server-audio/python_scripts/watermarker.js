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
                ["-W ignore", Path.resolve(__dirname, 'watermark.py'), listFiles[i].filename, req.user._id, req.user.username],
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
                on_error({ message: data.toString(), count, arrFilesLength, filename: listFiles[i].filename });
            })
        }
    }

    readWatermark(req, next = null, on_error = null) {
        const listFiles = req.files;
        let arrFilesLength = req.files.length;
        for (let i = 0; i < arrFilesLength; i++) {
            const pyWatermarker = spawn(
                'py',
                ["-W ignore", Path.resolve(__dirname, 'readWatermark.py'), listFiles[i].filename],
                {
                    cwd: __dirname
                });
            pyWatermarker.stdout.on('data', (data) => {
                let result = JSON.parse(data.toString());
                if (result) {
                        next(result);
                } else {
                    on_error({ message: "Something's wrong" });
                }
            });
            pyWatermarker.stderr.on('data', (data) => {
                on_error({ message: data.toString() });
            })
        }
    }
}

module.exports = new Watermarker();