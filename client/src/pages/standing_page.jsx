import React, { useState, useEffect } from 'react';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// components
import TeamsStanding from '../components/standing_page/teamsStanding';

export default function StandingPage() {
  const [teamsStats, setTeamsStats] = useState(null);

  useEffect(() => {
    fetch('https://statsapi.web.nhl.com/api/v1/standings')
      .then(response => response.json())
      .then(data => {
        // console.log(data)
        setTeamsStats(data);
      });
  }, []); // fetch team standing stats from nhl api.

  if (teamsStats != null) {
    return (
      <div>
        <TeamsStanding data={teamsStats} />
      </div>
    );
  }
  return (
    <div>
      <h1>Trying to fetch teams data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
