const Pool = require('../models/Pool')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { db } = require('../models/User')

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
                next_season_number_players_protected: req.body.next_season_number_players_protected,
                tradable_picks: req.body.tradable_picks,
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
            pools_created.push({"name": pools[i].name, "owner": pools[i].owner})
        }
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

const get_pool_info = (req, res, next) =>{
    
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
    
    
    var pool_name = req.headers.pool_name

    Pool.findOne({name:pool_name})
    .then(pool => {
        if(!pool){
            res.json({
                success: "False",
                message: 'Pool does not exist'
            })
            return
        }
        else{
            pool_info = {
                name: pool.name,
                owner: pool.owner,
                number_poolers: pool.number_poolers,
                number_forward: pool.number_forward,
                number_defenders: pool.number_defenders,
                number_goalies: pool.number_goalies,
                number_reservist: pool.number_reservist,
                forward_pts_goals: pool.forward_pts_goals,
                forward_pts_assists: pool.forward_pts_assists,
                forward_pts_hattricks: pool.forward_pts_hattricks,
                defender_pts_goals: pool.defender_pts_goals,
                defender_pts_assits: pool.defender_pts_assits,
                defender_pts_hattricks: pool.defender_pts_hattricks,
                goalies_pts_wins: pool.goalies_pts_wins,
                goalies_pts_shutouts: pool.goalies_pts_shutouts,
                goalies_pts_goals: pool.goalies_pts_goals,
                goalies_pts_assists: pool.goalies_pts_assists,
                next_drafter: pool.next_drafter,
                context: pool.context,
                status: pool.status,
                participants: pool.participants,
                next_season_number_players_protected: pool.next_season_number_players_protected,
                tradable_picks: pool.tradable_picks,
            }
        }

        res.json({
            success: "True",
            message: pool_info
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

const new_participant = (req, res, next) =>{
    var username = ""

    if(req.headers.token !== "undefined"){
        var encrypt_token = req.headers.token
        let token = jwt.decode(encrypt_token, 'verySecretValue')
        username = token.name
        // TODO: use token.iat and token.exp to use token expiration and force user to re-login
        User.findOne({$or: [{name:username}]})
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
    
    var pool_name = req.headers.pool_name

    Pool.findOne({name:pool_name})
    .then(pool => {
        if(!pool){
            res.json({
                success: "False",
                message: 'Pool does not exist'
            })
            return
        }
        else{
            if(pool.participants.includes(username)){
                res.json({
                    success: "False",
                    message: 'Already participating in pool'
                })
                return
            }
            else{
                if(pool.number_poolers > pool.participants.length){
                    pool.participants.push(username)
                    Pool.updateOne({_id: pool._id}, {$set: pool}, function(err, result){
                        if(err){
                            res.json({
                                success: "False",
                                message: 'Problem with updating the pool information'
                            })
                            return
                        }
                        else{
                            res.json({
                                success: "True",
                                message: 'New participant added to the pool'
                            })
                            return
                        }
                    })
                    
                }
                else{
                    res.json({
                        success: "False",
                        message: 'Already maximum poolers'
                    })
                    return
                }
                
            }
        }
    })
    .catch(error => {
        res.json({
            success: "False",
            message: error
        })
        return
    })
}

const start_draft = (req, res, next) =>{

    if(req.headers.token !== "undefined"){
        var encrypt_token = req.headers.token
        let token = jwt.decode(encrypt_token, 'verySecretValue')
        username = token.name
        // TODO: use token.iat and token.exp to use token expiration and force user to re-login
        User.findOne({$or: [{name:username}]})
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

    var pool_name = req.body.pool_name
    participants = req.body.participants

    Pool.findOne({name:pool_name})
    .then(pool => {
        if(!pool){
            res.json({
                success: "False",
                message: 'Pool does not exist'
            })
            return
        }
        else{
            if(pool.number_poolers === participants.length){
                if(pool.owner === username){
                    // modify pool object
                    if(pool.status === "created"){

                        pool.context = {}
                        for(i = 0; i < participants.length; i++){
                            pool.participants.push(participants[i].name)
                            pool.context[participants[i].name] = {}
                            pool.context[participants[i].name]['chosen_defender'] = Array(pool.number_defenders).fill({name: " - ", team: " - ", role: '', api: ''}),
                            pool.context[participants[i].name]['chosen_forward'] = Array(pool.number_forward).fill({name: " - ", team: " - ", role: '', api: ''}),
                            pool.context[participants[i].name]['chosen_goalies'] = Array(pool.number_goalies).fill({name: " - ", team: " - ", role: '', api: ''}),
                            pool.context[participants[i].name]['chosen_reservist'] = Array(pool.number_reservist).fill({name: " - ", team: " - ", role: '', api: ''})

                            pool.context[participants[i].name]['tradable_picks'] = [] // array of tradable picks
                            for(j = 0; j < pool.tradable_picks; j++){
                                pool.context[participants[i].name]['tradable_picks'].push({"rank": j+1, "player": participants[i].name})
                            }

                            pool.context[participants[i].name]['nb_defender'] = 0
                            pool.context[participants[i].name]['nb_forward'] = 0
                            pool.context[participants[i].name]['nb_goalies'] = 0
                            pool.context[participants[i].name]['nb_reservist'] = 0
                        }
                        var shuffle_participants = shuffleArray(pool.participants);

                        pool.context['draft_order'] = []
                        for(i = 0; i < pool.number_poolers*(pool.nb_defender + pool.nb_forward + pool.nb_goalies + pool.nb_reservist); i++)
                        {
                            pool.context['draft_order'].push(shuffle_participants[i])
                        }
                        pool.next_drafter = pool.context['draft_order'].shift() // pop next drafter
                    }
                    else if(pool.status === "dynastie"){
                        // TODO set player order depending on last season placement
                        for(i = 0; i < participants.length; i++){
                            pool.context[participants[i].name]['tradable_picks'] = [] // reset array of tradable picks
                            for(j = 0; j < pool.tradable_picks; j++){
                                pool.context[participants[i].name]['tradable_picks'].push({"rank": j+1, "player": participants[i].name})
                            }
                        }
                    }

                    
                    pool.status = "draft"
                    pool.nb_player_drafted = 0

                    Pool.updateOne({_id: pool._id}, {$set: pool}, function(err, result){
                        if(err){
                            res.json({
                                success: "False",
                                message: 'Problem with updating the pool information'
                            })
                            return
                        }
                        else{
                            res.json({
                                success: "True",
                                message: pool
                            })
                            return
                        }
                    })
                }
                else{
                    res.json({
                        success: "False",
                        message: 'this request should be made by the owner of the pool'
                    })
                    return
                } 
            }
            else{
                res.json({
                    success: "False",
                    message: 'Pool number of player does not correspond'
                })
                return
            }
        }
    })
    .catch(error => {
        res.json({
            success: "False",
            message: error
        })
        return
    })
}

const chose_player = (req, res, next) => {
    var username;

    if(req.headers.token !== "undefined"){
        var encrypt_token = req.headers.token
        let token = jwt.decode(encrypt_token, 'verySecretValue')
        username = token.name
        // TODO: use token.iat and token.exp to use token expiration and force user to re-login
        User.findOne({$or: [{name:username}]})
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

    var pool_name = req.body.pool_name
    var player = req.body.player
    var key_role = ""
    var key_nb_role = ""
    var max_number = 0

    Pool.findOne({name:pool_name})
    .then(pool => {
        if(!pool){
            res.json({
                success: "False",
                message: 'Pool does not exist'
            })
            return
        }
        else{
            if(player.role === 'D'){
                key_role = 'chosen_defender'
                key_nb_role = 'nb_defender'
                max_number = pool.number_defenders
            }
            else if(player.role === 'F'){
                key_role = 'chosen_forward'
                key_nb_role = 'nb_forward'
                max_number = pool.number_forward
            }
            else if(player.role === 'G'){
                key_role = 'chosen_goalies'
                key_nb_role = 'nb_goalies'
                max_number = pool.number_goalies
            }

            if(username === pool.next_drafter){
                for(i=0; i < pool.number_poolers; i++){
                    pooler = pool.participants[i]

                    if(pool.context[pooler][key_role].findIndex(e => (e.name === player.name)) !== -1 ){
                        res.json({
                            success: "False",
                            message: 'player already picked by ' + pooler
                        })
                        return
                    }
                    if(pool.context[pooler]['chosen_reservist'].findIndex(e => (e.name === player.name)) !== -1 ){
                        res.json({
                            success: "False",
                            message: 'player already picked by ' + pooler
                        })
                        return
                    }
                }
                var index;
                // player go in his role
                if(pool.context[username][key_nb_role] < max_number){
                    index = pool.context[username][key_nb_role]

                    pool.context[username][key_role][index] = player
                    pool.context[username][key_nb_role] += 1
                }
                //player go in reservist
                else if(pool.context[username]['nb_reservist'] < pool.number_reservist){
                    index = pool.context[username]['nb_reservist']

                    pool.context[username]['chosen_reservist'][index] = player
                    pool.context[username]['nb_reservist'] += 1
                }
                // cant pick this player
                else{
                    res.json({
                        success: "False",
                        message: 'no space for this player'
                    })
                    return
                }

                if(pool.nb_player_drafted == pool.number_poolers*(pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist)){ // TODO use also tradable picks
                    // draft is complete
                    pool.status = "dynastie"
                }
                else{
                    // next pooler
                    pool.nb_player_drafted +=1
                    pool.next_drafter = pool.context['draft_order'].shift()
                }



                Pool.updateOne({_id: pool._id}, {$set: pool}, function(err, result){
                    if(err){
                        res.json({
                            success: "False",
                            message: 'Problem with updating the pool information'
                        })
                        return
                    }
                    else{
                        res.json({
                            success: "True",
                            message: pool
                        })
                        return
                    }
                })
            }
            else{
                res.json({
                    success: "False",
                    message: 'not drafter s turn'
                }) 
            }
        }
    })
}

const protected_player = (req, res, next) => {
    //TODO store the list of protected players into a new data structure for the next season dynastie
}

function shuffleArray(arr) {
    arr.sort(() => Math.random() - 0.5);
}

module.exports = {
    pool_creation,
    pool_list,
    get_pool_info,
    new_participant,
    start_draft,
    chose_player
}