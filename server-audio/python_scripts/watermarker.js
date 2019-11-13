const fs = require('fs');
const spawn = require('child_process').spawn;


class Watermarker {
    constructor(){
        
    }

    Watermark(file_path, next = null, on_error = null){
        var pyWatermarker = spawn('py',[ './python_scripts/test.py', file_path]);
        pyWatermarker.stdout.on('data',(data) => {
            console.log("Message : " + data.toString() );
            if( data.toString().includes("OK") )
                next();
        });
        pyWatermarker.stderr.on('data',(data) => {
            console.log('Error while watermarking:');
            console.log('Error :' + data.toString());
            on_error( data.toString() );
        })
    }
}

module.exports = new Watermarker();