const isEmpty = require('./is-empty');
const Validator = require('validator');

module.exports = function validateUpdateUser(data) {
    let errors = {};
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';
    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be between 6 and 30 characters';
    }
    if (Validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm password field is required';
    }
    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Password must match';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}