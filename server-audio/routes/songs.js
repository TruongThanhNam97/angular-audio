var express = require("express");
var router = express.Router();
var multer = require("multer");
var songModel = require("../models/song");
var userModel = require('../models/user');
var artistModel = require('../models/artist');
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
        if (file.originalname.match(/\.(mp3|MP3|wav|WAV|m4A|M4A|flac|FLAC|mp4|MP4)$/)) {
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
    const lastIndefOfPoint = next.lastIndexOf('.');
    const fileName = next.slice(0, lastIndefOfPoint);
    const newSong = {
        url: `${fileName}.mp3`,
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
                    if (err.toString().includes('Reup detected')) {
                        userModel.findById({ _id: req.user.id }).then(user => {
                            let numberOfReup = user.numberOfReup;
                            numberOfReup++;
                            if (numberOfReup > 3) {
                                return res.status(400).json({ error: { err: 'Cannot upload music' } });
                            }
                            userModel.findOneAndUpdate({ _id: req.user.id }, { $set: { numberOfReup } }, { new: true })
                                .then(updatedUser => {
                                    res.status(400).json({ error: { err: `${req.body.name}: Reup Detected`, numberOfReup: updatedUser.numberOfReup } });
                                });
                        });
                    } else {
                        console.log(err.toString());
                        res.status(400).json({ error: { err: err.toString() } });
                    }
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
        .select('_id url name artist userId userName categoryId artistId likedUsers')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by user id */
router.get("/getSongs", (req, res, next) => {
    if (req.query.favoriteMode === 'true') {
        userModel.findById({ _id: req.query.id })
            .populate('likedSongs.song', ['_id', 'url', 'name', 'artist', 'userId', 'userName', 'categoryId', 'artistId', 'likedUsers'])
            .then(user => {
                if (!user) {
                    return res.status(404).json('User not found');
                }
                res.status(200).json(user.likedSongs);
            }).catch(err => console.log(err));
    } else {
        songModel
            .find({ userId: { $eq: req.query.id }, status: { $eq: 0 } })
            .select('_id url name artist userId userName categoryId artistId likedUsers')
            .then(songs => res.status(200).json(songs))
            .catch(err => res.status(404).json({ notfound: "Not found songs" }));
    }
});

/* GET songs by category id*/
router.get("/getSongsByCategory", (req, res, next) => {
    songModel
        .find({ categoryId: { $eq: req.query.id }, status: { $eq: 0 } })
        .select('_id url name artist userId userName categoryId artistId likedUsers')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by artist id*/
router.get("/getSongsByArtist", (req, res, next) => {
    songModel
        .find({ artistId: { $eq: req.query.id }, status: { $eq: 0 } })
        .select('_id url name artist userId userName categoryId artistId likedUsers')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* UPDATE songs */
router.post("/edit-song", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { id, name, artist, categoryId, artistId } = req.body;
    songModel.findOne({ _id: id }).then(song => {
        if (song.userId.toString() !== req.user._id.toString() && req.user.username !== 'superadmin') {
            return res.status(401).json('Unauthorized');
        }
        songModel.findOneAndUpdate({ _id: id }, { $set: { name, artist, categoryId, artistId } }, { new: true })
            .select('_id url name artist userId userName categoryId artistId likedUsers')
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
            .select('_id url name artist userId userName categoryId artistId likedUsers')
            .then(song => res.status(200).json({})).catch(err => console.log(err));
    });
});

/* Download song */
router.get("/download/song", (req, res, next) => {
    const file = path.resolve(__dirname, `../public/watermark-songs/${req.query.typeFile}/${req.query.nameToDownload}`);
    res.download(file);
});


/* Like song */
router.post("/like-song", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { id } = req.body;
    songModel.findById({ _id: id }).then(song => {
        if (!song) {
            return res.status(404).json('Not found');
        }
        let likedUsers = [...song.likedUsers];
        let likeMode = true;
        if (likedUsers.filter(like => like.user.toString() === req.user._id.toString()).length > 0) {
            // Unlike
            const index = likedUsers.findIndex(like => like.user.toString() === req.user._id.toString());
            song.likedUsers = song.likedUsers.filter((like, i) => i !== index);
            song.save().then(updatedSong => res.status(200).json(updatedSong)).catch(err => console.log(err));
            likeMode = false;
        } else {
            // Like
            song.likedUsers = [...song.likedUsers, { user: req.user._id }];
            song.save().then(updatedSong => res.status(200).json(updatedSong)).catch(err => console.log(err));
        }

        userModel.findById({ _id: req.user._id }).then(user => {
            if (user) {
                let likedSongs = [...user.likedSongs];
                if (!likeMode) {
                    // Unlike
                    const index = likedSongs.findIndex(like => like.song.toString() === song._id.toString());
                    user.likedSongs = user.likedSongs.filter((like, i) => i !== index);
                    user.save();
                } else {
                    // Like
                    user.likedSongs = [...user.likedSongs, { song: song._id }];
                    user.save();
                }
            }
        }).catch(err => console.log(err));

    }).catch(err => console.log(err));
});

/* Block song */
router.post("/block-song", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { id } = req.body;
    songModel.findById({ _id: id }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        let blockMode = true;
        userModel.findById({ _id: req.user._id }).then(user => {
            if (!user) {
                return res.status(404).json('User not found');
            }
            let blockedSongs = [...user.blockedSongs];
            let blockedUsers = [...song.blockedUsers];
            if (blockedSongs.filter(block => block.song.toString() === id.toString()).length > 0) {
                // Unblock
                blockMode = false;
                let index = blockedSongs.findIndex(block => block.song.toString() === id.toString());
                user.blockedSongs = blockedSongs.filter((block, i) => i !== index);
                user.save()
                    .then(user => res.status(200).json(user.blockedSongs.map(block => (block.song))))
                    .catch(err => console.log(err));

                index = blockedUsers.findIndex(block => block.user.toString() === req.user._id.toString());
                song.blockedUsers = blockedUsers.filter((block, i) => i !== index);
                song.save();
            } else {
                // block
                user.blockedSongs = [...blockedSongs, { song: id }];
                user.save()
                    .then(user => res.status(200).json(user.blockedSongs.map(block => (block.song))))
                    .catch(err => console.log(err));
                song.blockedUsers = [...blockedUsers, { user: req.user._id }];
                song.save();
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

/* GET blocked songs of user */
router.get('/getBlockedSongs', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    userModel.findById({ _id: req.user._id }).populate('blockedSongs.song', ['name', 'artist']).then(user => {
        if (!user) {
            return res.status(404).json('User not found');
        }
        res.status(200).json(user.blockedSongs.map(block => ({ id: block.song._id, name: block.song.name, artist: block.song.artist })));
    }).catch(err => console.log(err));
});

module.exports = router;
