// This page let users select the team they want to view the roster of each team for any seasons.

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { team_info } from '../components/img/logos';

import SeasonOption from '../components/seasonOptions';

export default function TeamPage() {
  const [seasonParams, setSeasonParams] = useSearchParams();
  const [season, setSeason] = useState(seasonParams.get('season') ?? '20222023');

  useEffect(() => {}, []);

  const render_team = (team, id) => (
    <div>
      <Link to={`/team-roster/${id}/${season}`}>
        <img src={team.logo} alt="" width={140} height={140} />
      </Link>
      <h3>{team.fullName}</h3>
    </div>
  );

  return (
    <div className="cont">
      <SeasonOption
        season={season}
        setSeason={setSeason}
        seasonParams={seasonParams}
        setSeasonParams={setSeasonParams}
      />
      {Object.keys(team_info).map(teamId =>
        team_info[teamId].firstSeason <= Number(season) &&
        (!team_info[teamId].lastSeason || team_info[teamId].lastSeason >= Number(season))
          ? render_team(team_info[teamId], teamId)
          : null
      )}
    </div>
  );
}
