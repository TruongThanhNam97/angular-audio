const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    url: String,
    name: String,
    artist: String,
    userId: String,
    userName: String
}, { versionKey: false });

module.exports = mongoose.model('songs', schema);