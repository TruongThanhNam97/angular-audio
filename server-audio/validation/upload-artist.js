const isEmpty = require('./is-empty');
const Validator = require('validator');

module.exports = function validateUploadArtists(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    if (Validator.isEmpty(data.name)) {
        errors.name = 'Artist name field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}