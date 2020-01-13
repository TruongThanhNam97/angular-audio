const isEmpty = require('./is-empty');
const Validator = require('validator');

module.exports = function validateComment(data) {
    let errors = {};
    data.text = !isEmpty(data.text) ? data.text : '';
    if (Validator.isEmpty(data.text)) {
        errors.text = 'Text name field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}