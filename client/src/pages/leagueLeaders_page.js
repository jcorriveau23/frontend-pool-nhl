// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { logos } from '../components/img/logos';

function LeagueLeadersPage() {
  const [leagueLeaders, setLeagueLeaders] = useState(null);
  const [statsType, setStatsType] = useState('points');
  const [season, setSeason] = useState('20212022');
  const [leagueLeaderTypes, setLeagueLeaderTypes] = useState();
  const [noDataFoThisYear, setNoDataFoThisYear] = useState(false);

  useEffect(() => {
    // TODO: use this call instead to have more control and filtering
    // https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=true&isGame=false
    // &sort=[{"property":"points","direction":"DESC"},{"property":"goals","direction":"DESC"},{"property":"assists","direction":"DESC"},{"property":"playerId","direction":"ASC"}]
    // &start=0&limit=50
    // &factCayenneExp=gamesPlayed>=1
    // &cayenneExp=gameTypeId=3
    // and positionCode="C"          -> D, G, L, R
    // and seasonId<=20212022
    // and seasonId>=19171918

    // https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{"property":"points","direction":"DESC"}]&start=0&limit=50&factCayenneExp=gamesPlayed>=1&cayenneExp=(positionCode="L" or positionCode="R" or positionCode="C") and gameTypeId=2 and seasonId<=20212022 and seasonId>=20212022

    const urlLeaders = `https://statsapi.web.nhl.com/api/v1/stats/leaders?leaderCategories=${statsType}&season=${season}&limit=100`; // https://statsapi.web.nhl.com/api/v1/stats/leaders?leaderCategories=gaa&season=20212022&limit=100

    fetch(urlLeaders, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(leaders => {
        // console.log(leaders.leagueLeaders[0]);
        if (leaders.leagueLeaders[0] === undefined) setNoDataFoThisYear(true);

        setLeagueLeaders({ ...leaders.leagueLeaders[0] });
      });

    const urlLeagueLeaderTypes = 'https://statsapi.web.nhl.com/api/v1/leagueLeaderTypes';

    fetch(urlLeagueLeaderTypes, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(leaderTypes => {
        // console.log(leagueLeaderTypes)
        setLeagueLeaderTypes([...leaderTypes]);
      });
  }, [statsType, season]);

  const render_leaders = leaders => (
    <table className="content-table">
      <thead>
        <tr>
          <th colSpan={4}>{`${season.substring(0, 4)}-${season.substring(4)}`}</th>
        </tr>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Team</th>
          {/* <th>Position</th> */}
          <th>{statsType}</th>
        </tr>
      </thead>
      <tbody>
        {leaders.map(player => (
          <tr key={player.person.id}>
            <td>{player.rank}</td>
            <td>
              <Link to={`/playerInfo/${player.person.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                {player.person.fullName}
              </Link>
            </td>
            <td>
              <img src={logos[player.team.name]} alt="" width="30" height="30" />
            </td>
            {/* <td>{player.player.positionCode}</td> */}
            <td>{player.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const handleChangeStatsType = event => {
    setLeagueLeaders(null);
    setNoDataFoThisYear(false);
    setStatsType(event.target.value);
  };

  const handleChangeSeason = event => {
    setLeagueLeaders(null);
    setNoDataFoThisYear(false);
    setSeason(event.target.value);
  };

  const leagueLeadersTypeOptions = types =>
    types.map(type => (
      <option
        key={type.displayName}
        value={type.displayName}
        selected={type.displayName === statsType ? 'selected' : null}
      >
        {type.displayName}
      </option>
    ));

  const SeasonOptions = () => {
    const seasonArray = [];

    for (let i = 2021; i > 1916; i -= 1) seasonArray.push(i);

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

  const displayDropDowns = () => (
    <table>
      <tbody>
        <tr>
          <th>Stats Type</th>
          <td>
            <select onChange={handleChangeStatsType}>{leagueLeadersTypeOptions(leagueLeaderTypes)}</select>
          </td>
        </tr>
        <tr>
          <th>Season</th>
          <td>
            <select onChange={handleChangeSeason}>{SeasonOptions()}</select>
          </td>
        </tr>
      </tbody>
    </table>
  );

  if (leagueLeaders && leagueLeaderTypes && !noDataFoThisYear) {
    return (
      <div>
        {displayDropDowns()}
        {render_leaders(leagueLeaders.leaders)}
      </div>
    );
  }

  if (noDataFoThisYear) {
    return (
      <div>
        {displayDropDowns()}
        <h1>There is no data for this year.</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Trying to fetch league leaders for this year...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

export default LeagueLeadersPage;
