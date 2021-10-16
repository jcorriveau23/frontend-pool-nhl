const Pool = require('../models/Pool')
const User = require('../models/User')
const Player = require('../models/Player')
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
                number_poolers: req.body.number_pooler,
                number_forward: 9,
                number_defenders: 4,
                number_goalies: 2,
                number_reservist: 2,
                forward_pts_goals: 2,
                forward_pts_assists: 1,
                forward_pts_hattricks: 3,
                defender_pts_goals: 3,
                defender_pts_assits: 2,
                defender_pts_hattricks: 2,
                goalies_pts_wins: 2,
                goalies_pts_shutouts: 3,
                goalies_pts_goals: 3,
                goalies_pts_assists: 2,
                next_season_number_players_protected: 8,
                tradable_picks: 3,
                context: {},
                next_drafter: "",
                status: "created"
              
            })

            pool.save()
            .then(user => {
                res.json({
                    success: "True",
                    message: req.body.name
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

const delete_pool = (req, res, next) =>{
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
        if(pool.owner === token.name)
        {
            Pool.deleteOne({name: pool.name})
            .then(pool => {
                console.log("pool deleted: " + req.body.name)
                res.json({
                success: "True",
                message: "pool as been deleted!"
                })

            })
        }
        else{
            res.json({
                success: "False",
                message: "you are not the owner of that pool!"
            }) 
        }
            
        }
    )
}

const pool_list = (req, res, next) =>{
    var user_pools = []
    
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
            user_pools = user.pool_list
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

        Pool.find({name: user_pools}, {name:1, status:1, owner:1})
        .then(pools => {
            res.json({
                success: "True",
                pool_created: pools_created,
                user_pools_info: pools
                })
        })
        .catch(error => {
            res.json({
                success: "False",
                message: error
            })
            return
        })
        
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
                    shuffleArray(pool.participants);    // randomize a bit
                    pool.context['draft_order'] = []
                    var number_picks = pool.number_poolers*(pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist)
                    for(i = 0; i < number_picks; i++)
                    {
                        pool.context['draft_order'].push(pool.participants[i % pool.number_poolers])
                    }
                    pool.next_drafter = pool.context['draft_order'].shift() // pop first next drafter of the draft


                    
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
                            for(i = 0; i < participants.length; i++){
                                User.findOne({name: participants[i].name})      
                                .then(user => {
                                    
                                    user.pool_list.push(pool.name)

                                    User.updateOne({_id: user._id}, {$set: user}, function(err, result){
                                        if(err){
                                            res.json({
                                                success: "False",
                                                message: 'Problem with updating one of user information'
                                            })
                                            return
                                        }
                                        else{
                                            console.log(user.name + " assigned to pool: " + pool.name)
                                        }
                                    })
                                })
                                .catch(error => {
                                    res.json({
                                        success: "False",
                                        message: error
                                    })
                                    return
                                })                    
                            }
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


                // next pooler to draft
                pool.nb_player_drafted +=1
                pool.next_drafter = pool.context['draft_order'].shift()
                if(pool.nb_player_drafted === pool.number_poolers*(pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist)){
                    pool.status = "in Progress"  // draft completed
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

const protected_players = (req, res, next) => {
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
    var def_protected = req.body.def_protected
    var forw_protected = req.body.forw_protected
    var goal_protected = req.body.goal_protected
    var reserv_protected = req.body.reserv_protected

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
            if(def_protected.length <= pool.number_defenders){
                pool.context[username].chosen_defender = def_protected
                pool.context[username].nb_defender = def_protected.length
            }
            else{
                res.json({
                    success: "False",
                    message: 'too much defenders'
                })
                return  
            }
            if(forw_protected.length <= pool.number_forward){
                pool.context[username].chosen_forward = forw_protected
                pool.context[username].nb_forward = forw_protected.length
            }
            else{
                res.json({
                    success: "False",
                    message: 'too much forward'
                })
                return  
            }

            if(goal_protected.length <= pool.number_goalies){
                pool.context[username].chosen_goalies = goal_protected
                pool.context[username].nb_goalies = goal_protected.length
            }
            else{
                res.json({
                    success: "False",
                    message: 'too much goalies'
                })
                return  
            }
            if(reserv_protected.length <= pool.number_reservist){
                pool.context[username].chosen_reservist = reserv_protected
                pool.context[username].nb_reservist = reserv_protected.length
            }
            else{
                res.json({
                    success: "False",
                    message: 'too much reservist'
                })
                return 
            }
            var ready = true

            for(i=0; i<pool.number_poolers; i++){
                pooler = pool.participants[i]

                nb_protected = pool.context[pooler].nb_defender + pool.context[pooler].nb_forward + pool.context[pooler].nb_goalies + pool.context[pooler].nb_reservist
                if(nb_protected > pool.next_season_number_players_protected){
                    ready = false // At least one player is not ready
                    break
                }
            }
            if(ready){
                pool.context.draft_order = []

                for(rank = 1; rank <= pool.tradable_picks; rank++){
                    for(j = pool.number_poolers-1; j > -1; j--){
                        //i picks of player j
                        var player_search = pool.participants[j] // participants should be reordered depending on the rank of last season
                        
                        if(pool.context[player_search].tradable_picks.findIndex(t => (t.rank === rank && t.player === player_search)) > - 1 ){
                            // player still has his picks
                            console.log("rank:" + rank + "from " + player_search + " got the pick: " + player_search)
                            pool.context.draft_order.push(player_search)
                        }
                        else{
                            // player traded his picks to another pooler lets find who has it
                            for(i = 0; i < pool.number_poolers; i++){
                                pooler = pool.final_rank[i]
                                if(pool.context[pooler].tradable_picks.findIndex(t => (t.rank === rank && t.player === player_search)) > - 1 )
                                {
                                    pool.context.draft_order.push(pooler)
                                    break  
                                }
                            }
                        }

                    }
                }
                var number_picks = pool.number_poolers*(pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist - pool.next_season_number_players_protected)
                for(i = number_picks-(pool.tradable_picks*pool.number_poolers + 1); i > -1; i--)
                {
                    pool.context['draft_order'].push(pool.participants[i % pool.number_poolers])
                }
                pool.status = "draft"
                pool.nb_player_drafted = pool.next_season_number_players_protected*pool.number_poolers
                pool.next_drafter = pool.context.draft_order.shift()

                // reset tradable picks
                for(i = 0; i < pool.number_poolers; i++){
                    pool.context[pool.participants[i]]['tradable_picks'] = [] // reset array of tradable picks
                    for(j = 0; j < pool.tradable_picks; j++){
                        pool.context[pool.participants[i]]['tradable_picks'].push({"rank": j+1, "player": pool.participants[i]})
                    }
                }
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
        }
    )
}

const get_pool_stats = (req, res, next) => {
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

    var pool_name = req.headers.pool_name
    var players_name = []
    var players_team = []

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
            for(var i = 0; i < pool.number_poolers; i++){
                for(var j = 0; j < pool.context[pool.participants[i]].chosen_defender.length; j++){
                    players_name.push(pool.context[pool.participants[i]].chosen_defender[j].name)
                    players_team.push(pool.context[pool.participants[i]].chosen_defender[j].team)
                }
                for(var j = 0; j < pool.context[pool.participants[i]].chosen_forward.length; j++){
                    players_name.push(pool.context[pool.participants[i]].chosen_forward[j].name)
                    players_team.push(pool.context[pool.participants[i]].chosen_forward[j].team)
                }
                for(var j = 0; j < pool.context[pool.participants[i]].chosen_goalies.length; j++){
                    players_name.push(pool.context[pool.participants[i]].chosen_goalies[j].name)
                    players_team.push(pool.context[pool.participants[i]].chosen_goalies[j].team)
                }
                for(var j = 0; j < pool.context[pool.participants[i]].chosen_reservist.length; j++){
                    players_name.push(pool.context[pool.participants[i]].chosen_reservist[j].name)
                    players_team.push(pool.context[pool.participants[i]].chosen_reservist[j].team)
                }
            }

            Player.find({name: players_name, team: players_team}, {name:1, team:1, stats:1, position:1, url:1})
            .then(players => {
                res.json({
                    success: "True",
                    players: players,
                    })
            })
            .catch(error => {
                res.json({
                    success: "False",
                    message: error
                })
                return
            })
        }
    }
    )
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
    chose_player,
    protected_players,
    get_pool_stats,
    delete_pool
}