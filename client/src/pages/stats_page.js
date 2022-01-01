import React, { useState, useEffect } from 'react';

import TeamsStanding from "../components/teamsStanding";

// Loader
import ClipLoader from "react-spinners/ClipLoader"

function StatsPage() {
    
    const [teamsStats, setTeamsStats] = useState(null)

    useEffect(() => {
        fetch('https://statsapi.web.nhl.com/api/v1/standings')
        .then(response => response.json())
        .then(data => setTeamsStats(data))


    }, []); // fetch team standing stats from nhl api.


    if(teamsStats != null)
    {
        return(
            <div>
                <TeamsStanding data={teamsStats}></TeamsStanding>
            </div>
        );
    }
    else
    {
        return(
            <div>
                <h1>Trying to fetch teams data from nhl api...</h1>
                <ClipLoader color="#fff" loading={true} size={75}/>
            </div>
        )
    }

    
  
  }
  export default StatsPage;