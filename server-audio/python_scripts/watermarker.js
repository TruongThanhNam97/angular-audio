const fs = require('fs');
const spawn = require('child_process').spawn;


class Watermarker {
    constructor(){
        
    }

    Watermark(file_path){
        console.log('start py');
        var pyWatermarker = spawn('py',[ './python_scripts/test.py',  ]);
        pyWatermarker.stdout.on('data',(data) => {
            console.log('Message : ' + data.toString());
        });
        pyWatermarker.stderr.on('data',(data) => {
            console.log('Error while watermarking:');
            console.log('Error :' + data.toString());
        })
        console.log('end py');
    }
}

module.exports = new Watermarker();