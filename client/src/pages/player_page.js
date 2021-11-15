import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// teams logo
import logos from "../components/img/images" 

function PlayerPage() {

    const [playerInfo, setPlayerInfo] = useState(null)

    const playerID = window.location.pathname.split('/').pop();
    console.log(playerID)
    
    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/people/' + playerID + '?stats=yearByYear')  // https://statsapi.web.nhl.com/api/v1/people/8475726?stats=yearByYear
        .then(response => response.json())
        .then(playerInfo => {
            setPlayerInfo({...playerInfo})
        })

    }, []);
    
    const render_player_stats = (stats) => {
        // TODO: navigate into the playerInfo data and go into each years to display them in a tab.
        return(
            <div>
                
            </div>
        )
    }

    if(playerInfo)
    { 
        console.log(playerInfo)
        return(
            <div>
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