import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import logos from "./img/images"
import Tabs from "./Tabs"

function DraftPool({username, poolName, poolInfo, setPoolInfo, socket}) {
    
    const [inRoom, setInRoom] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState("select a player");
    const [def_l, setDef_l] = useState([]);
    const [forw_l, setForw_l] = useState([]);
    const [goal_l, setGoal_l] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (socket && poolName && username) {
            socket.emit('joinRoom', Cookies.get('token'), poolName);
            fetchPlayerDraft();
            setInRoom(true);
        }
        return () => {
            if(socket && poolName)
            {
                socket.emit('leaveRoom', Cookies.get('token'), poolName);
                socket.off('roomData');
                setInRoom(false);
            }
        }
    }, [username]); // only run on this component mount and unmount

    useEffect(() => {
        if(socket){
            socket.on("poolInfo", (data) => { 
                setPoolInfo(data)
             });
        }
        
    }, [socket]);

    // Draft methods
    const fetchPlayerDraft = async () => {

        var cookie = Cookies.get('token')

        // get all players stats from past season
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'token': cookie }
        };
        fetch('../pool/get_all_players', requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.success === "False"){
                //props.history.push('/pool_list');
            }
            else{
                var sortedForwards = []
                var sortedDefender = []
                var sortedGoalies = []

                sortedForwards = sort_by_player_member('pts', data.message["F"])
                sortedDefender = sort_by_player_member('pts', data.message["D"])
                sortedGoalies = sort_by_player_member('wins', data.message["G"])

                setForw_l([...sortedForwards]);
                setDef_l([...sortedDefender])
                setGoal_l([...sortedGoalies]);
            }
        })
    }

    const sort_players = async (stats, position) => {
        var array = [];
        if(position === "D"){
            array = def_l;
            array = await sort_by_player_member(stats, def_l)
            setDef_l([...array])
        }
        else if(position === "F"){
            array = forw_l;
            array = await sort_by_player_member(stats, array)
            setForw_l([...array])
        }
        else if(position === "G"){
            array = goal_l;
            array = await sort_by_player_member(stats, array)
            setGoal_l([...array])
        }
    }

    const sort_by_player_member = (playerMember, array) =>{
        // TODO: try to simplified this into no if at all
        if(playerMember !== "name" && playerMember !== "team")
            array.sort(function(a, b) {
                return b.stats[playerMember] - a.stats[playerMember] ;
            });

        else{
            array.sort(function(a, b) {
                if(a[playerMember] < b[playerMember]) {return -1;}
                if(a[playerMember] > b[playerMember]) {return 1;}
                return 0;
            });
        }

        return array
    }

    const player_selection = (name, team, role) => {
        setSelectedPlayer( {name: name, team: team, role: role} )
    }

    const chose_player = (player) => {
        socket.emit('pickPlayer', Cookies.get('token'), poolInfo.name, player, (ack)=>{
            if(ack.success === "False")
            {
                setMessage(ack.message)
            }
            else
            {
                setMessage("")
            }
        })
    }

    const search_players = (val) => {
        setSearchText(val)
    }

    const filter_players = (player) => {
        var participant

        if( !player.name.toLowerCase().includes(searchText.toLowerCase()) )
        {
            return true // not part of the search text
        }

        for(var i = 0; i < poolInfo.participants.length; i++)
        {
            participant = poolInfo.participants[i]

            if( poolInfo.context[participant].chosen_reservist.findIndex(p => p.name === player.name && p.team === player.team) > -1)
            {
                return true // already picked 
            }

            if(player.position === "D")
            {
                if( poolInfo.context[participant].chosen_defender.findIndex(p => p.name === player.name && p.team === player.team) > -1)
                {
                    return true // already picked
                }
            }
            else if(player.position === "F")
            {
                if( poolInfo.context[participant].chosen_forward.findIndex(p => p.name === player.name && p.team === player.team) > -1)
                {
                    return true // already picked
                }
            }
            else
            {
                if( poolInfo.context[participant].chosen_goalies.findIndex(p => p.name === player.name && p.team === player.team) > -1)
                {
                    return true // already picked
                }
            }
        }
        return false    // part of the search text and available
    }

    const render_defender = (pooler) => {
    if(poolInfo['context'][pooler]){
        return poolInfo['context'][pooler]['chosen_defender'].map((player, index) =>
            <tr>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>
                    <img src={logos[player.team]} width="30" height="30"></img>
                </td>
            </tr>
        )
    }
    else{
        return
    }
    }

    const render_forward = (pooler) => {
    if(poolInfo['context'][pooler]){
        return poolInfo['context'][pooler]['chosen_forward'].map((player, index) =>
        <tr>
        <td>{index + 1}</td>
        <td>{player.name}</td>
        <td>
            <img src={logos[player.team]} width="30" height="30"></img>
        </td>
        </tr>
    )
    }
    else{
        return
    }
    }

    const render_reservist = (pooler) => {
    if(poolInfo['context'][pooler]){
        return poolInfo['context'][pooler]['chosen_reservist'].map((player, index) =>
        <tr>
        <td>{index + 1}</td>
        <td>{player.name}</td>
        <td>
            <img src={logos[player.team]} width="30" height="30"></img>
        </td>
        </tr>
    )
    }
    else{
        return
    }
    }

    const render_goalies = (pooler) => {
    if(poolInfo['context'][pooler]){
        return poolInfo['context'][pooler]['chosen_goalies'].map((player, index) =>
        <tr>
        <td>{index + 1}</td>
        <td>{player.name}</td>
        <td>
            <img src={logos[player.team]} width="30" height="30"></img>
        </td>
        </tr>
    )
    }
    else
    {
        return
    }
    }

    const isUser = (participant) => {
        return participant === username
    }

    const render_tabs_choice = () => {
    if(poolInfo['participants']){
        var array = poolInfo['participants']

        // replace pooler user name to be first
        var index = array.findIndex(isUser)
        array.splice(index, 1)
        array.splice(0, 0, username)

        return <Tabs>
                {array.map(pooler =>
                    <div label={pooler}>
                    <table class="content-table">
                <h3>Forward</h3>
                <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                </tr>
                {render_forward(pooler)}
                <h3>Def</h3>
                <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                </tr>
                {render_defender(pooler)}
                <h3>Goalies</h3>
                <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                </tr>
                {render_goalies(pooler)}
                <h3>Reservist</h3>
                <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                </tr>
                {render_reservist(pooler)}
                </table>
                    </div>
                )}
        </Tabs>
        
    }
    else{
        return
    }
    }

    const render_color_user_turn = () => {
    if(poolInfo.next_drafter === username){
        return <h2 class="green-text">{poolInfo.next_drafter}'s turn</h2>
    }
    else{
        return <h2 class="red-text">{poolInfo.next_drafter}'s turn</h2>
    }
    }

    if(poolInfo && inRoom){
        return(
            <div>
                <h1>Draft for pool {poolInfo.name}</h1>
                <div class="container">
                    <h1>Stats last season</h1>
                    <div class="floatLeft">
                        <input type="text" placeholder="Search..." onChange={event => search_players(event.target.value)}/>
                        <Tabs>
                            <div label="Forwards">
                                <table class="content-table">
                                    <tbody>
                                        <tr>
                                            <th onClick={() => sort_players("name", "F")}>name</th>
                                            <th onClick={() => sort_players("team", "F")}>team</th>
                                            <th onClick={() => sort_players("games", "F")}>Games played</th>
                                            <th onClick={() => sort_players("goals", "F")}>Goals</th>
                                            <th onClick={() => sort_players("assists", "F")}>Assists</th>
                                            <th onClick={() => sort_players("pts", "F")}>pts</th>
                                        </tr>
                                        {forw_l.filter((player) => {
                                                if(filter_players(player) === false){
                                                    return player
                                                }
                                            }).map(player => 
                                                <tr onClick={() => player_selection(player.name, player.team, "F")}>
                                                    <td>{player.name}</td>
                                                    <td>
                                                        <img src={logos[player.team]} width="30" height="30"></img>
                                                    </td>
                                                    <td>{player.stats.games}</td>
                                                    <td>{player.stats.goals}</td>
                                                    <td>{player.stats.assists}</td>
                                                    <td>{player.stats.pts}</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div> 
                            <div label="Defenders">
                                <table class="content-table">
                                    <tbody>
                                        <tr>
                                            <th onClick={() => sort_players("name", "D")}>name</th>
                                            <th onClick={() => sort_players("team", "D")}>team</th>
                                            <th onClick={() => sort_players("games", "D")}>Games played</th>
                                            <th onClick={() => sort_players("goals", "D")}>Goals</th>
                                            <th onClick={() => sort_players("assists", "D")}>Assists</th>
                                            <th onClick={() => sort_players("pts", "D")}>pts</th>
                                        </tr>
                                        {def_l.filter((player) => {
                                                if(filter_players(player) === false){
                                                        return player
                                                }
                                            }).map(player => 
                                            <tr onClick={() => player_selection(player.name, player.team, "D")}>
                                                <td>{player.name}</td>
                                                <td>
                                                    <img src={logos[player.team]} width="30" height="30"></img>
                                                </td>
                                                <td>{player.stats.games}</td>
                                                <td>{player.stats.goals}</td>
                                                <td>{player.stats.assists}</td>
                                                <td>{player.stats.pts}</td>
                                            </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div label="Goalies">
                                <table class="content-table">
                                    <tbody>
                                        <tr>
                                            <th onClick={() => sort_players("name", "G")}>name</th>
                                            <th onClick={() => sort_players("team", "G")}>team</th>
                                            <th onClick={() => sort_players("games", "G")}>Games played</th>
                                            <th onClick={() => sort_players("wins", "G")}>Win</th>
                                            <th onClick={() => sort_players("losses", "G")}>losses</th>
                                            <th onClick={() => sort_players("savePercentage", "G")}>save percentage</th>
                                        </tr>
                                        {goal_l.filter((player) => {
                                                if(filter_players(player) === false){
                                                    return player
                                                }
                                            }).map(player => 
                                            <tr onClick={() => player_selection(player.name, player.team, "G")}>
                                                <td>{player.name}</td>
                                                <td>
                                                    <img src={logos[player.team]} width="30" height="30"></img>
                                                </td>
                                                <td>{player.stats.games}</td>
                                                <td>{player.stats.wins}</td>
                                                <td>{player.stats.losses}</td>
                                                <td>{player.stats.savePercentage}</td>
                                            </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </Tabs>
                    </div>
                    <div class="floatRight">
                        <div class="floatLeft">
                            {render_color_user_turn()}
                            <h1>{selectedPlayer.name}</h1>
                            <h3 class="red-text">{message}</h3>
                            <button onClick={() => chose_player(selectedPlayer)}>choose</button>
                        </div>
                        <div class="floatRight">
                            {render_tabs_choice()}

                        </div>
                    </div>
                </div>  
            </div>
        );
    }
    else{
        return(
            <div>
                <h1>trying to join the pool draft...</h1>
            </div>
        )
    }
    
  
  }
  export default DraftPool;