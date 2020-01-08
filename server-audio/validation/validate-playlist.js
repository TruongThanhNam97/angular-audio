const isEmpty = require('./is-empty');
const Validator = require('validator');

module.exports = function validatePlayList(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    if (Validator.isEmpty(data.name)) {
        errors.name = 'Playlist name field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}