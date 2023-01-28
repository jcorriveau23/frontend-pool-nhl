// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// components
import SummaryLeaders from '../components/leagueLeaders_page/summaryLeaders';
import SeasonOption from '../components/seasonOptions';

export default function LeagueLeadersPage({ injury }) {
  const [seasonParams, setSeasonParams] = useSearchParams();
  const [season, setSeason] = useState(seasonParams.get('season') ?? '20222023');
  // statsType: "points", "goals", assists, "wins", "gaa", "savePct"

  return (
    <div className="cont">
      <h3>Season:</h3>
      <SeasonOption
        season={season}
        setSeason={setSeason}
        seasonParams={seasonParams}
        setSeasonParams={setSeasonParams}
      />
      <SummaryLeaders injury={injury} statsType="points" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="goals" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="assists" type="skater" playerType="allSkaters" season={season} />
      <SummaryLeaders injury={injury} statsType="wins" type="goalie" playerType="GOnly" season={season} />
      <SummaryLeaders injury={injury} statsType="gaa" type="goalie" playerType="GOnly" season={season} />
      <SummaryLeaders injury={injury} statsType="savePct" type="goalie" playerType="GOnly" season={season} />
    </div>
  );
}
