import React from 'react'

// teams logo
import logos from "./img/images" 

export const GameItem = ({gameData}) => {

    console.log(gameData)

    return (
        
        <table>
            <tr>
                <td>{new Date(Date.parse(gameData.gameData.datetime.dateTime)).toLocaleString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</td>
            </tr>
            <tr>
                <td><img src={logos[gameData.liveData.boxscore.teams.home.team.name] } width="30" height="30"></img></td>
                <td>{gameData.liveData.boxscore.teams.home.teamStats.teamSkaterStats.goals}</td>
            </tr>
            <tr>
                <td><img src={logos[gameData.liveData.boxscore.teams.away.team.name] } width="30" height="30"></img></td>
                <td>{gameData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.goals}</td>
            </tr>
        </table>
    )
}