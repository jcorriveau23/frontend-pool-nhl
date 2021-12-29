import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import logos from "../img/images"

function DynastiePool({username, poolName, poolInfo, setPoolInfo, socket}) {
    
    const [inRoom, setInRoom] = useState([]);

    const [forwProtected, setForwProtected] = useState([]);
    const [defProtected, setDefProtected] = useState([]);
    const [goalProtected, setGoalProtected] = useState([]);
    const [reservProtected, setReservProtected] = useState([]);

    useEffect(() => {
        if (socket && poolName) {
            // TODO: add some validation server socket side to prevent someone joining the pool 
            // when there is already the maximum poolers in the room
            socket.emit('joinRoom', Cookies.get('token-' + username), poolName);
            setInRoom(true);
        }
        return () => {
            if(socket && poolName)
            {
                socket.emit('leaveRoom', Cookies.get('token-' + username), poolName);
                socket.off('roomData');
                setInRoom(false);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if(socket){
            socket.on("poolInfo", (data) => { setPoolInfo(data) });
        }
        
    }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps
  
    const protect_player = (player) => {
        var changedArray = []
        var number_protected = defProtected.length + forwProtected.length + goalProtected.length

        var add_to_reservist = false

        if(number_protected < poolInfo.next_season_number_players_protected)
        {
            if(player.role === "D")
            {
                if(defProtected.length < poolInfo.number_defenders)
                {
                    changedArray = defProtected
                    changedArray.push(player)

                    setDefProtected([...changedArray])
                }
                else
                {
                    add_to_reservist = true
                }
            }
            else if(player.role === "F"){
                if(forwProtected.length < poolInfo.number_forward)
                {
                    changedArray = forwProtected
                    changedArray.push(player)
            
                    setForwProtected([...changedArray])
                }
                else
                {
                    add_to_reservist = true
                }
            
            }
            else if(player.role === "G")
            {
                if(goalProtected.length < poolInfo.number_goalies)
                {
                    changedArray = goalProtected
                    changedArray.push(player)
            
                    setGoalProtected([...changedArray])
                }
                else
                {
                    add_to_reservist = true
                }
            }
        }

        if(add_to_reservist)
        {
            if(reservProtected.length < poolInfo.number_reservist)
            {
                changedArray = reservProtected
                changedArray.push(player)

                setReservProtected([...changedArray])
            }
        }
    }

    const unprotect_player = (player, isReservist) => {
        if((defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length) > 0)
        {
            var protected_player_array = []
            var i = 0

            if(player.role === "D"){
                if(!isReservist)
                {
                    protected_player_array = defProtected
                    i = protected_player_array.indexOf(player)
                    if(i > -1)
                    {
                        protected_player_array.splice(i, 1)
                    }
                    setDefProtected([...protected_player_array])
                }
            }
            else if(player.role === "F"){
                if(!isReservist)
                {
                    protected_player_array = forwProtected
                    i = protected_player_array.indexOf(player)
                    if(i > -1)
                    {
                        protected_player_array.splice(i, 1)
                    }
                    setForwProtected([...protected_player_array])
                }
            }
            else if(player.role === "G")
            {
                if(!isReservist)
                {
                    protected_player_array = goalProtected
                    i = protected_player_array.indexOf(player)
                    if(i > -1)
                    {
                        protected_player_array.splice(i, 1)
                    }

                    setGoalProtected([...protected_player_array])
                }
            }

            // remove from reservist protected player
            if(isReservist)
            {
                protected_player_array = reservProtected
                i = protected_player_array.indexOf(player)
            if(i > -1)
            {
                protected_player_array.splice(i, 1)
            }
                setReservProtected([...protected_player_array])
            }
            
            //filter_protected_players()
        }   
    }

    const send_protected_player = () => {
    
        var number_protected_player = defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length

        if(number_protected_player === poolInfo.next_season_number_players_protected)
        {
            var cookie = Cookies.get('token-' + username)

            // validate login
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'token': cookie},
                body: JSON.stringify({'pool_name': poolInfo.name, 'def_protected': defProtected, 'forw_protected': forwProtected, 'goal_protected': goalProtected, 'reserv_protected': reservProtected})
            };
            fetch('../pool/protect_players', requestOptions)
            .then(response => response.json())
            .then(data => {
                if(data.success === "False")
                {
                    // props.history.push('/login');
                }
            })


        }
    }

    const render_forward_dynastie = () => {
        return poolInfo.context[username].chosen_forward.filter( (player) => {
            if( forwProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
            {
                if( reservProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
                {
                    return player
                }
            }
            return null
            
        }).map((player, i) =>
            <tbody>
                <tr onClick={() => protect_player(player)}>
                    <td>{i + 1}</td>
                    <td>{player.name}</td>
                    <td>
                        <img src={logos[player.team]} alt="" width="30" height="30"></img>
                    </td>
                </tr>
            </tbody>
        )
    }

    const render_defender_dynastie = () => {
        return poolInfo.context[username].chosen_defender.filter( (player) => {
            if( defProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
            {
                if(reservProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
                {
                    return player
                }
            }
            return null
        }).map((player, i) =>
            <tr onClick={() => protect_player(player)}>
                <td>{i + 1}</td>
                <td>{player.name}</td>
                <td>
                    <img src={logos[player.team]} alt="" width="30" height="30"></img>
                </td>
            </tr>
        )
    }

    const render_goalies_dynastie = () => {
        return poolInfo.context[username].chosen_goalies.filter( (player) => {
            if( goalProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
            {
                if(reservProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
                {
                    return player
                }
            }
            return null
        }).map((player, i) =>
            <tr onClick={() => protect_player(player)}>
                <td>{i + 1}</td>
                <td>{player.name}</td>
                <td>
                    <img src={logos[player.team]} alt="" width="30" height="30"></img>
                </td>
            </tr>
        )
    }

    const render_reservist_dynastie = () => {
            return poolInfo.context[username].chosen_reservist.filter( (player) => {
                if( forwProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
                {
                    if(reservProtected.findIndex( (p) => p.name === player.name && p.team === player.team) === -1 )
                    {
                        return player
                    }
                }
                return null
            }).map((player, i) =>
                <tr onClick={() => protect_player(player)}>
                <td>{i + 1}</td>
                <td>{player.name}</td>
                <td>
                    <img src={logos[player.team]} alt="" width="30" height="30"></img>
                </td>
                </tr>
            )
    }

    if(poolInfo && inRoom){
        var nb_player = poolInfo.context[username].nb_defender + poolInfo.context[username].nb_forward + poolInfo.context[username].nb_goalies + poolInfo.context[username].nb_reservist
        if(nb_player > poolInfo.next_season_number_players_protected ){

            return(
                <div>
                    <h1>Protect player for pool: {poolInfo.name}</h1>
                    <div class="container">
                        <div class="floatLeft">
                            <h2>Protect {poolInfo.next_season_number_players_protected} players of your team</h2>
                            <table class="content-table">
                            <thead>
                                <h3>Forwards</h3>
                                <tr>
                                <th>#</th>
                                <th>name</th>
                                <th>team</th>
                                </tr>
                            </thead>
                            {render_forward_dynastie()}
                            <thead>
                                <h3>Defenders</h3>
                                <tr>
                                <th>#</th>
                                <th>name</th>
                                <th>team</th>
                                </tr>
                                {render_defender_dynastie()}
                            </thead>
                            <thead>
                                <h3>Goalies</h3>
                                <tr>
                                <th>#</th>
                                <th>name</th>
                                <th>team</th>
                                </tr>
                                {render_goalies_dynastie()}
                            </thead>
                            <thead>
                                <h3>Reservists</h3>
                                <tr>
                                <th>#</th>
                                <th>name</th>
                                <th>team</th>
                                </tr>
                                {render_reservist_dynastie()}
                            </thead>
                            </table>
                        </div>
                        <div class="floatRight">
                            <h2>Protected players</h2>
                            <table class="content-table">
                                <thead>
                                    <h3>Forwards</h3>
                                    <tr>
                                        <th>#</th>
                                        <th>name</th>
                                        <th>team</th>
                                    </tr>
                                </thead>
                                {forwProtected.map((player, i) =>
                                    <tr onClick={() => unprotect_player(player, false)}>
                                        <td>{i + 1}</td>
                                        <td>{player.name}</td>
                                        <td>
                                            <img src={logos[player.team]} alt="" width="30" height="30"></img>
                                        </td>
                                    </tr>
                                )}
                                <thead>
                                    <h3>Defenders</h3>
                                    <tr>
                                        <th>#</th>
                                        <th>name</th>
                                        <th>team</th>
                                    </tr>
                                </thead>
                                {defProtected.map((player, i) => //TODO: when clicked on remove from protected player list
                                    <tr onClick={() => unprotect_player(player, false)}>
                                        <td>{i + 1}</td>
                                        <td>{player.name}</td>
                                        <td>
                                            <img src={logos[player.team]} alt="" width="30" height="30"></img>
                                        </td>
                                    </tr>
                                )}
                                <thead>
                                    <h3>Goalies</h3>
                                    <tr>
                                        <th>#</th>
                                        <th>name</th>
                                        <th>team</th>
                                    </tr>
                                </thead>
                                {goalProtected.map((player, i) => //TODO: when clicked on remove from protected player list
                                    <tr onClick={() => unprotect_player(player, false)}>
                                        <td>{i + 1}</td>
                                        <td>{player.name}</td>
                                        <td>
                                            <img src={logos[player.team]} alt="" width="30" height="30"></img>
                                        </td>
                                    </tr>
                                )}
                                <thead>
                                    <h3>Reservist</h3>
                                    <tr>
                                        <th>#</th>
                                        <th>name</th>
                                        <th>team</th>
                                    </tr>
                                </thead>
                                {reservProtected.map((player, i) => //TODO: when clicked on remove from protected player list
                                    <tr onClick={() => unprotect_player(player, true)}>
                                        <td>{i + 1}</td>
                                        <td>{player.name}</td>
                                        <td>
                                            <img src={logos[player.team]} alt="" width="30" height="30"></img>
                                        </td>
                                    </tr>
                                )}
                            </table>
                            <button onClick={() => send_protected_player()} disabled={false}>
                                complete protecting player
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        else
        {
            return(
                <div>
                    <h1>Waiting for other player to protect their player...</h1>
                </div>
            )
        }
    }
    else
    {
        return(
            <div>
                <h1>trying to fetch pool data info...</h1>
            </div>
        )
    }
    
  
  }
  export default DynastiePool;