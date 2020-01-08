const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    listSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'songs'
        }
    ],
    status: {
        type: Number,
        required: true,
        default: 0
    }
}, { versionKey: false });

module.exports = mongoose.model('playlists', schema);