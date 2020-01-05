const express = require('express');
const router = express.Router();

const passport = require("passport"); // authorize user

const validateUploadArtists = require('../validation/upload-artist');

const artistsModel = require('../models/artist');

var multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(jpg|JPG|png|PNG|tif|TIF|gif|GIF)$/)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

//@route    POST /artists/upload
//@desc     Upload artists
//@access   Private - Only Admin
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized');
    }
    const { errors, isValid } = validateUploadArtists(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { name } = req.body;
    artistsModel.findOne({ name }).then(artist => {
        if (artist) {
            errors.name = 'Artist name already exists';
            res.status(400).json(errors);
        } else {
            const artist = { name };
            if (req.files[0]) artist.avatar = req.files[0].filename;
            const newArtist = new artistsModel(artist);
            newArtist.save()
                .then(artist => res.status(200).json(artist))
                .catch(err => console.log(err));
        }
    });
});

//@route    POST /artists/update
//@desc     Update artist
//@access   Private - Only Admin
router.post('/update', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized')
    }
    const { errors, isValid } = validateUploadArtists(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { id, name } = req.body;
    if (req.files[0]) {
        artistsModel.findOneAndUpdate({ _id: id }, { $set: { name, avatar: req.files[0].filename } }, { new: true })
            .select('_id name avatar')
            .then(artist => res.status(200).json(artist));
    } else {
        artistsModel.findOneAndUpdate({ _id: id }, { $set: { name } }, { new: true })
            .select('_id name avatar')
            .then(artist => res.status(200).json(artist));
    }
});

//@route    POST /artists/delete
//@desc     Delete artist
//@access   Private - Only Admin
router.post('/delete', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized');
    }
    artistsModel.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }, { new: true })
        .select('_id name avatar')
        .then(artist => res.status(200).json(artist));
});

//@route    GET /artists/getArtists
//@desc     Get all artists
//@access   Public
router.get('/getArtists', (req, res, next) => {
    artistsModel.find({ status: { $eq: 0 } })
        .select('_id name avatar')
        .then(artists => res.status(200).json(artists))
        .catch(err => res.status(400).json(err));
});


module.exports = router;