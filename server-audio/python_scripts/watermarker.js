const fs = require('fs');
const spawn = require('child_process').spawn;


class Watermarker {
    constructor() {

    }

    Watermark(file_path, next = null, on_error = null) {
        var pyWatermarker = spawn('py', ['./python_scripts/test.py', file_path]);
        pyWatermarker.stdout.on('data', (data) => {
            if (data.toString().includes("OK"))
                return next();
        });
        pyWatermarker.stderr.on('data', (data) => {
            const length = file_path.split('~!~').length;
            on_error(`${file_path.split('~!~')[length - 1]} : Reup Detected`);
        })
    }
}

module.exports = new Watermarker();