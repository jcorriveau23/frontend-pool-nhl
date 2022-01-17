import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link, useLocation } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 
import GamePrediction from '../components/GameBet/gamePrediction';

// component
import { GameRecap } from '../components/game_feed_page/gameRecap';
import { PeriodRecap } from '../components/game_feed_page/periodRecap';
import { OtherGameContent } from '../components/game_feed_page/otherGameContent';

// Loader
import ClipLoader from "react-spinners/ClipLoader"

// css
import '../components/react-tabs.css';
import "../components/game_feed_page/goalItem.css";


function GameFeedPage({user, contract}) {

    const [gameInfo, setGameInfo] = useState(null)
    const [gameContent, setGameContent] = useState(null)
    const [tabIndex, setTabIndex] = useState(0);
    const [homeRosterPreview, setHomeRosterPreview] = useState(null)
    const [awayRosterPreview, setAwayRosterPreview] = useState(null)
    const [prevGameID, setPrevGameID] = useState("")
    const [homeTeamSkaters, setHomeTeamSkaters] = useState([])
    const [awayTeamSkaters, setAwayTeamSkaters] = useState([])
    const location = useLocation()

    const gameID = window.location.pathname.split('/').pop();
    
    useEffect(() => {
        if(prevGameID !== gameID)
        {
            setHomeTeamSkaters(null)
            setAwayTeamSkaters(null)

            fetch('https://statsapi.web.nhl.com/api/v1/game/' + gameID + "/feed/live")  // https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live
            .then(response => response.json())
            .then(gameInfo => {
                //console.log(gameInfo)
                setGameInfo(gameInfo)
    
                if(gameInfo.gameData.status.abstractGameState === "Preview"){
                    fetch('https://statsapi.web.nhl.com/api/v1/teams/' + gameInfo.gameData.teams.away.id + '/roster') // https://statsapi.web.nhl.com/api/v1/teams/22/roster
                    .then(response => response.json())
                    .then(teamInfo => {
                        setAwayRosterPreview(teamInfo.roster)
                    })
    
                    fetch('https://statsapi.web.nhl.com/api/v1/teams/' + gameInfo.gameData.teams.home.id + '/roster') // https://statsapi.web.nhl.com/api/v1/teams/22/roster
                    .then(response => response.json())
                    .then(teamInfo => {
                        setHomeRosterPreview(teamInfo.roster)
                    })
                }
                else{
                    var homeSkaters = gameInfo.liveData.boxscore.teams.home.skaters.filter((key) => {
                        if(gameInfo.liveData.boxscore.teams.home.players["ID" + key].stats.skaterStats) return key
                        else return null
                    })
                    setHomeTeamSkaters(homeSkaters)
                    var awaySkaters = gameInfo.liveData.boxscore.teams.away.skaters.filter((key) => {
                        if(gameInfo.liveData.boxscore.teams.away.players["ID" + key].stats.skaterStats) return key
                        else return null
                    })
                    setAwayTeamSkaters(awaySkaters)
                }
            })
    
            fetch('https://statsapi.web.nhl.com/api/v1/game/' + gameID + "/content")  // https://statsapi.web.nhl.com/api/v1/game/2021020128/content
            .then(response => response.json())
            .then(gameContent => {
                //console.log(gameContent)
                setGameContent(gameContent)
            })
        }
        
        setPrevGameID(gameID)

        // return () => {
        //     setGameInfo({}); // cleanup the state on unmount
        // };   // TODO: there is a leak warning here and we need to investigate why when repairing the leak, we get the error corrected.

    }, [location]);   // eslint-disable-line react-hooks/exhaustive-deps
    
    const render_team_stats = (team, isHome) => {
        var skaters
        if(isHome) skaters = homeTeamSkaters
        else skaters = awayTeamSkaters
        //console.log(team.players)
        return(
            <div>
            <table  className="content-table">
                <thead>
                    <tr>
                        <th colSpan={17}>Skaters</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>R</th>
                        <th onClick={() => sort_by_stats(isHome, "goals")}>G</th>
                        <th onClick={() => sort_by_stats(isHome, "assists")}>A</th>
                        <th onClick={() => sort_by_stats(isHome, "points")}>P</th>
                        <th onClick={() => sort_by_stats(isHome, "plusMinus")}>+/-</th>
                        <th onClick={() => sort_by_stats(isHome, "penaltyMinutes")}>PIM</th>
                        <th onClick={() => sort_by_stats(isHome, "shots")}>SOG</th>
                        <th onClick={() => sort_by_stats(isHome, "hits")}>HITS</th>
                        <th onClick={() => sort_by_stats(isHome, "blocked")}>BLKS</th>
                        <th onClick={() => sort_by_stats(isHome, "giveaways")}>GVA</th>
                        <th onClick={() => sort_by_stats(isHome, "takeaways")}>TKA</th>
                        <th>FO%</th>
                        <th>TOI</th>
                        <th>PP TOI</th>
                        <th>SH TOI</th>
                    </tr>
                </thead>
                <tbody>
                    {skaters.map( (key, i) => {
                        key = "ID" + key
                        return(
                            <tr key={i}>
                                <td>{team.players[key].jerseyNumber}</td>
                                <td><Link to={"/playerInfo/"+team.players[key].person.id} style={{ textDecoration: 'none', color: "#000099" }}>{team.players[key].person.fullName}</Link></td>
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
                                <td>{team.players[key].stats.skaterStats.faceOffPct}</td>
                                <td>{team.players[key].stats.skaterStats.timeOnIce}</td>
                                <td>{team.players[key].stats.skaterStats.powerPlayTimeOnIce}</td>
                                <td>{team.players[key].stats.skaterStats.shortHandedTimeOnIce}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <table  className="content-table">
                <thead>
                    <tr>
                        <th colSpan={9}>Goalie(s)</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>R</th>
                        <th>TOI</th>
                        <th>G</th>
                        <th>A</th>
                        <th>Shots</th>
                        <th>Saves</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    {team.goalies.map( (key, i) => {
                        key = "ID" + key
                        return(
                            <tr key={i}>
                                <td>{team.players[key].jerseyNumber}</td>
                                <td><Link to={"/playerInfo/"+team.players[key].person.id} style={{ textDecoration: 'none', color: "#000099" }}>{team.players[key].person.fullName}</Link></td>
                                <td>{team.players[key].position.abbreviation}</td>
                                <td>{team.players[key].stats.goalieStats.timeOnIce}</td>
                                <td>{team.players[key].stats.goalieStats.goals}</td>
                                <td>{team.players[key].stats.goalieStats.assists}</td>
                                <td>{team.players[key].stats.goalieStats.shots}</td>
                                <td>{team.players[key].stats.goalieStats.saves}</td>
                                <td>{Math.round((team.players[key].stats.goalieStats.savePercentage + Number.EPSILON) * 100) / 100}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        )
    }

    const render_team_roster = (roster) => {
        return(
            <div>
            <table  className="content-table">
                <thead>
                    <tr>
                        <th colSpan={17}>Skaters</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>R</th>
                    </tr>
                </thead>
                <tbody>
                    {roster.map( (player, i) => {
                        return(
                            <tr key={i}>
                                <td>{player.jerseyNumber}</td>
                                <td><Link to={"/playerInfo/" + player.person.id} style={{ textDecoration: 'none', color: "#000099" }}>{player.person.fullName}</Link></td>
                                <td>{player.position.abbreviation}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        )
    }

    const render_game_stats = (teams, linescores) => {
        let nAwayTeamShootoutScore = teams.away.teamStats.teamSkaterStats.goals
        let nHomeTeamShootoutScore = teams.home.teamStats.teamSkaterStats.goals

        if(linescores.hasShootout)
        {
            if(linescores.shootoutInfo.away.scores > linescores.shootoutInfo.home.scores)
                nAwayTeamShootoutScore = teams.away.teamStats.teamSkaterStats.goals + 1
            else
                nHomeTeamShootoutScore = teams.home.teamStats.teamSkaterStats.goals + 1
        }
        return(
            <table  className="goalItem">
                <thead>
                    <tr>
                        <th><img src={logos[ teams.away.team.name ]} alt="" width="30" height="30"></img></th>
                        <th>Summary</th>
                        <th><img src={logos[ teams.home.team.name ]} alt="" width="30" height="30"></img></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{nAwayTeamShootoutScore}</td>
                        <th>Goals</th>
                        <td>{nHomeTeamShootoutScore}</td>
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
                </tbody>
            </table>
        )
    }

    const sort_by_stats = (isHome, stat) => {
        var array

        if(isHome){
            array = homeTeamSkaters.sort((first, second) => {
                if(stat === "points") return ((gameInfo.liveData.boxscore.teams.home.players["ID" + second].stats.skaterStats.goals + gameInfo.liveData.boxscore.teams.home.players["ID" + second].stats.skaterStats.assists) - (gameInfo.liveData.boxscore.teams.home.players["ID" + first].stats.skaterStats.goals + gameInfo.liveData.boxscore.teams.home.players["ID" + first].stats.skaterStats.assists))
                else return (gameInfo.liveData.boxscore.teams.home.players["ID" + second].stats.skaterStats[stat] - gameInfo.liveData.boxscore.teams.home.players["ID" + first].stats.skaterStats[stat])
            })
            setHomeTeamSkaters([...array])
        }
        else{
            array = awayTeamSkaters.sort((first, second) => {
                if(stat === "points") return ((gameInfo.liveData.boxscore.teams.away.players["ID" + second].stats.skaterStats.goals + gameInfo.liveData.boxscore.teams.away.players["ID" + second].stats.skaterStats.assists) - (gameInfo.liveData.boxscore.teams.away.players["ID" + first].stats.skaterStats.goals + gameInfo.liveData.boxscore.teams.away.players["ID" + first].stats.skaterStats.assists))
                else return (gameInfo.liveData.boxscore.teams.away.players["ID" + second].stats.skaterStats[stat] - gameInfo.liveData.boxscore.teams.away.players["ID" + first].stats.skaterStats[stat])
            })
            setAwayTeamSkaters([...array])
        }
    }

    if(gameInfo && gameContent)
    { 
        return(
            <div>
                <div>
                    <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                        <TabList>
                            <Tab>Game stats</Tab>
                            <Tab>Game recap</Tab>
                            <Tab>{<img src={logos[ gameInfo.liveData.boxscore.teams.home.team.name ]} alt="" width="30" height="30"></img>}</Tab>
                            <Tab>{<img src={logos[ gameInfo.liveData.boxscore.teams.away.team.name ]} alt="" width="30" height="30"></img>}</Tab>
                            {contract? <Tab>Prediction Market</Tab> : null}
                        </TabList>
                        <TabPanel>
                            {render_game_stats(gameInfo.liveData.boxscore.teams, gameInfo.liveData.linescore)}
                        </TabPanel>
                        <TabPanel>
                            <div>
                            <Tabs>
                                <TabList>
                                    <Tab>Short Recap</Tab>
                                    <Tab>Long Recap</Tab>
                                </TabList>  
                                <TabPanel>
                                    <div className='min-width'>
                                        <GameRecap gameContent={gameContent} isEditorial={true}></GameRecap>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div>
                                        <GameRecap gameContent={gameContent} isEditorial={false}></GameRecap>
                                    </div>
                                </TabPanel>
                            </Tabs>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {gameInfo.gameData.status.abstractGameState === "Preview" && homeRosterPreview? render_team_roster(homeRosterPreview) : gameInfo.gameData.status.abstractGameState !== "Preview" && homeTeamSkaters? render_team_stats(gameInfo.liveData.boxscore.teams.home, true) : null}
                        </TabPanel>
                        <TabPanel>
                            {gameInfo.gameData.status.abstractGameState === "Preview" && awayRosterPreview? render_team_roster(awayRosterPreview) : gameInfo.gameData.status.abstractGameState !== "Preview" && awayTeamSkaters? render_team_stats(gameInfo.liveData.boxscore.teams.away, false) : null}
                        </TabPanel>
                        {
                            contract?
                            <TabPanel>
                                <div>
                                    {<GamePrediction gameID={gameID} gameInfo={gameInfo} user={user} contract={contract}/>}
                                </div>
                            </TabPanel>
                            : null
                        }
                        
                    </Tabs>
                    <div>
                        {gameInfo.gameData.status.abstractGameState !== "Preview"?
                            <>
                                <PeriodRecap gameContent={gameContent} period={"1"}></PeriodRecap>
                                <PeriodRecap gameContent={gameContent} period={"2"}></PeriodRecap>
                                <PeriodRecap gameContent={gameContent} period={"3"}></PeriodRecap>
                                <PeriodRecap gameContent={gameContent} period={"4"}></PeriodRecap>
                                <OtherGameContent gameContent={gameContent}></OtherGameContent>
                            </> :
                            <h1>Game not started yet.</h1>
                        }
                    </div>
                    {/* <h1>{gameInfo.liveData.plays.currentPlay.about.goals.away}</h1>
                    <h1>{gameInfo.liveData.plays.currentPlay.about.goals.home}</h1> */}
                </div>
                
            </div>
        )
       
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch game data from nhl api...</h1>
                <ClipLoader color="#fff" loading={true} size={75} />
            </div>
        )
    }
  }

  export default GameFeedPage;