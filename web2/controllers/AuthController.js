const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');

const util = require('./util');

const set_username = async (req, res, next) => {
  const newUsername = req.body.newUsername;
  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const newUser = await User.findOne({ name: newUsername });

  if (newUser) {
    res.json({
      success: false,
      message: 'username already exist!',
    });
  } else {
    user.name = newUsername;

    const savedUser = await user.save();

    let token = jwt.sign({ _id: savedUser._id }, util.PRIVATE_KEY_DB, {
      expiresIn: '1h',
    });

    res.json({
      success: true,
      token,
      user,
    });
  }
};

module.exports = {
  set_username,
};
