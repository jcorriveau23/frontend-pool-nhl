import React, { useState, useEffect } from 'react';

import TeamsStanding from "../components/teamsStanding";

function StatsPage() {
    
    const [teamsStats, setTeamsStats] = useState(null)

    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/standings')
        .then(response => response.json())
        .then(data => setTeamsStats(data))


    }, []); // fetch team standing stats from nhl api.


    if(teamsStats != null)
    {
        console.log(teamsStats)
        return(
            <div>
                <h1>hey you, you are on the stats page.</h1>
                <TeamsStanding data={teamsStats}></TeamsStanding>
            </div>
        );
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch data from nhl api...</h1>
            </div>
        )
    }

    
  
  }
  export default StatsPage;