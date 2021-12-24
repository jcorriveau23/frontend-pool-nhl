import React, { useState, useEffect } from 'react';

// component
import { GameItem } from "./gameItem";

function TodayGamesFeed() {

    const [gamesStats, setGamesStats] = useState([])
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        var formatDate = date.toISOString().slice(0, 10)

        // [TODO] : fix that we dont look on next day at 19h because of timezone.
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

    const prevDate = () => {
        const newDate = new Date(date)
        newDate.setDate(date.getDate() - 1)

        setDate(newDate)
    }

    const nextDate = () => {
        const newDate = new Date(date)
        newDate.setDate(date.getDate() + 1)

        setDate(newDate)
    }

    return (
        <div>
            <div>
                {gamesStats.map((game, i)  => {
                    return <li class="pool_item"><GameItem gameData={game}/></li>
                })}
            </div>
            <div>
                <button onClick={prevDate} disabled={false}>prev</button>
                <b>{date.toISOString().slice(0, 10)}</b>
                <button onClick={nextDate} disabled={false}>next</button>
            </div>
        </div>
    )    
}

export default TodayGamesFeed;