const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ethers = require('ethers');

const util = require('./util');

const verifyMessage = async (message, address, signature) => {
  const signerAddr = await ethers.utils.verifyMessage(message, signature);
  if (signerAddr !== address) return false;

  return true;
};

const register = async (req, res, next) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.json({
      success: false,
      message: 'No username, password or email provided!',
    });
    return;
  }

  const user = await User.findOne({ name: req.body.username });

  if (user) {
    res.json({
      success: false,
      message: 'username already registered',
    });
  } else {
    const salt = await bcrypt.genSalt(1);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    let newUser = new User({
      name: req.body.username,
      addr: '', // no address when register with password and username
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPass,
      pool_list: [],
    });

    await newUser.save();
    res.json({
      success: true,
    });
  }
};

const login = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.json({
      success: false,
      message: 'No username or password provided!',
    });
    return;
  }

  const user = await User.findOne({ name: req.body.username });

  if (user && req.body.password && user.password) {
    const isValid = await bcrypt.compare(req.body.password, user.password);

    console.log(isValid);
    if (isValid) {
      let token = jwt.sign({ _id: user._id }, util.PRIVATE_KEY_DB, {
        expiresIn: '1h',
      });

      res.json({
        success: true,
        token,
        user,
      });
      return;
    } else {
      res.json({
        success: false,
        message: 'the password was wrong!',
      });
      return;
    }
  } else {
    res.json({
      success: false,
      message: 'user does not exist!',
    });
  }
};

const wallet_login = async (req, res, next) => {
  const user = await User.findOne({ addr: req.body.addr });

  if (user) {
    // user found, don't create it in the database.

    const isVerified = await verifyMessage('Unlock wallet to access nhl-pool-ethereum.', req.body.addr, req.body.sig);

    if (isVerified) {
      let token = jwt.sign({ _id: user._id }, util.PRIVATE_KEY_DB, {
        expiresIn: '1h',
      });

      res.json({
        success: true,
        token,
        user,
      });
    } else {
      res.json({
        success: false,
        message: 'could not verified the signature.',
      });
    }
  } else {
    // user not found create it in the database.

    let newUser = new User({
      name: req.body.addr,
      addr: req.body.addr,
      pool_list: [],
    });

    const user = await newUser.save();
    const isVerified = await verifyMessage('Unlock wallet to access nhl-pool-ethereum.', addr, req.body.sig);

    if (isVerified) {
      let token = jwt.sign({ _id: user._id }, util.PRIVATE_KEY_DB, {
        expiresIn: '1h',
      });
      res.json({
        success: true,
        token,
        user,
      });
    } else {
      res.json({
        success: false,
        message: 'could not verified the signature.',
      });
    }
  }
};

const get_all_users = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const users = await User.find();
  res.json({
    success: true,
    message: users,
  });
  return;
};

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
  register,
  login,
  wallet_login,
  get_all_users,
  set_username,
};
