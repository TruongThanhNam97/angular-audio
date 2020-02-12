const express = require('express');
const router = express.Router();

const passport = require("passport"); // authorize user

const validateUploadArtists = require('../validation/upload-artist');

const artistsModel = require('../models/artist');

var multer = require("multer");

const controlCharacters = /[!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]+/;

const Resize = require('../features/resize');
const path = require('path');

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/images");
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });

var upload = multer({
    // storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            validateExtensionsFile(file, 'image')
            && validateFileNameLength(file)
            && validateNumberOfExtensions(file)
            && validateControlCharacters(file)
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const validateFileNameLength = (file) => {
    return file.originalname.length <= 150;
};

const validateNumberOfExtensions = (file) => {
    return file.originalname.split('.').length === 2;
};

const validateControlCharacters = (file) => {
    return !controlCharacters.test(file.originalname);
};

const validateExtensionsFile = (file, mode) => {
    if (mode === 'audio') {
        return file.originalname.match(/\.(mp3|MP3|wav|WAV|m4a|M4A|flac|FLAC)$/);
    }
    if (mode === 'video') {
        return file.originalname.match(/\.(mp4|MP4)$/);
    }
    if (mode === 'image') {
        return file.originalname.match(/\.(jpg|JPG|png|PNG|jpeg|JPEG|webp|WEBP)$/);
    }
};

//@route    POST /artists/upload
//@desc     Upload artists
//@access   Private - Only Admin
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.any(), async (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized');
    }
    const { errors, isValid } = validateUploadArtists(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    // Handle image
    let filename = '';
    if (req.files[0]) {
        const imagePath = path.join(__dirname, '../public/images');
        const fileUpload = new Resize(imagePath, req.files[0].originalname);
        filename = await fileUpload.save(req.files[0].buffer);
    }
    const { name } = req.body;
    artistsModel.findOne({ name }).then(artist => {
        if (artist) {
            errors.name = 'Artist name already exists';
            res.status(400).json(errors);
        } else {
            const artist = { name };
            if (req.files[0]) artist.avatar = filename;
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
router.post('/update', passport.authenticate('jwt', { session: false }), upload.any(), async (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized')
    }
    const { errors, isValid } = validateUploadArtists(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    // Handle image
    let filename = '';
    if (req.files[0]) {
        const imagePath = path.join(__dirname, '../public/images');
        const fileUpload = new Resize(imagePath, req.files[0].originalname);
        filename = await fileUpload.save(req.files[0].buffer);
    }
    const { id, name } = req.body;
    if (req.files[0]) {
        artistsModel.findOneAndUpdate({ _id: id }, { $set: { name, avatar: filename } }, { new: true })
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


//@route    GET /artists/getArtistById
//@desc     Get artist by artist id
//@access   Public
router.get('/getArtistById', (req, res, next) => {
    artistsModel.find({ status: { $eq: 0 }, _id: { $eq: req.query.id } })
        .select('_id name avatar')
        .then(artists => res.status(200).json(artists))
        .catch(err => res.status(400).json(err));
});



module.exports = router;