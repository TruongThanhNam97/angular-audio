var express = require("express");
var router = express.Router();
var multer = require("multer");
var songModel = require("../models/song");
var userModel = require('../models/user');
var artistModel = require('../models/artist');
var watermarker = require("../python_scripts/watermarker.js");
var path = require("path");
var passport = require("passport");
const validateComment = require('../validation/validate-comment');

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
        if (file.originalname.match(/\.(mp3|MP3|wav|WAV|m4A|M4A|flac|FLAC)$/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 60000000
    }
});

/* GET home page. */
router.get("/", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.render("index", { title: "Express" });
});

/* POST song */
var saveSongMetadata = (req, res, data) => {
    const lastIndefOfPoint = data.fileName.lastIndexOf('.');
    const fileName = data.fileName.slice(0, lastIndefOfPoint);
    const count = data.count;
    const arrFilesLength = data.arrFilesLength;
    const newSong = {
        url: `${fileName}.mp3`,
        name: data.name,
        artist: data.artist,
        userId: req.user.id,
        userName: req.user.username
    };
    new songModel(newSong).save().then(song => {
        if (count === arrFilesLength) {
            userModel.findById({ _id: req.user.id }).then(user => {
                res.status(200).json(user);
            }).catch(err => console.log(err));
        }
    });
};

var watermark = (req, res, next) => {
    userModel.findById({ _id: req.user.id }).then(user => {
        if (user.numberOfReup >= 3) {
            res.status(400).json({ error: { err: 'Cannot upload music' } });
        } else {
            watermarker.Watermark(req,
                (data) => saveSongMetadata(req, res, data),
                (err) => {
                    if (err.message.toString().includes('Reup detected')) {
                        const count = err.count;
                        const arrFilesLength = err.arrFilesLength;
                        userModel.findById({ _id: req.user.id }).then(user => {
                            let numberOfReup = user.numberOfReup;
                            numberOfReup++;
                            if (numberOfReup <= 3) {
                                userModel.findOneAndUpdate({ _id: req.user.id }, { $set: { numberOfReup } }, { new: true }).then(user => {
                                    if (count === arrFilesLength || numberOfReup === 3) {
                                        res.status(200).json(user);
                                    }
                                });
                            }
                        });
                    } else {
                        console.log(err.message.toString());
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
        .populate('comments.user', ['_id', 'username', 'avatar'])
        .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
        .select('_id url name artist userId userName categoryId artistId likedUsers comments')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET song by song id*/
router.get("/getSongBySongId", (req, res, next) => {
    songModel
        .findOne({ _id: { $eq: req.query.id }, status: { $eq: 0 } })
        .populate('comments.user', ['_id', 'username', 'avatar'])
        .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
        .select('_id url name artist userId userName categoryId artistId likedUsers comments')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by user id */
router.get("/getSongs", (req, res, next) => {
    if (req.query.favoriteMode === 'true') {
        userModel.findById({ _id: req.query.id })
            // .populate('likedSongs.song', ['_id', 'url', 'name', 'artist', 'userId', 'userName', 'categoryId', 'artistId', 'likedUsers', 'comments'])
            .populate({
                path: 'likedSongs.song',
                select: ['_id', 'url', 'name', 'artist', 'userId', 'userName', 'categoryId', 'artistId', 'likedUsers', 'comments'],
                populate: {
                    path: 'comments.user',
                    select: ['_id', 'username', 'avatar']
                },
                populate: {
                    path: 'comments.subComments.user',
                    select: ['_id', 'username', 'avatar']
                }
            })
            .then(user => {
                if (!user) {
                    return res.status(404).json('User not found');
                }
                res.status(200).json(user.likedSongs);
            }).catch(err => console.log(err));
    } else {
        songModel
            .find({ userId: { $eq: req.query.id }, status: { $eq: 0 } })
            .populate('comments.user', ['_id', 'username', 'avatar'])
            .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
            .select('_id url name artist userId userName categoryId artistId likedUsers comments')
            .then(songs => res.status(200).json(songs))
            .catch(err => res.status(404).json({ notfound: "Not found songs" }));
    }
});

/* GET songs by category id*/
router.get("/getSongsByCategory", (req, res, next) => {
    songModel
        .find({ categoryId: { $eq: req.query.id }, status: { $eq: 0 } })
        .populate('comments.user', ['_id', 'username', 'avatar'])
        .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
        .select('_id url name artist userId userName categoryId artistId likedUsers comments')
        .then(songs => res.status(200).json(songs))
        .catch(err => res.status(404).json({ notfound: "Not found songs" }));
});

/* GET songs by artist id*/
router.get("/getSongsByArtist", (req, res, next) => {
    songModel
        .find({ artistId: { $eq: req.query.id }, status: { $eq: 0 } })
        .populate('comments.user', ['_id', 'username', 'avatar'])
        .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
        .select('_id url name artist userId userName categoryId artistId likedUsers comments')
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
            .populate('comments.user', ['_id', 'username', 'avatar'])
            .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
            .select('_id url name artist userId userName categoryId artistId likedUsers comments')
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
            .populate('comments.user', ['_id', 'username', 'avatar'])
            .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
            .select('_id url name artist userId userName categoryId artistId likedUsers comments')
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
            song.save().then(updatedSong => {
                songModel.findById({ _id: updatedSong._id })
                    .populate('comments.user', ['_id', 'username', 'avatar'])
                    .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                    .then(newSong => res.status(200).json(newSong))
                    .catch(err => console.log(err));
            }).catch(err => console.log(err));
            likeMode = false;
        } else {
            // Like
            song.likedUsers = [...song.likedUsers, { user: req.user._id }];
            song.save().then(updatedSong => {
                songModel.findById({ _id: updatedSong._id })
                    .populate('comments.user', ['_id', 'username', 'avatar'])
                    .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                    .then(newSong => res.status(200).json(newSong))
                    .catch(err => console.log(err));
            }).catch(err => console.log(err));
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

/* Get comments by songId */
router.get("/getComments/:id", (req, res, next) => {
    songModel.findById({ _id: req.params.id })
        .populate('comments.user', ['_id', 'username', 'avatar'])
        .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
        .then(song => {
            if (!song) {
                return res.status(404).json('Song not found');
            }
            res.status(200).json(song);
        }).catch(err => console.log(err));
});

/* Add comment for song */
router.post("/addComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validateComment(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { songId, text } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        song.comments.unshift({ user: req.user._id, text });
        song.save().then(updatedSong => {
            songModel.findById({ _id: updatedSong._id })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Add subComment for comment */
router.post("/addSubComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validateComment(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { songId, text, commentId } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const index = song.comments.findIndex(comment => comment._id.toString() === commentId.toString());
        song.comments[index].subComments.unshift({ user: req.user._id, text });
        song.save().then(updatedSong => {
            songModel.findById({ _id: updatedSong._id })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Edit comment for song */
router.post("/editComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validateComment(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { songId, text, commentId } = req.body;
    songModel.findById({ _id: songId }).populate('comments.user', ['_id']).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        if (comment.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json('Unauthorized');
        }
        comment.text = text;
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        song.comments =
            [...song.comments.filter((v, i) => i < index),
            {
                _id: comment._id,
                text: comment.text,
                user: req.user._id,
                date: comment.date,
                liked: comment.liked,
                unliked: comment.unliked,
                subComments: comment.subComments
            },
            ...song.comments.filter((v, i) => i > index)];
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Edit subComment for comment */
router.post("/editSubComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validateComment(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { songId, text, commentId, subCommentId } = req.body;
    songModel.findById({ _id: songId })
        // .populate('comments.user', ['_id'])
        .populate('comments.subComments.user', ['_id'])
        .then(song => {
            if (!song) {
                return res.status(404).json('Song not found');
            }
            if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
                return res.status(404).json('Comment not found');
            }
            const comment = song.comments.find(com => com._id.toString() === commentId.toString());
            if (comment.subComments.filter(subCom => subCom._id.toString() === subCommentId).length === 0) {
                return res.status(404).json('Subcomment not found');
            }
            const subComment = comment.subComments.find(subCom => subCom._id.toString() === subCommentId.toString());
            if (subComment.user._id.toString() !== req.user._id.toString()) {
                return res.status(401).json('Unauthorized');
            }
            subComment.text = text;
            const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
            const indexSub = song.comments[index].subComments.findIndex(subCom => subCom._id.toString() === subCommentId.toString());
            song.comments[index].subComments[indexSub] = {
                _id: subComment._id,
                text: subComment.text,
                user: req.user._id,
                date: subComment.date,
                liked: subComment.liked,
                unliked: subComment.unliked
            };
            song.save().then(updatedSong => {
                songModel.findById({ _id: songId })
                    .populate('comments.user', ['_id', 'username', 'avatar'])
                    .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                    .then(song => res.status(200).json(song))
                    .catch(err => console.log(err));
            });
        }).catch(err => console.log(err));
});

/* Delete comment in song */
router.post("/deleteComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId } = req.body;
    songModel.findById({ _id: songId }).populate('comments.user', ['_id']).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        if (comment.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json('Unauthorized');
        }
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        song.comments = song.comments.filter((v, i) => i !== index);
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Delete subComment in song */
router.post("/deleteSubComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId, subCommentId } = req.body;
    songModel.findById({ _id: songId })
        .populate('comments.subComments.user', ['_id'])
        .then(song => {
            if (!song) {
                return res.status(404).json('Song not found');
            }
            if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
                return res.status(404).json('Comment not found');
            }
            const comment = song.comments.find(com => com._id.toString() === commentId.toString());
            if (comment.subComments.filter(subCom => subCom._id.toString() === subCommentId.toString()).length === 0) {
                return res.status(404).json('Subcomment not found');
            }
            const subComment = comment.subComments.find(subCom => subCom._id.toString() === subCommentId.toString());
            if (subComment.user._id.toString() !== req.user._id.toString()) {
                return res.status(401).json('Unauthorized');
            }
            const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
            const indexSub = song.comments[index].subComments.findIndex(subCom => subCom._id.toString() === subCommentId.toString());
            song.comments[index].subComments = song.comments[index].subComments.filter((v, i) => i !== indexSub);
            song.save().then(updatedSong => {
                songModel.findById({ _id: songId })
                    .populate('comments.user', ['_id', 'username', 'avatar'])
                    .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                    .then(song => res.status(200).json(song))
                    .catch(err => console.log(err));
            });
        }).catch(err => console.log(err));
});

/* Like comment in song */
router.post("/likeComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        if (comment.liked.filter(like => like.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].liked = song.comments[index].liked.filter(like => like.toString() !== req.user._id.toString());
        } else {
            song.comments[index].liked = [...song.comments[index].liked, req.user._id];
        }
        if (song.comments[index].unliked.filter(unlike => unlike.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].unliked = song.comments[index].unliked.filter(unlike => unlike.toString() !== req.user._id.toString());
        }
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Like subComment in comment */
router.post("/likeSubComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId, subCommentId } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        if (comment.subComments.filter(subCom => subCom._id.toString() === subCommentId.toString()).length === 0) {
            return res.status(404).json('SubComment not found');
        }
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        const subComment = song.comments[index].subComments.find(subCom => subCom._id.toString() === subCommentId.toString());
        const indexSub = song.comments[index].subComments.findIndex(subCom => subCom._id.toString() === subCommentId.toString());
        if (subComment.liked.filter(like => like.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].subComments[indexSub].liked =
                song.comments[index].subComments[indexSub].liked.filter(like => like.toString() !== req.user._id.toString());
        } else {
            song.comments[index].subComments[indexSub].liked = [...song.comments[index].subComments[indexSub].liked, req.user._id];
        }
        if (song.comments[index].subComments[indexSub].unliked.filter(unlike => unlike.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].subComments[indexSub].unliked =
                song.comments[index].subComments[indexSub].unliked.filter(unlike => unlike.toString() !== req.user._id.toString());
        }
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});


/* Unlike comment in song */
router.post("/unlikeComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        if (comment.unliked.filter(unlike => unlike.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].unliked = song.comments[index].unliked.filter(unlike => unlike.toString() !== req.user._id.toString());
        } else {
            song.comments[index].unliked = [...song.comments[index].unliked, req.user._id];
        }

        if (song.comments[index].liked.filter(like => like.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].liked = song.comments[index].liked.filter(like => like.toString() !== req.user._id.toString());
        }
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

/* Unlike subComment in comment */
router.post("/unlikeSubComment", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { songId, commentId, subCommentId } = req.body;
    songModel.findById({ _id: songId }).then(song => {
        if (!song) {
            return res.status(404).json('Song not found');
        }
        if (song.comments.filter(comment => comment._id.toString() === commentId.toString()).length === 0) {
            return res.status(404).json('Comment not found');
        }
        const comment = song.comments.find(com => com._id.toString() === commentId.toString());
        if (comment.subComments.filter(subCom => subCom._id.toString() === subCommentId.toString()).length === 0) {
            return res.status(404).json('SubComment not found');
        }
        const index = song.comments.findIndex(com => com._id.toString() === commentId.toString());
        const subComment = song.comments[index].subComments.find(subCom => subCom._id.toString() === subCommentId.toString());
        const indexSub = song.comments[index].subComments.findIndex(subCom => subCom._id.toString() === subCommentId.toString());
        if (subComment.unliked.filter(unlike => unlike.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].subComments[indexSub].unliked =
                song.comments[index].subComments[indexSub].unliked.filter(unlike => unlike.toString() !== req.user._id.toString());
        } else {
            song.comments[index].subComments[indexSub].unliked = [...song.comments[index].subComments[indexSub].unliked, req.user._id];
        }

        if (song.comments[index].subComments[indexSub].liked.filter(like => like.toString() === req.user._id.toString()).length > 0) {
            song.comments[index].subComments[indexSub].liked =
                song.comments[index].subComments[indexSub].liked.filter(like => like.toString() !== req.user._id.toString());
        }
        song.save().then(updatedSong => {
            songModel.findById({ _id: songId })
                .populate('comments.user', ['_id', 'username', 'avatar'])
                .populate('comments.subComments.user', ['_id', 'username', 'avatar'])
                .then(song => res.status(200).json(song))
                .catch(err => console.log(err));
        });
    }).catch(err => console.log(err));
});

module.exports = router;
