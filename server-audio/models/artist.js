const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    status: {
        type: Number,
        default: 0,
        required: true
    }
}, { versionKey: false });

module.exports = mongoose.model('artists', schema);