function randomString(length) {
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += str[Math.floor(Math.random() * 62)];
    }
    return code;
}

module.exports = { randomString }