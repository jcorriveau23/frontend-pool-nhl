import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// Loader
import ClipLoader from "react-spinners/ClipLoader"

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

    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    const render_player_stats = (stats, info) => {
        return(
            <div>
                <table  className="content-table">
                    <thead>
                        <tr>
                            <th colSpan={2}>{info.fullName}</th>
                        </tr>
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>
                {
                    info.primaryPosition.abbreviation !== "G"?
                    render_skater_stats(stats) :
                    render_goalie_stats(stats)
                }
            </div>
        )
    }

    const render_skater_stats = (stats) => {
        var totGames = 0
        var totGoals = 0
        var totAssists = 0
        var totPoints = 0
        var totPlusMinus = 0
        var totPenaltyMinutes = 0
        var totShots = 0
        var totHits = 0
        var totBlocks = 0
        var totPPG = 0
        
        console.log(stats)
        return(
            <table  className="content-table">
                <thead>
                    <tr>
                        <th colSpan="18">Career Stats</th>
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
                        <th>S</th>
                        <th>S%</th>
                        <th>HITS</th>
                        <th>BLKS</th>
                        <th>PPG</th>
                        <th>FO%</th>
                        <th>TOI</th>
                        <th>PP TOI</th>
                        <th>SH TOI</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map( (season, i) => {
                        if(season.league.id === 133){
                            totGames += season.stat.games
                            totGoals += season.stat.goals
                            totAssists += season.stat.assists
                            totPoints += season.stat.points
                            totPlusMinus += season.stat.plusMinus
                            totPenaltyMinutes += parseInt(season.stat.penaltyMinutes)
                            totShots += season.stat.shots
                            totHits += season.stat.hits
                            totBlocks += season.stat.blocked
                            totPPG += season.stat.powerPlayGoals
                        }
                        return(
                            <tr key={i}>
                                <td>{season.team.name}</td>
                                {
                                    season.league.id === 133 ? // nhl league
                                        <td><Link to={"/teamRosterBySeason/"+ season.team.id + "/" + season.season} style={{ textDecoration: 'none', color: "#000099" }}>{season.season.slice(0,4) + "-" + season.season.slice(4)}</Link></td>
                                        : <td>{season.season.slice(0,4) + "-" + season.season.slice(4)}</td>
                                }
                                <td>{season.league.name}</td>
                                <td>{season.stat.games}</td>
                                <td>{season.stat.goals}</td>
                                <td>{season.stat.assists}</td>
                                <td>{season.stat.points}</td>
                                <td>{season.stat.plusMinus}</td>  
                                <td>{season.stat.penaltyMinutes}</td>
                                <td>{season.stat.shots}</td>
                                <td>{season.stat.shotPct}</td>
                                <td>{season.stat.hits}</td>
                                <td>{season.stat.blocked}</td>
                                <td>{season.stat.powerPlayGoals}</td>
                                <td>{season.stat.faceOffPct}</td>
                                <td>{season.stat.timeOnIce}</td>
                                <td>{season.stat.powerPlayTimeOnIce}</td>
                                <td>{season.stat.shortHandedTimeOnIce}</td>

                            </tr>
                        )                       
                    })}
                    <tr>
                        <th>total nhl</th>
                        <th>-</th>
                        <th>-</th>
                        <th>{totGames}</th>
                        <th>{totGoals}</th>
                        <th>{totAssists}</th>
                        <th>{totPoints}</th>
                        <th>{totPlusMinus}</th>
                        <th>{totPenaltyMinutes}</th>
                        <th>{totShots}</th>
                        <th>-</th>
                        <th>{totHits}</th>
                        <th>{totBlocks}</th>
                        <th>{totPPG}</th>
                        <th>-</th>
                        <th>-</th>
                        <th>-</th>
                        <th>-</th>
                    </tr>
                </tbody>
            </table> 
        )
    }

    const render_goalie_stats = (stats) => {
        var totGames = 0
        var totGameStarted = 0
        var totGoalAgainst = 0
        var totWins = 0
        var totLosses = 0
        var totOT = 0
        var totSaves = 0
        var totShotAgainst = 0
        var totShutout = 0
        return(
            <table  className="content-table">
                <thead>
                    <tr>
                        <th colSpan="14">Career Stats</th>
                    </tr>
                    <tr>
                        <th>Team</th>
                        <th>Season</th>
                        <th>League</th>
                        <th>Games</th>
                        <th>GS</th>
                        <th>GAA</th>
                        <th>GA</th>
                        <th>W</th>
                        <th>L</th>
                        <th>OT</th>
                        <th>save %</th>
                        <th>S</th>
                        <th>SA</th>
                        <th>SO</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map( (season, i) => {
                        if(season.league.id === 133){
                            totGames += season.stat.games
                            totGameStarted += season.stat.gamesStarted
                            totGoalAgainst += season.stat.goalsAgainst
                            totWins += season.stat.wins
                            totLosses += season.stat.losses
                            totOT += season.stat.ot
                            totSaves += season.stat.saves
                            totShotAgainst += season.stat.shotsAgainst
                            totShutout += season.stat.shutouts
                        }
                        return(
                            <tr key={i}>
                                <td>{season.team.name}</td>
                                {
                                    season.league.id === 133 ? // nhl league
                                        <td><Link to={"/teamRosterBySeason/"+ season.team.id + "/" + season.season} style={{ textDecoration: 'none', color: "#000099" }}>{season.season.slice(0,4) + "-" + season.season.slice(4)}</Link></td>
                                        : <td>{season.season.slice(0,4) + "-" + season.season.slice(4)}</td>
                                }
                                <td>{season.league.name}</td>
                                <td>{season.stat.games}</td>
                                <td>{season.stat.gamesStarted}</td>
                                <td>{season.stat.goalAgainstAverage}</td>
                                <td>{season.stat.goalsAgainst}</td>
                                <td>{season.stat.wins}</td>
                                <td>{season.stat.losses}</td>
                                <td>{season.stat.ot}</td>
                                <td>{season.stat.savePercentage}</td>
                                <td>{season.stat.saves}</td>
                                <td>{season.stat.shotsAgainst}</td>
                                <td>{season.stat.shutouts}</td>
                            </tr>
                        )                       
                    })}
                    <tr>
                        <th>total nhl</th>
                        <th>-</th>
                        <th>-</th>
                        <th>{totGames}</th>
                        <th>{totGameStarted}</th>
                        <th>-</th>
                        <th>{totGoalAgainst}</th>
                        <th>{totWins}</th>
                        <th>{totLosses}</th>
                        <th>{totOT}</th>
                        <th>-</th>
                        <th>{totSaves}</th>
                        <th>{totShotAgainst}</th>
                        <th>{totShutout}</th>
                    </tr>
                </tbody>
            </table> 
        )
    }

    if( playerStats && playerInfo )
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
                <ClipLoader color="#fff" loading={true} size={75} />
            </div>
        )
    }
  }

  export default PlayerPage;