// ttps://statsapi.web.nhl.com/api/v1/tournaments/playoffs: this call gives all the information to display playoff results.

import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { team_info } from '../img/logos';

// css
import './teamStanding.css';
import '../react-tabs.css';

export default function Playoff({ season }) {
  const [standing, setStanding] = useState(null);
  const [notAvailable, setNotAvailable] = useState(false);

  const get_playoff = async () => {
    // Post season are only available starting at the 1983-1984 season.
    if (Number(season) < 19831984) {
      setNotAvailable(true);
      return;
    }

    try {
      const res = await axios.get(
        `https://statsapi.web.nhl.com/api/v1/tournaments/playoffs?expand=round.series,schedule.game.seriesSummary&season=${season}`
      );

      setStanding(res.data);
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    setStanding(null);
    get_playoff(); // fetch team standing stats from nhl api.
  }, [season]);

  const render_round = round => (
    <table className="content-table">
      <tr>
        <th colSpan={2}>
          {round.names.name} - {round.format.description}
        </th>
      </tr>
      {round.series.map(serie => (
        <tr>
          <td>
            <img src={team_info[serie.matchupTeams[0].team.id]?.logo} alt="" width="40" height="40" /> (
            {serie.matchupTeams[0].seriesRecord.wins})
          </td>
          <td>
            <img src={team_info[serie.matchupTeams[1].team.id]?.logo} alt="" width="40" height="40" /> (
            {serie.matchupTeams[1].seriesRecord.wins})
          </td>
        </tr>
      ))}
    </table>
  );

  if (notAvailable) {
    return (
      <div>
        <h1>No post season available before 1983-1984</h1>
      </div>
    );
  }

  if (standing) {
    return <div>{standing.rounds.map(round => render_round(round))}</div>;
  }
  return (
    <div className="cont">
      <h1>Trying to fetch teams data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
