const configuration = require('../../../../knexfile')[process.env.NODE_ENV || 'development'];
const database      = require('knex')(configuration);
const validate      = require('../../../../helpers/authHelpers.js')(database);

function login(username, password) {
    return validate.userLogin({ username, password })
}

function register(username, password, email) {
    return validate.userRegister({ username, password, email })
}
module.exports = {
    login,
    register
}