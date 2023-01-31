import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// component
import PlayerLink from '../playerLink';

export default function Roster({ teamId, injury }) {
  const [roster, setRoster] = useState(null);
  const [noData, setNoData] = useState(false);

  const get_team_roster = async () => {
    if (teamId >= 87) setNoData(true);
    // All star team ID starts at 87
    else {
      try {
        const res = await axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${teamId}/roster`); // https://statsapi.web.nhl.com/api/v1/teams/22/roster
        setRoster(res.data.roster);
      } catch (e) {
        alert(e);
        setNoData(true);
      }
    }
  };

  useEffect(() => {
    get_team_roster();
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
          {roster ? (
            roster.map(player => (
              <tr key={player.person.id}>
                <td>{player.jerseyNumber}</td>
                <td>
                  <PlayerLink name={player.person.fullName} id={player.person.id} injury={injury} />
                </td>
                <td>{player.position.abbreviation}</td>
              </tr>
            ))
          ) : (
            <div className="cont">
              <h1>Trying to fetch game data from nhl api...</h1>
              <ClipLoader color="#fff" loading size={75} />
            </div>
          )}
        </tbody>
      </table>
    </div>
  );

  if (noData) {
    return (
      <div className="cont">
        <h1>There is no roster preview for that team yet.</h1>
      </div>
    );
  }

  return <div className="cont">{render_team_roster()}</div>;
}
