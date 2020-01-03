const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    url: String,
    name: String,
    artist: String,
    userId: String,
    userName: String,
    categoryId: String,
    status: {
        type: Number,
        default: 0,
        required: true
    }
}, { versionKey: false });

module.exports = mongoose.model('songs', schema);