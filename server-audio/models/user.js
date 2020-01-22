const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    numberOfReup: {
        type: Number,
        required: true,
        default: 0
    },
    avatar: {
        type: String,
        required: false
    },
    likedSongs: [
        {
            song: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'songs'
            }
        }
    ],
    blockedSongs: [
        {
            song: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'songs'
            }
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ]
}, { versionKey: false });

module.exports = mongoose.model('users', schema);