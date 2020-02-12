const express = require('express');
const router = express.Router();

const passport = require("passport"); // authorize user

const validateUploadCategories = require('../validation/upload-category');

const categoriesModel = require('../models/category');

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

//@route    POST /categories/upload
//@desc     Upload categories
//@access   Private - Only Admin
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.any(), async (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized');
    }
    const { errors, isValid } = validateUploadCategories(req.body);
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
    categoriesModel.findOne({ name }).then(category => {
        if (category) {
            errors.name = 'Category name already exists';
            res.status(400).json(errors);
        } else {
            const category = { name };
            if (req.files[0]) category.avatar = filename;
            const newCategory = new categoriesModel(category);
            newCategory.save()
                .then(category => res.status(200).json(category))
                .catch(err => console.log(err));
        }
    });
});

//@route    POST /categories/update
//@desc     Update category
//@access   Private - Only Admin
router.post('/update', passport.authenticate('jwt', { session: false }), upload.any(), async (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized')
    }
    const { errors, isValid } = validateUploadCategories(req.body);
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
        categoriesModel.findOneAndUpdate({ _id: id }, { $set: { name, avatar: filename } }, { new: true })
            .select('_id name avatar')
            .then(category => res.status(200).json(category));
    } else {
        categoriesModel.findOneAndUpdate({ _id: id }, { $set: { name } }, { new: true })
            .select('_id name avatar')
            .then(category => res.status(200).json(category));
    }
});

//@route    POST /categories/delete
//@desc     Delete category
//@access   Private - Only Admin
router.post('/delete', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.username !== 'superadmin') {
        return res.status(401).json('Unauthorized');
    }
    categoriesModel.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }, { new: true })
        .select('_id name avatar')
        .then(category => res.status(200).json(category));
});

//@route    GET /categories/getCategories
//@desc     Get categories
//@access   Public
router.get('/getCategories', (req, res, next) => {
    categoriesModel.find({ status: { $eq: 0 } })
        .select('_id name avatar')
        .then(categories => res.status(200).json(categories))
        .catch(err => res.status(400).json(err));
});

//@route    GET /categories/getCategoryById
//@desc     Get category by category id
//@access   Public
router.get('/getCategoryById', (req, res, next) => {
    categoriesModel.find({ status: { $eq: 0 }, _id: { $eq: req.query.id } })
        .select('_id name avatar')
        .then(categories => res.status(200).json(categories))
        .catch(err => res.status(400).json(err));
});



module.exports = router;