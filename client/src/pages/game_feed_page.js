// https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live

//json["boxscore"]["home"]["teamStats"]   
//json["boxscore"]["away"]["teamStats"]["players"] // for players specific game stats.

import React, { useState, useEffect } from 'react';

import { useParams } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 

function GameFeedPage() {

    const [gameInfo, setGameInfo] = useState(null)
    const url = window.location.pathname.split('/').pop();
    console.log(url)
    
    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/game/' + url + "/feed/live")
        .then(response => response.json())
        .then(gameInfo => {
            setGameInfo({...gameInfo})
        })

    }, [url]); 

    if(gameInfo != null)
    { 
        console.log(gameInfo)

        return(
            <div>
                <img src={logos[gameInfo.liveData.boxscore.teams.home.team.name]} width="50" height="50"></img>
                <table  class="content-table">
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>R</th>
                        <th>G</th>
                        <th>A</th>
                        <th>P</th>
                        <th>+/-</th>
                        <th>PIM</th>
                        <th>SOG</th>
                        <th>HITS</th>
                        <th>BLKS</th>
                        <th>GVA</th>
                        <th>TKA</th>
                        <th>FO%</th>
                        <th>TOI</th>
                        <th>PP TOI</th>
                        <th>SH TOI</th>
                    </tr>
                    {Object.keys(gameInfo.liveData.boxscore.teams.home.players).map( (key, index) => {
                        if(gameInfo.liveData.boxscore.teams.home.players[key].stats.hasOwnProperty("skaterStats"))
                        {
                            return(
                                <tr>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].jerseyNumber}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].person.fullName}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].position.abbreviation}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.goals}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.assists}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.goals + gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.assists}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.plusMinus}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.penaltyMinutes}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.shots}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.hits}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.blocked}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.giveaways}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.takeaways}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.faceOffWins / gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.faceOffTaken}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.timeOnIce}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.powerPlayTimeOnIce}</td>
                                    <td>{gameInfo.liveData.boxscore.teams.home.players[key].stats.skaterStats.shortHandedTimeOnIce}</td>

                                </tr>
                            )
                            
                        }
                        
                    })}
                </table>
                <img src={logos[gameInfo.liveData.boxscore.teams.away.team.name]} width="50" height="50"></img>
            </div>
        );
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch game data from nhl api...</h1>
            </div>
        )
    }

    
  
  }
  export default GameFeedPage;