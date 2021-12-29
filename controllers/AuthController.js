const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ethers = require('ethers')

//const PRIVATE_KEY_DB = require('constants')
PRIVATE_KEY_DB = 'verySecretValue'

// [TODO]: in the register, use the public key received instead of username.
// for the login, use the signature and the msg to recover the public key to validate the user request and send im the cookie.

const verifyMessage = async (message, address, signature) => {
    const signerAddr = await ethers.utils.verifyMessage(message, signature)
    if(signerAddr !== address)
        return false

    return true
}

const register = (req, res, next) =>{
    var username = req.body.name

    User.findOne({$or: [{name:username}]})
    .then(user => {
        if(user){
            res.json({
                success: "False",
                error: "user already registered"
            })
        }
        else{
            bcrypt.hash(req.body.password, 10, function(err, hashedPass) {
                if(err) {
                    res.json({
                        success: "False",
                        error: err
                    })
                }
        
                let user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: hashedPass,
                    pool_list: []
                })

                user.save()
                .then(user => {
                    res.json({
                        success: "True",
                        message: 'User Added Successfully!'
                    })
                })
                .catch(error => {
                    res.json({
                        success: "False",
                        message: error
                    })
                })
            })
        }
    })
}

const login = (req, res, next) => {
    var addr = req.body.addr
    var sig = req.body.sig

    User.findOne({ addr: addr })
    .then(user => {
        if(user){
            // user found, don't create it in the database.

            verifyMessage("Unlock wallet to access nhl-pool-ethereum.", addr, sig)
            .then(isVerified => {
                if(isVerified){    
                    let token = jwt.sign({addr: user.addr}, PRIVATE_KEY_DB, {expiresIn: '1h'})

                    res.json({
                        success: "True",
                        message: 'unlock Successful!',
                        token,
                        user
                    })
                }else{

                    res.json({
                        success: "False",
                        message: 'could not verified the signature.'
                    })
                }
            })
        }
        else{
            // user not found create it in the database.

            let user = new User({
                name: req.body.addr,
                addr: req.body.addr,
                pool_list: []
            })

            user.save()
            .then(user => {
                verifyMessage("Unlock wallet to access nhl-pool-ethereum.", addr, sig)
                .then(isVerified => {
                    if(isVerified){

                        let token = jwt.sign({addr: user.addr}, PRIVATE_KEY_DB, {expiresIn: '1h'})
                        res.json({
                            success: "True",
                            message: 'unlock Successful!',
                            token,
                            user
                        })
                    }else{

                        res.json({
                            success: "False",
                            message: 'could not verified the signature.'
                        })
                    }
                })
            })
            .catch(error => {
                res.json({
                    success: "False",
                    message: error
                })
            })
        }
    })
}

const set_username = (req, res, next) => {

    var encrypt_token = req.headers.addr

    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB)
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({$or: [{name:token.name}]})
    .then(user => {
        if(user){
            res.json({
                success: "True",
                username: token.name,
                message: 'legit User!'
            })
            return
        }
        else{
            res.json({
                success: "False",
                message: 'User is not registered!'
            })
            return
        }
    })

    
}

module.exports = {
    register,
    login,
    set_username
}