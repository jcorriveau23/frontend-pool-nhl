const Pool = require('../models/Pool')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const pool_creation = (req, res, next) =>{
    var encrypt_token = req.headers.token

    let token = jwt.decode(encrypt_token, 'verySecretValue')
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({$or: [{name:token.name}]})
    .then(user => {
        if(!user){
            res.json({
                success: "False",
                message: 'User is not registered!'
            })
        }
    })

    Pool.findOne({$or: [{name:req.body.name}]})
    .then(pool => {
        if(pool){
            res.json({
                success: "False",
                message: "pool name already taken!"
            })
        }
        else{        
            let pool = new Pool({
                name: req.body.name,
                owner: token.name,
                number_poolers: req.body.number_poolers,
                number_forward: req.body.number_forward,
                number_defenders: req.body.number_defenders,
                number_goalies: req.body.number_goalies,
                number_reservist: req.body.number_reservist,
                forward_pts_goals: req.body.forward_pts_goals,
                forward_pts_assists: req.body.forward_pts_assists,
                forward_pts_hattricks: req.body.forward_pts_hattricks,
                defender_pts_goals: req.body.defender_pts_goals,
                defender_pts_assits: req.body.defender_pts_assits,
                defender_pts_hattricks: req.body.defender_pts_hattricks,
                goalies_pts_wins: req.body.goalies_pts_wins,
                goalies_pts_shutouts: req.body.goalies_pts_shutouts,
                goalies_pts_goals: req.body.goalies_pts_goals,
                goalies_pts_assists: req.body.goalies_pts_assists,
                status: "created"
              
            })

            pool.save()
            .then(user => {
                res.json({
                    success: "True",
                    message: 'Pool added successfully!'
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


const pool_list = (req, res, next) =>{
    
    if(req.headers.token !== "undefined"){
        var encrypt_token = req.headers.token
        let token = jwt.decode(encrypt_token, 'verySecretValue')
        // TODO: use token.iat and token.exp to use token expiration and force user to re-login
        User.findOne({$or: [{name:token.name}]})
        .then(user => {
            if(!user){
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
    
    

    Pool.find({"status": "created"})
    .then(pools => {
        
        var pools_created = []

        for(i=0; i < pools.length; i++){
            console.log(i)
            pools_created.push({"name": pools[i].name, "owner": pools[i].owner})
        }
        console.log(pools_created)
        res.json({
            success: "True",
            message: pools_created
        })
        return
    })
    .catch(error => {
        res.json({
            success: "False",
            message: error
        })
        return
    })
}

module.exports = {
    pool_creation,
    pool_list
}