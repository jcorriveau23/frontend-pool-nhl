import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';


function CreatedPool({username, poolName, poolInfo, setPoolInfo, socket}) {
    
    const [inRoom, setInRoom] = useState(false);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (socket && poolName) {
            // TODO: add some validation server socket side to prevent someone joining the pool 
            // when there is already the maximum poolers in the room
            socket.emit('joinRoom', Cookies.get('token'), poolName);
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
    }, []); // only run on this component mount and unmount

    useEffect(() => {
        if(socket){
            socket.on('roomData', (data) => { setUserList(data) });

            socket.on("poolInfo", (data) => { setPoolInfo(data) });
        }
        
    }, [socket]);


    const startDraftButton = () => {
        if(username === poolInfo.owner){
            return <button onClick={handleChange}>Start draft</button>
        }
        else{
            return
        }
    }

    const handleChange = (event) => {
        if(event.target.type === "checkbox"){           // the host click on the start button
            if(event.target.checked){
                socket.emit('playerReady', Cookies.get('token'), poolName);
            }
            else{
                socket.emit('playerNotReady', Cookies.get('token'), poolName);
            }
        }
  
        else if(event.target.type === "submit"){        // the host click on the start button
            socket.emit('startDraft', Cookies.get('token'), poolName);
        }    
        else if( event.target.type === "select-one" ){  // the host change a value of the pool configuration
            var poolInfoChanged = poolInfo
    
            poolInfoChanged[event.target.name] = event.target.value
            setPoolInfo(poolInfoChanged)
            socket.emit("changeRule", Cookies.get('token'), poolInfo )
        }  
      }

    if(poolInfo){
        return(
            <div class="container">
                <h1>Match Making for Pool {poolName}</h1>
                <div class="floatLeft">
                    <h2>Rule: </h2>
                    <p>Number of poolers:</p>
                    <select 
                        name="number_poolers" 
                        onChange={handleChange} 
                        disabled={poolInfo.owner === username? false : true}
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
                    <p>Number of forwards:</p>
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
                    <p>Number of defenders:</p>
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
                    <p>Number of goalies:</p>
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
                    <p>Number of reservists:</p>
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
                    <h2>Points</h2>
                    <p>pts per goal by forward:</p>
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
                    <p>pts per assist by forward:</p>
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
                    <p>pts per hat trick by forward:</p>
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
                    <p>pts per goal by defender:</p>
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
                    <p>pts per assist by defender:</p>
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
                    <p>pts per hat trick by defender:</p>
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
                    <p>pts per win by goalies</p>
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
                    <p>pts per shutout by goalies</p>
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
                    <p>pts per goal by goalies:</p>
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
                    <p>pts per assist by goalies:</p>
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
                    <p>next season number player protected:</p>
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
                    <p>number tradable draft picks:</p>
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
                </div>
                <div class="floatRight">
                    <label>
                        <input
                        type="checkbox"
                        onChange={handleChange}
                        /> Ready?
                    </label>
                    {startDraftButton()}
                    <h2>Participants: </h2>
                    {userList.map(user =>
                        <li>{user.name}    Ready: {user.ready.toString()}</li>
                    )}
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