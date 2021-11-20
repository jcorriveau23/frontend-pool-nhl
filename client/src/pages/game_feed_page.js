import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import Tabs from "../components/Tabs"

// teams logo
import logos from "../components/img/images" 

function GameFeedPage() {

    const [gameInfo, setGameInfo] = useState(null)

    const gameID = window.location.pathname.split('/').pop();
    console.log(gameID)
    
    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/game/' + gameID + "/feed/live")  // https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live
        .then(response => response.json())
        .then(gameInfo => {
            setGameInfo({...gameInfo})
        })

    }, [gameID]);
    
    const render_team_stats = (team) => {
        return(
            <div label={team.team.name}>
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
                    {Object.keys(team.players).map( (key, index) => {
                        if(team.players[key].stats.hasOwnProperty("skaterStats"))
                        {
                            return(
                                <tr>
                                    <td>{team.players[key].jerseyNumber}</td>
                                    <td><Link to={"/playerInfo/"+team.players[key].person.id} style={{ textDecoration: 'none', color: "white" }}>{team.players[key].person.fullName}</Link></td>
                                    <td>{team.players[key].position.abbreviation}</td>
                                    <td>{team.players[key].stats.skaterStats.goals}</td>
                                    <td>{team.players[key].stats.skaterStats.assists}</td>
                                    <td>{team.players[key].stats.skaterStats.goals + team.players[key].stats.skaterStats.assists}</td>
                                    <td>{team.players[key].stats.skaterStats.plusMinus}</td>
                                    <td>{team.players[key].stats.skaterStats.penaltyMinutes}</td>
                                    <td>{team.players[key].stats.skaterStats.shots}</td>
                                    <td>{team.players[key].stats.skaterStats.hits}</td>
                                    <td>{team.players[key].stats.skaterStats.blocked}</td>
                                    <td>{team.players[key].stats.skaterStats.giveaways}</td>
                                    <td>{team.players[key].stats.skaterStats.takeaways}</td>
                                    <td>{team.players[key].stats.skaterStats.faceOffWins === 0 || team.players[key].stats.skaterStats.faceOffTaken === 0? 0 : team.players[key].stats.skaterStats.faceOffWins / team.players[key].stats.skaterStats.faceOffTaken}</td>
                                    <td>{team.players[key].stats.skaterStats.timeOnIce}</td>
                                    <td>{team.players[key].stats.skaterStats.powerPlayTimeOnIce}</td>
                                    <td>{team.players[key].stats.skaterStats.shortHandedTimeOnIce}</td>
                                </tr>
                            )
                        }
                    })}
                </table>
            </div>
        )
    }

    const render_game_stats = (teams) => {
        return(
            <div label="Game stats">
                <table  class="content-table">
                    <tr>
                        <th><img src={logos[ teams.away.team.name ]} width="30" height="30"></img></th>
                        <th>Summary</th>
                        <th><img src={logos[ teams.home.team.name ]} width="30" height="30"></img></th>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.goals}</td>
                        <th>Goals</th>
                        <td>{teams.home.teamStats.teamSkaterStats.goals}</td>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.shots}</td>
                        <th>Shots on Goal</th>
                        <td>{teams.home.teamStats.teamSkaterStats.shots}</td>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.faceOffWinPercentage}</td>
                        <th>Faceoff %</th>
                        <td>{teams.home.teamStats.teamSkaterStats.faceOffWinPercentage}</td>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.powerPlayGoals + " / " + teams.away.teamStats.teamSkaterStats.powerPlayOpportunities}</td>
                        <th>Power Play</th>
                        <td>{teams.home.teamStats.teamSkaterStats.powerPlayGoals + " / " + teams.home.teamStats.teamSkaterStats.powerPlayOpportunities}</td>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.pim}</td>
                        <th>PIM</th>
                        <td>{teams.home.teamStats.teamSkaterStats.pim}</td>
                    </tr>
                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.hits}</td>
                        <th>Hits</th>
                        <td>{teams.home.teamStats.teamSkaterStats.hits}</td>
                    </tr>

                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.blocked}</td>
                        <th>Blocks</th>
                        <td>{teams.home.teamStats.teamSkaterStats.blocked}</td>
                    </tr>

                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.giveaways}</td>
                        <th>Giveaways</th>
                        <td>{teams.home.teamStats.teamSkaterStats.giveaways}</td>
                    </tr>

                    <tr>
                        <td>{teams.away.teamStats.teamSkaterStats.takeaways}</td>
                        <th>Takeaways</th>
                        <td>{teams.home.teamStats.teamSkaterStats.takeaways}</td>
                    </tr>


                </table>
            </div>
        )
    }

    if(gameInfo)
    { 
        return(
            <div>
                <Tabs>
                    {render_team_stats(gameInfo.liveData.boxscore.teams.home)}
                    {render_game_stats(gameInfo.liveData.boxscore.teams)}
                    {render_team_stats(gameInfo.liveData.boxscore.teams.away)}
                </Tabs>
            </div>
        )
       
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