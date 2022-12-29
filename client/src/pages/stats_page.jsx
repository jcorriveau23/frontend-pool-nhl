// This is the general page to make specific stats search related to nhl players.

import React from 'react';

// component
import SearchPlayersStats from '../components/stats_page/searchPlayersStats';

export default function StatsPage({ injury }) {
  return (
    <div className="cont">
      <SearchPlayersStats injury={injury} />
    </div>
  );
}
