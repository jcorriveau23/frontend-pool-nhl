// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 

function TeamRosterBySeasonPage() {

    const [playerStatsList, setPlayerStatsList] = useState(null)
    const [teamName, setTeamName] = useState("")

    var url = window.location.pathname.split('/')

    const season = url.pop();
    const teamID = url.pop();
    
    useEffect(() => {
        const url = "https://nhl-pool-ethereum.herokuapp.com/http://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=" + teamID + "%20and%20gameTypeId=2%20and%20seasonId%3C=" + season + "%20and%20seasonId%3E=" + season // https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=8%20and%20gameTypeId=2%20and%20seasonId%3C=20172018%20and%20seasonId%3E=20172018
        
        fetch(url, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(playersStats => {
            setTeamName(playersStats.data[0].teamAbbrevs)
            setPlayerStatsList({...playersStats})
        })
        .catch(error => {alert('Error! ' + error)})
    }, []);
    
    const render_team_players = (roster) => {
        return(
            <div>
                <h1>{teamName}</h1>
               <table  class="content-table">
                    <tr>
                        <th colSpan="18">{teamName} : {season}</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>GP</th>
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
                    {roster.map( (player, i) => {
                        return(
                            <tr>  
                                <td>-</td>                             
                                <td><Link to={"/playerInfo/"+ player.playerId} style={{ textDecoration: 'none', color: "#000099" }}>{player.skaterFullName}</Link></td>
                                <td>{player.positionCode}</td>
                                <td>{player.gamesPlayed}</td>
                                <td>{player.goals}</td>
                                <td>{player.assists}</td>
                                <td>{player.points}</td>
                                <td>{player.plusMinus}</td>  
                                <td>{player.penaltyMinutes}</td>
                                <td>{player.shots}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>{player.faceoffWinPct}</td>
                                <td>{player.timeOnIcePerGame}</td>
                                <td>-</td>
                                <td>-</td>

                            </tr>
                        )                       
                    })}
                </table> 
            </div>
        )
    }

    if( playerStatsList )
    { 
        return(
            <div>
                {render_team_players(playerStatsList.data)}
            </div>
        )
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch player data from nhl api...</h1>
            </div>
        )
    }
  }

  export default TeamRosterBySeasonPage;