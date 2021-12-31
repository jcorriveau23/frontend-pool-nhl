import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { ParticipantItem } from './participantItem';

function CreatedPool({username, poolName, poolInfo, setPoolInfo, socket}) {
    
    const [inRoom, setInRoom] = useState(false);
    const [userList, setUserList] = useState([]);
    //const [msg, setMsg] = useState(""); // TODO: add some error msg to display on the app.

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
            socket.on('roomData', (data) => { setUserList(data) });

            socket.on("poolInfo", (data) => { setPoolInfo(data) });
        }
        
    }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (event) => {
        if(event.target.type === "checkbox"){           // the host click on the start button
            if(event.target.checked){
                socket.emit('playerReady', Cookies.get('token-' + username), poolName);
            }
            else{
                socket.emit('playerNotReady', Cookies.get('token-' + username), poolName);
            }
        }
  
        else if(event.target.type === "submit"){        // the host click on the start button
            socket.emit('startDraft', Cookies.get('token-' + username), poolName)
        }    
        else if( event.target.type === "select-one" ){  // the host change a value of the pool configuration
            var poolInfoChanged = poolInfo
    
            poolInfoChanged[event.target.name] = event.target.value
            setPoolInfo(poolInfoChanged)
            socket.emit("changeRule", Cookies.get('token-' + username), poolInfo )
        }  
    }

    const render_participants = () => {
        var participants = []

        for(let i = 0; i < poolInfo.number_poolers; i++){
            if(i < userList.length){
                participants.push(<li><ParticipantItem name={userList[i].name} ready={userList[i].ready}></ParticipantItem></li>) // TODO: add a modal pop up to add that friend
            }
            else{
                participants.push(<li><ParticipantItem name="user not found" ready={false}></ParticipantItem></li>)
            }
        }
        return participants
    }

    const render_start_draft_button = () => {
        let bDisable = false

        if(userList.length === poolInfo.number_poolers){
            for(let i = 0; i < poolInfo.number_poolers; i++){
                if(userList[i].ready === false)
                    bDisable = true
            }
        }
        else
            bDisable = true

        if(username === poolInfo.owner){
            return <button onClick={handleChange} disabled={bDisable}>Start draft</button>
        }
        else{
            return
        }
    }

    if(poolInfo && inRoom){
        return(
            <div className="container">
                <h1>Match Making for Pool {poolName}</h1>
                <div className="floatLeft">
                    <h2>Rule: </h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>Number of poolers</td>
                                <td>
                                    <select 
                                        name="number_poolers" 
                                        onChange={handleChange} 
                                        disabled={/*poolInfo.owner === username? false :*/ true}
                                        value={poolInfo.number_poolers}
                                    >
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                        <option>6</option>
                                        <option>7</option>
                                        <option>8</option>
                                        <option>9</option>
                                        <option>10</option>
                                        <option>11</option>
                                        <option >12</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Number of forwards:</td>
                                <td>
                                    <select 
                                        name="number_forward" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.number_forward}
                                    >
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                        <option>6</option>
                                        <option>7</option>
                                        <option>8</option>
                                        <option>9</option>
                                        <option>10</option>
                                        <option>11</option>
                                        <option>12</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Number of defenders:</td>
                                <td>
                                    <select 
                                        name="number_defenders" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.number_defenders}
                                    >
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                        <option>6</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Number of goalies:</td>
                                <td>
                                    <select 
                                        name="number_goalies" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.number_goalies}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Number of reservists:</td>
                                <td>
                                    <select 
                                        name="number_reservist" 
                                        onChange={handleChange}
                                        disabled={poolInfo.owner === username? false : true} 
                                        value={poolInfo.number_reservist}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <h2>Points</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>pts per goal by forward:</td>
                                <td>
                                    <select 
                                        name="forward_pts_goals" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.forward_pts_goals}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per assist by forward:</td>
                                <td>
                                    <select 
                                        name="forward_pts_assists" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.forward_pts_assists}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per hat trick by forward:</td>
                                <td>
                                    <select 
                                        name="forward_pts_hattricks" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.forward_pts_hattricks}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per goal by defender:</td>
                                <td>
                                    <select 
                                        name="defender_pts_goals" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.defender_pts_goals}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per assist by defender:</td>
                                <td>
                                    <select 
                                        name="defender_pts_assits" 
                                        onChange={handleChange}
                                        disabled={poolInfo.owner === username? false : true} 
                                        value={poolInfo.defender_pts_assits}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per hat trick by defender:</td>
                                <td>
                                    <select 
                                        name="defender_pts_hattricks" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.defender_pts_hattricks}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per win by goalies</td>
                                <td>
                                    <select 
                                        name="goalies_pts_wins" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.goalies_pts_wins}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per shutout by goalies</td>
                                <td>
                                    <select 
                                        name="goalies_pts_shutouts" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.goalies_pts_shutouts}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per goal by goalies:</td>
                                <td>
                                    <select 
                                        name="goalies_pts_goals" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.goalies_pts_goals}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>pts per assist by goalies:</td>
                                <td>
                                    <select 
                                        name="goalies_pts_assists" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.goalies_pts_assists}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>next season number player protected:</td>
                                <td>
                                    <select 
                                        name="next_season_number_players_protected" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                        value={poolInfo.next_season_number_players_protected}
                                    >
                                        <option>6</option>
                                        <option>7</option>
                                        <option>8</option>
                                        <option>9</option>
                                        <option>10</option>
                                        <option>11</option>
                                        <option>12</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>number tradable draft picks:</td>
                                <td>
                                    <select 
                                        name="tradable_picks" 
                                        onChange={handleChange} 
                                        disabled={poolInfo.owner === username? false : true}
                                    >
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                    </select>
                                </td>
                            </tr>  
                        </tbody>
                    </table>
                </div>
                <div className="floatRight">
                    <label>
                        <input
                        type="checkbox"
                        onChange={handleChange}
                        /> Ready?
                    </label>
                    {render_start_draft_button()}
                    <h2>Participants: </h2>
                    <div className="pool_item">
                        <ul>
                            {render_participants()}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    else{
        return(
            <div>
                <h1>trying to fetch pool data info2...</h1>
            </div>
        )
    }
    
  
  }
  export default CreatedPool;