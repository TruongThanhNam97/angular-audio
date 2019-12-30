const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");   // hash password
const jwt = require("jsonwebtoken");  // generate token
const passport = require("passport"); // authorize user

// Load Input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

const userModel = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//@route    POST /users/register
//@desc     Register user
//@access   Public
router.post('/register', (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  userModel.findOne({ username: req.body.username }).then(user => {
    if (user) {
      errors.username = 'Username already exists';
      res.status(400).json(errors);
    } else {
      const newUser = new userModel({
        username: req.body.username,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(user => res.status(200).json(user)).catch(err => console.log(err));
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
          username: user.username
        };
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

module.exports = router;
