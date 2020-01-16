const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    url: String,
    name: String,
    artist: String,
    userId: String,
    userName: String,
    categoryId: String,
    artistId: String,
    status: {
        type: Number,
        default: 0,
        required: true
    },
    likedUsers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    blockedUsers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    listPlayLists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'playlists'
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            liked: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users'
                }
            ],
            unliked: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users'
                }
            ],
            subComments: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'users'
                    },
                    text: {
                        type: String,
                        required: true
                    },
                    date: {
                        type: Date,
                        default: Date.now
                    },
                    liked: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'users'
                        }
                    ],
                    unliked: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'users'
                        }
                    ]
                }
            ]
        }
    ]
}, { versionKey: false });

module.exports = mongoose.model('songs', schema);