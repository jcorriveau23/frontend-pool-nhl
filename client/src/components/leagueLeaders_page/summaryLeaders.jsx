// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// components
import PlayerLink from '../playerLink';

// images
import { logos } from '../img/logos';

export default function SummaryLeaders({ injury, statsType, type, playerType, season }) {
  // statsType: "points", "assists", goals, "wins", "gaa", "savePct", and more defined in nhl api
  const [leagueLeaders, setLeagueLeaders] = useState([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    setLeagueLeaders([]);
    const urlLeaders = `https://statsapi.web.nhl.com/api/v1/stats/leaders?leaderCategories=${statsType}&season=${season}&limit=5`; // https://statsapi.web.nhl.com/api/v1/stats/leaders?leaderCategories=gaa&season=20212022&limit=100

    axios.get(urlLeaders).then(res => {
      if (res.data.leagueLeaders[0] === undefined) setNoData(true);

      setLeagueLeaders({ ...res.data.leagueLeaders[0] });
    });

    // const urlLeagueLeaderTypes = 'https://statsapi.web.nhl.com/api/v1/leagueLeaderTypes';

    // axios.get(urlLeagueLeaderTypes).then(res => {
    //   console.log(res.data);
    // });
  }, [statsType, season]);

  const render_leaders = leaders => (
    <table className="content-table">
      <thead>
        <tr>
          <th colSpan={5}>{`${type} - ${statsType}`}</th>
        </tr>
        <tr>
          <th>#</th>
          <th colSpan={2}>Player</th>
          <th>Team</th>
          <th>{statsType}</th>
        </tr>
      </thead>
      <tbody>
        {leaders &&
          leaders.map(player => (
            <tr key={player.person.id}>
              <td>{player.rank}</td>
              <td>
                <img
                  src={`https://cms.nhl.bamgrid.com/images/headshots/current/168x168/${player.person.id}.jpg`}
                  alt=""
                  width="70"
                  height="70"
                />
              </td>
              <td>
                <PlayerLink name={player.person.fullName} id={player.person.id} injury={injury} />
              </td>
              <td>
                <img src={logos[player.team.id]} alt="" width="70" height="70" />
              </td>
              <td>{player.value}</td>
            </tr>
          ))}
        <tr>
          <td colSpan={5}>
            <Link
              to={`/stats?type=${type}&statsType=${statsType}&playerType=${playerType}&startSeason=${season}&endSeason=${season}&searchMode=singleSeason`}
            >
              More...
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  );

  if (leagueLeaders) {
    return <>{render_leaders(leagueLeaders.leaders)}</>;
  }

  if (noData) {
    return <h1>A problem occured, the leaders could not be fetched.</h1>;
  }

  return (
    <>
      <h1>Trying to fetch league leaders for this year...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </>
  );
}
