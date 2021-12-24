import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 

function PlayerPage() {

    const [playerStats, setPlayerStats] = useState(null)
    const [playerInfo, setPlayerInfo] = useState(null)

    const playerID = window.location.pathname.split('/').pop();
    
    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/people/' + playerID + '/stats?stats=yearByYear')  // https://statsapi.web.nhl.com/api/v1/people/8475726/stats?stats=yearByYear
        .then(response => response.json())
        .then(playerStats => {
            setPlayerStats({...playerStats})
        })
        fetch('https://statsapi.web.nhl.com/api/v1/people/' + playerID)  // https://statsapi.web.nhl.com/api/v1/people/8475726/stats?stats=yearByYear
        .then(response => response.json())
        .then(playerInfo => {
            setPlayerInfo({...playerInfo})
        })

    }, []);
    
    const render_player_stats = (stats, info) => {
        return(
            <div>
                <table  class="content-table">
                <h1>{info.fullName}</h1>
                    <tr>
                        <th>Position</th>
                        <td>{info.primaryPosition.abbreviation}</td>                        
                    </tr>
                    <tr>
                        <th>Number</th>
                        <td>{info.primaryNumber}</td>                        
                    </tr>
                    <tr>
                        <th>bitrhDate</th>
                        <td>{info.birthDate}</td>                        
                    </tr>
                    <tr>
                        <th>Age</th>
                        <td>{info.currentAge}</td>                        
                    </tr>
                    <tr>
                        <th>Height</th>
                        <td>{info.height}</td>                        
                    </tr>
                    <tr>
                        <th>Weight</th>
                        <td>{info.weight}</td>                        
                    </tr>
                </table>
               <table  class="content-table">
                    <tr>
                        <th colspan="18">Career Stats</th>
                    </tr>
                    <tr>
                        <th>Team</th>
                        <th>Season</th>
                        <th>League</th>
                        <th>Games</th>
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
                    {stats.map( (season, index) => {
                        return(
                            <tr>
                                <td>{season.team.name}</td>
                                {
                                    season.league.id == 133 ? // nhl league
                                        <td><Link to={"/teamRosterBySeason/"+ season.team.id + "/" + season.season} style={{ textDecoration: 'none', color: "#000099" }}>{season.season.slice(0,4) + "-" + season.season.slice(4)}</Link></td>
                                        : <td>{season.season.slice(0,4) + "-" + season.season.slice(4)}</td>
                                }
                                <td>{season.league.name}</td>
                                <td>{season.stat.games}</td>
                                <td>{season.stat.goals}</td>
                                <td>{season.stat.assists}</td>
                                <td>{season.stat.points}</td>
                                <td>-</td>  
                                <td>{season.stat.penaltyMinutes}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>{season.stat.faceOffPct}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>

                            </tr>
                        )                       
                    })}
                </table> 
            </div>
        )
    }

    if(playerStats && playerInfo)
    { 
        return(
            <div>
                {render_player_stats(playerStats.stats[0].splits, playerInfo.people[0])}
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

  export default PlayerPage;