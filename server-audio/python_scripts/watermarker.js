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
            on_error(data);
        })
    }
}

module.exports = new Watermarker();