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
    const newSong = {
        url: next.split('.')[0] + '.wav',
        name: req.body.name,
        artist: req.body.artist,
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
                        userModel.findOneAndUpdate({ _id: req.user.id }, { $set: { numberOfReup } }, { new: true })
                            .then(updatedUser => {
                                res.status(400).json({ error: { err: `${req.body.name}: Reup Detected`, numberOfReup: updatedUser.numberOfReup } });
                            });
                    });
                }
            )
        }
    });
}

router.post("/upload", passport.authenticate('jwt', { session: false }), upload.any(), watermark);

/* GET all songs */
router.get("/getAllSongs", (req, res, next) => {
    songModel
        .find({ status: { $eq: 0 } })
        .select('_id url name artist userId userName categoryId')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by user id */
router.get("/getSongs", (req, res, next) => {
    songModel
        .find({ userId: { $eq: req.query.id }, status: { $eq: 0 } })
        .select('_id url name artist userId userName categoryId')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by category id*/
router.get("/getSongsByCategory", (req, res, next) => {
    songModel
        .find({ categoryId: { $eq: req.query.id }, status: { $eq: 0 } })
        .select('_id url name artist userId userName categoryId')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* UPDATE songs */
router.post("/edit-song", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { id, name, artist, categoryId } = req.body;
    songModel.findOne({ _id: id }).then(song => {
        if (song.userId.toString() !== req.user._id.toString() && req.user.username !== 'superadmin') {
            return res.status(401).json('Unauthorized');
        }
        songModel.findOneAndUpdate({ _id: id }, { $set: { name, artist, categoryId } }, { new: true })
            .select('_id url name artist userId userName categoryId')
            .then(song => res.status(200).json(song)).catch(err => console.log(err));
    });
});

/* DELETE songs */
router.post("/delete-song", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { id } = req.body;
    songModel.findOne({ _id: id }).then(song => {
        if (song.userId.toString() !== req.user._id.toString() && req.user.username !== 'superadmin') {
            return res.status(401).json('Unauthorized');
        }
        songModel.findOneAndUpdate({ _id: id }, { $set: { status: 1 } }, { new: true })
            .select('_id url name artist userId userName categoryId')
            .then(song => res.status(200).json({})).catch(err => console.log(err));
    });
});

/* Download song */
router.get("/download/song", (req, res, next) => {
    const file = path.resolve(__dirname, `../public/watermark-songs/${req.query.nameToDownload}`);
    res.download(file);
});

module.exports = router;
