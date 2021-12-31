import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'

// component
import { GameItem } from "./gameItem";
import DatePicker from "react-datepicker";

// css
import './todayGamesFeed.css'
import "react-datepicker/dist/react-datepicker.css";

function TodayGamesFeed() {

    const [gamesStats, setGamesStats] = useState([])
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        const newDate = new Date(date.setHours(0))
        var formatDate = newDate.toISOString().slice(0, 10)

        fetch("https://statsapi.web.nhl.com/api/v1/schedule?startDate=" + formatDate + '&endDate=' + formatDate)
        .then(response => response.json())
        .then(todayGamesData => {
            if(todayGamesData.dates[0])
            {
                setGamesStats([...todayGamesData.dates[0].games])
            }
            else
            {
                setGamesStats([]) 
            }
            
        })

    }, [date]); // fetch all todays games info from nhl api on this component mount.

    return (
        <div className="todayGamesFeed">
            <DatePicker selected={date} onChange={(date) => setDate(date)} dateFormat="P"/>
            <ul>
                {gamesStats.map((game, i)  => {
                    return <Link to={'/gameFeed/' + game.gamePk} key={i}><li className="pool_item"><GameItem gameData={game}></GameItem></li></Link>
                })}
            </ul>
        </div>
    )    
}

export default TodayGamesFeed;