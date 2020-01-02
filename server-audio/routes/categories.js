const express = require('express');
const router = express.Router();

const passport = require("passport"); // authorize user

const validateUploadCategories = require('../validation/upload-category');

const categoriesModel = require('../models/category');

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

//@route    POST /categories/upload
//@desc     Upload categories
//@access   Private
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
    const { errors, isValid } = validateUploadCategories(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { name } = req.body;
    categoriesModel.findOne({ name }).then(category => {
        if (category) {
            errors.name = 'Category name already exists';
            res.status(400).json(errors);
        } else {
            const category = { name };
            if (req.files[0]) category.avatar = req.files[0].filename;
            const newCategory = new categoriesModel(category);
            newCategory.save().then(category => res.status(200).json(category)).catch(err => console.log(err));
        }
    });
});

//@route    POST /categories/update
//@desc     Update category
//@access   Private
router.post('/update', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
    const { errors, isValid } = validateUploadCategories(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { id, name } = req.body;
    if (req.files[0]) {
        categoriesModel.findOneAndUpdate({ _id: id }, { $set: { name, avatar: req.files[0].filename } }, { new: true }).select('_id name avatar').then(
            category => res.status(200).json(category)
        );
    } else {
        categoriesModel.findOneAndUpdate({ _id: id }, { $set: { name } }, { new: true }).select('_id name avatar').then(
            category => res.status(200).json(category)
        );
    }
});

//@route    POST /categories/delete
//@desc     Delete category
//@access   Private
router.post('/delete', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    categoriesModel.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }, { new: true }).select('_id name avatar').then(
        category => res.status(200).json(category)
    );
});

//@route    GET /categories/getCategories
//@desc     Upload categories
//@access   Public
router.get('/getCategories', (req, res, next) => {
    categoriesModel.find({ status: { $eq: 0 } }).select('_id name avatar').then(categories => res.status(200).json(categories)).catch(err => res.status(400).json(err));
});





module.exports = router;