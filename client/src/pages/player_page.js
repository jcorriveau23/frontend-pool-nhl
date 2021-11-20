import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 

function PlayerPage() {

    const [playerStats, setPlayerStats] = useState(null)
    const [playerInfo, setPlayerInfo] = useState(null)

    const playerID = window.location.pathname.split('/').pop();
    console.log(playerID)
    
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
                        <th colspan="2">{info.fullName}</th>                        
                    </tr>
                    <tr>
                        <td>Position</td>
                        <td>{info.primaryPosition.abbreviation}</td>                        
                    </tr>
                    <tr>
                        <td>Number</td>
                        <td>{info.primaryNumber}</td>                        
                    </tr>
                    <tr>
                        <td>bitrhDate</td>
                        <td>{info.birthDate}</td>                        
                    </tr>
                    <tr>
                        <td>Age</td>
                        <td>{info.currentAge}</td>                        
                    </tr>
                    <tr>
                        <td>Height</td>
                        <td>{info.height}</td>                        
                    </tr>
                    <tr>
                        <td>Weight</td>
                        <td>{info.weight}</td>                        
                    </tr>
                </table>
               <table  class="content-table">
                    <tr>
                        <th colspan="18">Career Stats</th>
                    </tr>
                    <tr>
                        <th>Season</th>
                        <th>Team</th>
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
                                <td>{season.season}</td>                                
                                <td>{season.team.name}</td>
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
        console.log(playerStats)
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