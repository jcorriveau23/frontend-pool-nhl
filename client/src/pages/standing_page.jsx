import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// components
import TeamsStanding from '../components/standing_page/teamsStanding';

export default function StandingPage() {
  const [teamsStats, setTeamsStats] = useState(null);

  useEffect(() => {
    axios.get('https://statsapi.web.nhl.com/api/v1/standings').then(res => {
      // console.log(data)
      setTeamsStats(res.data);
    });
  }, []); // fetch team standing stats from nhl api.

  if (teamsStats != null) {
    return (
      <div className="cont">
        <TeamsStanding data={teamsStats} />
      </div>
    );
  }
  return (
    <div className="cont">
      <h1>Trying to fetch teams data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
