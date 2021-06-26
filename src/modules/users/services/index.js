const configuration = require('../../../../knexfile')[process.env.NODE_ENV || 'development'];
const database      = require('knex')(configuration);
const validate      = require('../../../../helpers/authHelpers.js')(database);
const dataHelpers = require('../../../../helpers/dataHelpers.js')(database);

function login(email, password) {
    return validate.userLogin({ email, password })
}

function getUser(email) {
    return validate.userDetail({ email})
}

function register(username, password, email) {
    return validate.userRegister({ username, password, email })
}

function createLink(roomData) {
    return dataHelpers.newGameAndRoom(roomData)
}
function getLinkDetails(url) {
    return dataHelpers.getLinkDetails(url)
}
module.exports = {
    login,
    register,
    getUser,
    createLink,
    getLinkDetails
}