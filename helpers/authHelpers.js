const bcrypt = require('bcrypt');

function authHelpers(database) {
  const dataHelpers = require('./dataHelpers.js')(database);

  const userLogin = (data) => {
    return dataHelpers.getUser(data.email).then(user => {
      if (user.length === 1) {
        if (bcrypt.compareSync(data.password, user[0].password)) {
          return user[0];
        } else {
          throw new Error('invalid password')
        }
      } else {
        throw new Error('invalid username')
      }
    })
  };

  const userRegister = (data) => {
    data.password = bcrypt.hashSync(data.password, 10)
    return dataHelpers.registerUser(data).catch(e => {
      if (e.code == 23505) throw new Error('user already exist!')
    })
  };

  const userDetail = (data) => {
    return dataHelpers.getUser(data.email).then(user => {
      if (user.length === 1) {
        const{password, ...rest} =  user[0] || {};
        return rest;
      } else {
        throw new Error('invalid user')
      }
    })
  };

  return  {
    userLogin,
    userRegister,
    userDetail
  }
}

module.exports = authHelpers;


//return