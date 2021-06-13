const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    var username = req.body.name
    var password = req.body.password

    User.findOne({$or: [{name:username}]})
    .then(user => {
        if(user){
            bcrypt.compare(password, user.password, function(err, result){
                if(err){
                    res.json({
                        success: "False",
                        error: err
                    })
                }
                if(result){
                    let token = jwt.sign({name: user.name}, 'verySecretValue', {expiresIn: '1h'})
                    res.json({
                        success: "True",
                        message: 'login Successful!',
                        token
                    })
                }else{
                    res.json({
                        success: "False",
                        error: 'Password does not matched!'
                    })
                }
            })

        }
        else{
            res.json({
                success: "False",
                error: 'No user found!'
            })
        }
    })
}


const get_user = (req, res, next) => {

    if(req.headers.token !== "undefined"){
        var encrypt_token = req.headers.token

        let token = jwt.decode(encrypt_token, 'verySecretValue')
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
    else{
        res.json({
            success: "False",
            message: 'no token, you need to login'
        })
        return
    }
    
}


module.exports = {
    register,
    login,
    get_user
}