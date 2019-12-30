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
    }
}, { versionKey: false });

module.exports = mongoose.model('users', schema);