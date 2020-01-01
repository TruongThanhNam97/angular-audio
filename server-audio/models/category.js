const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    }
}, { versionKey: false });

module.exports = mongoose.model('categories', schema);