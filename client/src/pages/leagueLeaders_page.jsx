// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState } from 'react';

// components
import SummaryLeaders from '../components/leagueLeaders_page/summaryLeaders';

export default function LeagueLeadersPage({ injury }) {
  // statsType: "points", "goals", assists, "wins", "gaa", "savePct"

  const [season, setSeason] = useState('20222023');

  const season_options = () => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) seasonArray.push(i);

    return seasonArray.map(s => (
      <option
        key={s}
        value={s.toString() + (s + 1).toString()}
        selected={s.toString() + (s + 1).toString() === season ? 'selected' : null}
      >
        {`${s.toString()}-${(s + 1).toString()}`}
      </option>
    ));
  };

  const handleChangeSeason = event => {
    setSeason(event.target.value);
  };

  return (
    <div className="cont">
      <h3>Season:</h3>
      <select onChange={handleChangeSeason}>{season_options()}</select>
      <SummaryLeaders injury={injury} statsType="points" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="goals" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="assists" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="wins" type="goalie" playerType="GOnly" season={season} />
      <SummaryLeaders injury={injury} statsType="gaa" type="goalie" playerType="GOnly" season={season} />
      <SummaryLeaders injury={injury} statsType="savePct" type="goalie" playerType="GOnly" season={season} />
    </div>
  );
}
