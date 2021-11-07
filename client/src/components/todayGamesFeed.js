



// https://statsapi.web.nhl.com/api/v1/schedule?startDate=2021-10-31&endDate=2021-10-31     to get all date of 2021-10-31 (date of today)

// json["dates"][0]["games"][0..x]["link"]  to get the link that tells us the stats of the specific game (/api/v1/game/2021020128/feed/live)

// https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live

// json["boxscore"]["home"]["teamStats"]   // for general game stats
// json["boxscore"]["away"]["teamStats"] 


// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React, { useState, useEffect } from 'react';

// component
import { GameItem } from "../components/gameItem";

function TodayGamesFeed() {

    const [gamesStats, setGamesStats] = useState([])

    useEffect(() => {
        let today = new Date().toISOString().slice(0, 10)
        
        fetch('https://statsapi.web.nhl.com/api/v1/schedule?startDate=' + today + '&endDate=' + today)
        .then(response => response.json())
        .then(todayGamesData => {
            todayGamesData["dates"][0]["games"].map( game => {
                fetch('https://statsapi.web.nhl.com' + game["link"])
                .then(response => response.json())
                .then(gameFeedData => {
                    setGamesStats(gamesStats => [...gamesStats, gameFeedData])
                })
            })
        })  
    }, []); // fetch all todays games info from nhl api on this component mount.

    return (
        <div>
                {gamesStats.map(game => {
                    return <li class="pool_item"><GameItem gameData={game}/></li>
                })}
        </div>
    )    
}

export default TodayGamesFeed;