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
                    password: hashedPass
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



module.exports = {
    register,
    login
}