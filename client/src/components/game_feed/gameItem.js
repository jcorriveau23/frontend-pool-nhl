import React from 'react'
import { Link } from 'react-router-dom'

// teams logo
import logos from "../img/images" 

export const GameItem = ({gameData}) => {
    return (
        
        <table>
            <tr>
                <td>{new Date(Date.parse(gameData.gameDate)).toLocaleString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</td>
            </tr>
            <tr>
                <td><img src={logos[gameData.teams.away.team.name] } width="30" height="30"></img></td>
                <td>{gameData.teams.away.score}</td>
            </tr>
            <tr>
                <td><img src={logos[gameData.teams.home.team.name] } width="30" height="30"></img></td>
                <td>{gameData.teams.home.score}</td>
            </tr>
            <tr>
                <Link to={'/gameFeed/' + gameData.gamePk}>More...</Link>
            </tr>
        </table>
    )
}