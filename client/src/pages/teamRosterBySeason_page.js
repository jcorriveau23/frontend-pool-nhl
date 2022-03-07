// get the list of players of a team with a specific year
// display the list of player with their overal stats with this team

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import logos, { teamNameFromId } from '../components/img/logos';

function TeamRosterBySeasonPage() {
  const [skatersStats, setSkatersStats] = useState(null);
  const [goaliesStats, setGoaliesStats] = useState(null);

  const url = window.location.pathname.split('/');

  const season = url.pop();
  const teamID = url.pop();

  useEffect(() => {
    const urlSkaters = `https://nhl-pool-ethereum.herokuapp.com/http://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=
      ${teamID}
      %20and%20gameTypeId=2%20and%20seasonId%3C=
      ${season}
      %20and%20seasonId%3E=
      ${season}`; // https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=8%20and%20gameTypeId=2%20and%20seasonId%3C=20172018%20and%20seasonId%3E=20172018
    const urlgoalies = `https://nhl-pool-ethereum.herokuapp.com/http://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=
      ${teamID}
      %20and%20gameTypeId=2%20and%20seasonId%3C=
      ${season}
      %20and%20seasonId%3E=
      ${season}`; // https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=[{%22property%22:%22points%22,%22direction%22:%22DESC%22},{%22property%22:%22goals%22,%22direction%22:%22DESC%22},{%22property%22:%22assists%22,%22direction%22:%22DESC%22},{%22property%22:%22playerId%22,%22direction%22:%22ASC%22}]&start=0&limit=50&factCayenneExp=gamesPlayed%3E=1&cayenneExp=teamId=8%20and%20gameTypeId=2%20and%20seasonId%3C=20172018%20and%20seasonId%3E=20172018

    fetch(urlSkaters, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(playersStats => {
        // console.log(playersStats)
        setSkatersStats([...playersStats.data]);
      })
      .catch(error => {
        alert(`Error 1! ${error}`);
      });

    fetch(urlgoalies, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(playersStats => {
        setGoaliesStats([...playersStats.data]);
      })
      .catch(error => {
        alert(`Error 2! ${error}`);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sort_by_int = (isSkater, stat) => {
    let array;

    if (isSkater) {
      array = skatersStats.sort((first, second) => second[stat] - first[stat]);
      setSkatersStats([...array]);
    } else {
      array = goaliesStats.sort((first, second) => second[stat] - first[stat]);
      setGoaliesStats([...array]);
    }
  };

  const render_team_skaters = roster => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan="12">Season : {`${season.substring(0, 4)}-${season.substring(4)}`}</th>
          </tr>
          <tr>
            <th colSpan="12">
              <img src={logos[teamNameFromId[teamID]]} alt="" width="30" height="30" />
            </th>
          </tr>
          <tr>
            <th colSpan="12">Skaters</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th onClick={() => sort_by_int(true, 'gamesPlayed')}>GP</th>
            <th onClick={() => sort_by_int(true, 'goals')}>G</th>
            <th onClick={() => sort_by_int(true, 'assists')}>A</th>
            <th onClick={() => sort_by_int(true, 'points')}>P</th>
            <th onClick={() => sort_by_int(true, 'plusMinus')}>+/-</th>
            <th onClick={() => sort_by_int(true, 'penaltyMinutes')}>PIM</th>
            <th onClick={() => sort_by_int(true, 'shots')}>SOG</th>
            {/* <th>HITS</th>
                <th>BLKS</th>
                <th>GVA</th>
                <th>TKA</th> */}
            <th onClick={() => sort_by_int(true, 'faceoffWinPct')}>FO%</th>
            <th onClick={() => sort_by_int(true, 'timeOnIcePerGame')}>TOI</th>
            {/* <th>PP TOI</th>
                <th>SH TOI</th> */}
          </tr>
        </thead>
        <tbody>
          {roster.map(player => (
            <tr key={player.playerId}>
              <td>-</td>
              <td>
                <Link to={`/playerInfo/${player.playerId}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {player.skaterFullName}
                </Link>
              </td>
              <td>{player.positionCode}</td>
              <td>{player.gamesPlayed}</td>
              <td>{player.goals}</td>
              <td>{player.assists}</td>
              <td>{player.points}</td>
              <td>{player.plusMinus}</td>
              <td>{player.penaltyMinutes}</td>
              <td>{player.shots}</td>
              {/* <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td> */}
              <td>{Math.round((player.faceoffWinPct + Number.EPSILON) * 100) / 100}</td>
              <td>{Math.round((player.timeOnIcePerGame + Number.EPSILON) * 100) / 100}</td>
              {/* <td>-</td>
                  <td>-</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const render_team_goalies = roster => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan="17">Goalies</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th onClick={() => sort_by_int(false, 'gamesPlayed')}>GP</th>
            <th onClick={() => sort_by_int(false, 'gamesStarted')}>GS</th>
            <th onClick={() => sort_by_int(false, 'goals')}>G</th>
            <th onClick={() => sort_by_int(false, 'points')}>P</th>
            <th onClick={() => sort_by_int(false, 'goalsAgainst')}>GA</th>
            <th onClick={() => sort_by_int(false, 'goalsAgainstAverage')}>GAA</th>
            <th onClick={() => sort_by_int(false, 'wins')}>W</th>
            <th onClick={() => sort_by_int(false, 'losses')}>L</th>
            <th onClick={() => sort_by_int(false, 'otLosses')}>OTL</th>
            <th onClick={() => sort_by_int(false, 'penaltyMinutes')}>PIM</th>
            <th onClick={() => sort_by_int(false, 'savePct')}>SAVE %</th>
            <th onClick={() => sort_by_int(false, 'saves')}>S</th>
            <th onClick={() => sort_by_int(false, 'shutouts')}>SO</th>
            {/* <th onClick={() => sort_by_int(false, "timeOnIcePerGame")}>TOI</th> */}
          </tr>
        </thead>
        <tbody>
          {roster.map(goalie => (
            <tr key={goalie.playerId}>
              <td>-</td>
              <td>
                <Link to={`/playerInfo/${goalie.playerId}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {goalie.goalieFullName}
                </Link>
              </td>
              <td>G</td>
              <td>{goalie.gamesPlayed}</td>
              <td>{goalie.gamesStarted}</td>
              <td>{goalie.goals}</td>
              <td>{goalie.points}</td>
              <td>{goalie.goalsAgainst}</td>
              <td>{goalie.goalsAgainstAverage}</td>
              <td>{goalie.wins}</td>
              <td>{goalie.losses}</td>
              <td>{goalie.otLosses}</td>
              <td>{goalie.penaltyMinutes}</td>
              <td>{goalie.savePct}</td>
              <td>{goalie.saves}</td>
              <td>{goalie.shutouts}</td>
              {/* <td>{goalie.timeOnIcePerGame}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (skatersStats && goaliesStats) {
    return (
      <div>
        {render_team_skaters(skatersStats)}
        {render_team_goalies(goaliesStats)}
      </div>
    );
  }
  return (
    <div>
      <h1>Trying to fetch team roster data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

export default TeamRosterBySeasonPage;
