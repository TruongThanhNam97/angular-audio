var express = require("express");
var router = express.Router();
var multer = require("multer");
var songModel = require("../models/song");
var watermarker = require("../python_scripts/watermarker.js");
var path = require("path");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./assets/original-songs");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "~!~" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(mp3|MP3|wav|WAV)$/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

/* GET home page. */
router.get("/", (req, res, next) => {
    res.render("index", { title: "Express" });
});

/* POST song */
var saveSongMetadata = (req, res, next) => {
    let name = next.split('~!~')[1].split('.')[0].split(';')[0];
    let artist = next.split('~!~')[1].split('.')[0].split(';')[1];
    const newSong = {
        url: next.split('.')[0] + '.wav',
        name,
        artist
    };
    return new songModel(newSong)
        .save()
        .then(song => res.status(200).json({ song }))
        .catch(err => res.status(400).json({ error: err }));
};

var watermark = (req, res, next) => {
    let filename = req.files[0].filename;
    watermarker.Watermark(filename,
        () => saveSongMetadata(req, res, filename),
        (err) => {
            res.status(400).json({ error: err });
        }
    )
}

router.post("/upload", upload.any(), watermark);

/* GET songs */
router.get("/getSongs", (req, res, next) => {
    songModel
        .find({})
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* Download song */
router.get("/download/song", (req, res, next) => {
    const file = path.resolve(__dirname, `../public/watermark-songs/${req.query.nameToDownload}`);
    res.download(file);
});

module.exports = router;
