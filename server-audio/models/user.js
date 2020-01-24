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
    ],
    notifications: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            text: String,
            date: {
                type: Date,
                default: Date.now
            },
            isRead: {
                type: Boolean,
                default: false
            },
            mode: String,
            maintext: String,
            song: String
        }
    ]
}, { versionKey: false });

module.exports = mongoose.model('users', schema);