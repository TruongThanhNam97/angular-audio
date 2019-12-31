var express = require("express");
var router = express.Router();
var multer = require("multer");
var songModel = require("../models/song");
var userModel = require('../models/user');
var watermarker = require("../python_scripts/watermarker.js");
var path = require("path");
var passport = require("passport");

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
router.get("/", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.render("index", { title: "Express" });
});

/* POST song */
var saveSongMetadata = (req, res, next) => {
    let name = next.split('~!~')[1].split('.')[0].split('-')[0];
    let artist = next.split('~!~')[1].split('.')[0].split('-')[1];
    console.log(req.user);
    const newSong = {
        url: next.split('.')[0] + '.wav',
        name,
        artist,
        userId: req.user.id,
        userName: req.user.username
    };
    return new songModel(newSong)
        .save()
        .then(song => res.status(200).json({ song }))
        .catch(err => res.status(400).json({ error: err }));
};

var watermark = (req, res, next) => {
    let filename = req.files[0].filename;
    userModel.findById({ _id: req.user.id }).then(user => {
        if (user.numberOfReup >= 3) {
            res.status(400).json({ error: { err: 'Cannot upload music' } });
        } else {
            watermarker.Watermark(filename,
                () => saveSongMetadata(req, res, filename),
                (err) => {
                    userModel.findById({ _id: req.user.id }).then(user => {
                        let numberOfReup = user.numberOfReup;
                        numberOfReup++;
                        userModel.findOneAndUpdate({ _id: req.user.id }, { $set: { numberOfReup } }, { new: true }).then(updatedUser => {
                            res.status(400).json({ error: { err, numberOfReup: updatedUser.numberOfReup } });
                        });
                    });
                }
            )
        }
    });
}

router.post("/upload", passport.authenticate('jwt', { session: false }), upload.any(), watermark);

/* GET songs */
router.get("/getSongs", (req, res, next) => {
    songModel
        .find({ userId: { $eq: req.query.id } })
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* Download song */
router.get("/download/song", (req, res, next) => {
    const file = path.resolve(__dirname, `../public/watermark-songs/${req.query.nameToDownload}`);
    res.download(file);
});

module.exports = router;
