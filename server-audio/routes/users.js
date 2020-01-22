const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");   // hash password
const jwt = require("jsonwebtoken");  // generate token
const passport = require("passport"); // authorize user

// Load Input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

const userModel = require('../models/user');

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

//@route    GET /users/
//@desc     GET all users
//@access   Public
router.get('/', (req, res, next) => {
  userModel.find({ numberOfReup: { $lt: 3 }, username: { $ne: 'superadmin' } })
    .select('username avatar')
    .then(users => res.status(200).json(users))
    .catch(() => res.status(404).json({ notFound: 'Users not found' }));
});

//@route    GET /users/getAllUsers
//@desc     GET all users
//@access   Private
router.get('/getAllUsers', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (req.user.username !== 'superadmin') {
    return res.status(401).json('Unauthorized');
  }
  userModel.find({ username: { $ne: 'superadmin' } })
    .select('_id username avatar numberOfReup')
    .then(users => res.status(200).json(users))
    .catch(() => res.status(404).json({ notFound: 'Users not found' }));
});

//@route    POST /users/register
//@desc     Register user
//@access   Public
router.post('/register', upload.any(), (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { username, password } = req.body;
  userModel.findOne({ username: username }).then(user => {
    if (user) {
      errors.username = 'Username already exists';
      res.status(400).json(errors);
    } else {
      const user = { username, password };
      if (req.files[0]) user.avatar = req.files[0].filename;
      const newUser = new userModel(user);
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => res.status(200).json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route    POST /users/login
//@desc     Login User / Returning JWT Token
//@access   Public
router.post('/login', (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { username, password } = req.body;
  // Find user by username
  userModel.findOne({ username }).then(user => {
    // Check for user
    if (!user) {
      errors.username = 'User not found';
      return res.status(404).json(errors);
    }
    if (user.numberOfReup >= 3) {
      errors.message = 'Your account is banned';
      return res.status(400).json(errors);
    }
    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
          username: user.username,
          numberOfReup: user.numberOfReup
        };
        if (user.avatar) payload.avatar = user.avatar;
        // Sign Token
        jwt.sign(payload, 'namkhuong', { expiresIn: 3600 }, (err, token) => {
          res.status(200).json({
            success: true,
            token: 'Bearer ' + token
          });
        });
      } else {
        errors.password = 'Password incorrect';
        res.status(400).json(errors);
      }
    });
  });
});

//@route    POST /users/update
//@desc     Update user
//@access   Private
router.post('/update', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const { id, password, oldpassword } = req.body;
  userModel.findOne({ _id: id }).then(user => {
    if (!user) {
      return res.status(404).json('User Not Found');
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json('Unauthorized');
    } else {
      bcrypt.compare(oldpassword, req.user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(400).json({ password: 'Old password is incorrect' });
        }
        const user = { password };
        if (req.files[0]) user.avatar = req.files[0].filename;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            userModel.findOneAndUpdate({ _id: id }, { $set: user }, { new: true })
              .then(user => {
                const payload = {
                  id: user.id,
                  username: user.username,
                  numberOfReup: user.numberOfReup
                };
                if (user.avatar) payload.avatar = user.avatar;
                // Sign Token
                jwt.sign(payload, 'namkhuong', { expiresIn: 3600 }, (err, token) => {
                  res.status(200).json({
                    success: true,
                    token: 'Bearer ' + token
                  });
                });
              }).catch(err => console.log(err));
          });
        });
      });
    }
  });
});

//@route    POST /users/unban
//@desc     Unban user
//@access   Private
router.post('/unban', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
  if (req.user.username !== 'superadmin') {
    return res.status(401).json('Unauthorized');
  }
  const { id } = req.body;
  userModel.findOne({ _id: id }).then(user => {
    if (!user) {
      return res.status(404).json('User not found');
    }
    if (user.username === 'superadmin') {
      return res.status(401).json('Not allow');
    }
    if (user.numberOfReup !== 3) {
      return res.status(400).json('User have not banned yet');
    }
    userModel.findOneAndUpdate({ _id: id }, { $set: { numberOfReup: 2 } }, { new: true })
      .select('_id username avatar numberOfReup')
      .then(user => res.status(200).json(user))
      .catch(err => console.log(err));
  }).catch(err => console.log(err));
});

//@route    POST /users/ban
//@desc     Ban user
//@access   Private
router.post('/ban', passport.authenticate('jwt', { session: false }), upload.any(), (req, res, next) => {
  if (req.user.username !== 'superadmin') {
    return res.status(401).json('Unauthorized');
  }
  const { id } = req.body;
  userModel.findOne({ _id: id }).then(user => {
    if (!user) {
      return res.status(404).json('User not found');
    }
    if (user.numberOfReup === 3) {
      return res.status(400).json('User have already banned');
    }
    if (user.username === 'superadmin') {
      return res.status(401).json('Not allow');
    }
    userModel.findOneAndUpdate({ _id: id }, { $set: { numberOfReup: 3 } }, { new: true })
      .select('_id username avatar numberOfReup')
      .then(user => res.status(200).json(user))
      .catch(err => console.log(err));
  }).catch(err => console.log(err));
});

//@route    GET /users/
//@desc     GET all users
//@access   Public
router.get('/getUserById', (req, res, next) => {
  userModel.findById({ _id: req.query.id })
    .select('avatar username')
    .then(user => res.status(200).json(user))
    .catch(() => res.status(404).json({ notFound: 'Users not found' }));
});


module.exports = router;
