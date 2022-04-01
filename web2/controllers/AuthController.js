const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ethers = require("ethers");

//const PRIVATE_KEY_DB = require('constants')
PRIVATE_KEY_DB = "verySecretValue";

// [TODO]: in the register, use the public key received instead of username.
// for the login, use the signature and the msg to recover the public key to validate the user request and send im the cookie.

const verifyMessage = async (message, address, signature) => {
  const signerAddr = await ethers.utils.verifyMessage(message, signature);
  if (signerAddr !== address) return false;

  return true;
};

const register = (req, res, next) => {
  var username = req.body.username;

  User.findOne({ name: username }).then((user) => {
    if (user) {
      res.json({
        success: "False",
        error: "user already registered",
      });
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
        if (err) {
          res.json({
            success: "False",
            error: err,
          });
        }

        let user = new User({
          name: req.body.name,
          addr: "", // no address when register with password and username
          email: req.body.email,
          phone: req.body.phone,
          password: hashedPass,
          pool_list: [],
        });

        user
          .save()
          .then((user) => {
            res.json({
              success: "True",
              message: "User Added Successfully!",
            });
          })
          .catch((error) => {
            res.json({
              success: "False",
              message: error,
            });
          });
      });
    }
  });
};

const login = (req, res, next) => {
  var username = req.body.username;

  User.findOne({ name: username }).then((user) => {
    if (user) {
      bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
        if (err) {
          res.json({
            success: "False",
            error: err,
          });
        }

        let token = jwt.sign({ name: user.name }, PRIVATE_KEY_DB, {
          expiresIn: "1h",
        });

        res.json({
          success: "True",
          message: "login with username and password successfull",
          token,
          user,
        });
      });
    } else {
      res.json({
        success: "False",
        error: "user does not exist",
      });
    }
  });
};

const wallet_login = (req, res, next) => {
  var addr = req.body.addr;
  var sig = req.body.sig;

  User.findOne({ addr: addr }).then((user) => {
    if (user) {
      // user found, don't create it in the database.

      verifyMessage(
        "Unlock wallet to access nhl-pool-ethereum.",
        addr,
        sig
      ).then((isVerified) => {
        if (isVerified) {
          let token = jwt.sign({ name: user.name }, PRIVATE_KEY_DB, {
            expiresIn: "1h",
          });

          res.json({
            success: "True",
            message: "login with wallet Successful!l",
            token,
            user,
          });
        } else {
          res.json({
            success: "False",
            message: "could not verified the signature.",
          });
        }
      });
    } else {
      // user not found create it in the database.

      let user = new User({
        name: req.body.addr,
        addr: req.body.addr,
        pool_list: [],
      });

      user
        .save()
        .then((user) => {
          verifyMessage(
            "Unlock wallet to access nhl-pool-ethereum.",
            addr,
            sig
          ).then((isVerified) => {
            if (isVerified) {
              let token = jwt.sign({ name: user.name }, PRIVATE_KEY_DB, {
                expiresIn: "1h",
              });
              res.json({
                success: "True",
                message: "unlock Successful!",
                token,
                user,
              });
            } else {
              res.json({
                success: "False",
                message: "could not verified the signature.",
              });
            }
          });
        })
        .catch((error) => {
          res.json({
            success: "False",
            message: error,
          });
        });
    }
  });
};

const set_username = (req, res, next) => {
  const encrypt_token = req.body.token;
  const newUsername = req.body.newUsername;

  const token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);

  if (token) {
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ name: token.name }).then((user) => {
      if (user) {
        user.name = newUsername;
        User.findOne({ name: newUsername }).then((newUser) => {
          if (newUser) {
            res.json({
              success: "False",
              message: "username already exist!",
            });
          } else {
            user
              .save()
              .then((user) => {
                let token = jwt.sign({ name: user.name }, PRIVATE_KEY_DB, {
                  expiresIn: "1h",
                });

                res.json({
                  success: "True",
                  message: "changed username successfull!",
                  token,
                  user,
                });
              })
              .catch((error) => {
                res.json({
                  success: "False",
                  message: error,
                });
              });
          }
        });
      } else {
        res.json({
          success: "False",
          message: "User is not registered.",
        });
      }
    });
  } else {
    res.json({
      success: "False",
      message: "The token is not valid.",
    });
  }
};

module.exports = {
  register,
  login,
  wallet_login,
  set_username,
};
