// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// Loader
import ClipLoader from "react-spinners/ClipLoader"

function TeamRosterBySeasonPage() {

    const [skatersStats, setSkatersStats] = useState(null)
    const [goaliesStats, setGoaliesStats] = useState(null)
    const [teamName, setTeamName] = useState("")

    var url = window.location.pathname.split('/')

    const season = url.pop();
    const teamID = url.pop();
    
    useEffect(() => {
        const urlSkaters = "https://nhl-pool-ethereum.herokuapp.com/http://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=" + teamID + "%20and%20gameTypeId=2%20and%20seasonId%3C=" + season + "%20and%20seasonId%3E=" + season // https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=8%20and%20gameTypeId=2%20and%20seasonId%3C=20172018%20and%20seasonId%3E=20172018
        const urlgoalies = "https://nhl-pool-ethereum.herokuapp.com/http://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=" + teamID + "%20and%20gameTypeId=2%20and%20seasonId%3C=" + season + "%20and%20seasonId%3E=" + season // https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=8%20and%20gameTypeId=2%20and%20seasonId%3C=20172018%20and%20seasonId%3E=20172018
        
        fetch(urlSkaters, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(playersStats => {
            setTeamName(playersStats.data[0].teamAbbrevs)
            setSkatersStats({...playersStats})
        })
        .catch(error => {alert('Error! ' + error)})

        fetch(urlgoalies, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(playersStats => {
            setGoaliesStats({...playersStats})
        })
        .catch(error => {alert('Error! ' + error)})
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    const render_team_skaters = (roster) => {
        return(
            <div>
                <h1>{teamName}</h1>
               <table  className="content-table">
                    <thead>
                        <tr>
                            <th colSpan="18">{teamName} : {season}</th>
                        </tr>
                        <tr>
                            <th colSpan="18">Skaters</th>
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
                    </thead>
                    <tbody>
                        {roster.map( (player, i) => {
                            return(
                                <tr key={i}>  
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
                    </tbody>
                </table>
            </div>
        )
    }

    const render_team_goalies = (roster) => {
        return(
            <div>
                <h1>{teamName}</h1>
               <table  className="content-table">
                    <thead>
                        <tr>
                            <th colSpan="17">Goalies</th>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Position</th>
                            <th>GP</th>
                            <th>GS</th>
                            <th>G</th>
                            <th>P</th>
                            <th>GA</th>
                            <th>GAA</th>
                            <th>W</th>
                            <th>L</th>
                            <th>OTL</th>
                            <th>PIM</th>
                            <th>SAVE %</th>
                            <th>S</th>
                            <th>SO</th>
                            <th>TOI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roster.map( (goalie, i) => {
                            return(
                                <tr key={i}>  
                                    <td>-</td>                             
                                    <td><Link to={"/playerInfo/"+ goalie.playerId} style={{ textDecoration: 'none', color: "#000099" }}>{goalie.goalieFullName}</Link></td>
                                    <td>G</td>
                                    <td>{goalie.gamesPlayed}</td>
                                    <td>{goalie.gamesStarted}</td>
                                    <td>{goalie.goals}</td>
                                    <td>{goalie.points}</td>
                                    <td>{goalie.goalsAgainst}</td>
                                    <td>{goalie.goalsAgainstAverage}</td>  
                                    <td>{goalie.wins}</td>
                                    <td>{goalie.losses}</td>
                                    <td>{goalie.otLosses}</td>
                                    <td>{goalie.penaltyMinutes}</td>
                                    <td>{goalie.savePct}</td>
                                    <td>{goalie.saves}</td>
                                    <td>{goalie.shutouts}</td>
                                    <td>{goalie.timeOnIcePerGame}</td>

                                </tr>
                            )                       
                        })}
                    </tbody>
                </table>
            </div>
        )
    }



    if( skatersStats && goaliesStats )
    { 
        return(
            <div>
                {render_team_skaters(skatersStats.data)}
                {render_team_goalies(goaliesStats.data)}
            </div>
        )
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch team roster data from nhl api...</h1>
                <ClipLoader color="#fff" loading={true} size={75}/>
            </div>
        )
    }
  }

  export default TeamRosterBySeasonPage;