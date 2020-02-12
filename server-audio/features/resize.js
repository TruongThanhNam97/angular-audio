const sharp = require('sharp');
const path = require('path');

class Resize {
    constructor(folder, filename) {
        this.folder = folder;
        this.filename = filename;
    }

    async save(buffer) {
        const filename = this.fileName();
        const filepath = this.filepath(filename);

        await sharp(buffer)
            .resize(300, 300, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(filepath);

        return filename;
    }

    fileName() {
        return `${this.randomString(20)}.${this.filename.split('.')[1]}`;
    }

    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }

    randomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}
module.exports = Resize;