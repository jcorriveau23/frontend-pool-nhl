import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// component
import PlayerLink from '../playerLink';

export default function Roster({ teamId, injury }) {
  const [roster, setRoster] = useState(null);

  useEffect(() => {
    console.log('Rosters');
    axios
      .get(`https://statsapi.web.nhl.com/api/v1/teams/${teamId}/roster`) // https://statsapi.web.nhl.com/api/v1/teams/22/roster
      .then(res => {
        console.log(res);
        setRoster(res.data.roster);
      });
  }, []);

  const render_team_roster = () => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan={17}>Skaters</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>R</th>
          </tr>
        </thead>
        <tbody>
          {roster.map(player => (
            <tr key={player.person.id}>
              <td>{player.jerseyNumber}</td>
              <td>
                <PlayerLink name={player.person.fullName} id={player.person.id} injury={injury} />
              </td>
              <td>{player.position.abbreviation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (roster) return <div className="cont">{render_team_roster()}</div>;

  return (
    <div className="cont">
      <h1>Trying to fetch game data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
