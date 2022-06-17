const User = require('../models/User');
const jwt = require('jsonwebtoken');

const PRIVATE_KEY_DB = 'asdfasdfasdfasdfasd';

const validate_user = async encrypt_token => {
  if (encrypt_token) {
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);

    if (!token) {
      return [false, 'The token is no more valid!', null];
    }
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    const user = await User.findOne({ _id: token._id.$oid });
    if (!user) {
      return [false, 'User is not registered!', null];
    }

    return [true, '', user];
  }

  return [false, 'no token, you need to login', null];
};

module.exports = {
  validate_user,
  PRIVATE_KEY_DB,
};
