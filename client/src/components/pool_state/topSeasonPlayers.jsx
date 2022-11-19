import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

// component
import PlayerLink from '../playerLink';
import User from '../user';

export default function TopSeasonPlayers({ user, injury, playersIdToPoolerMap, DictUsers }) {
  const [leaders, setLeaders] = useState([]);
  const [start, setStart] = useState(0);
  const [role, setRole] = useState('default');
  const [filter, setFilter] = useState('All');

  const fetch_top_players = async (limit, r, reset) => {
    let s = start;
    if (reset) {
      s = 0;
      setStart(limit);
    } else setStart(start + limit); // the next start will be the limit.
    setRole(r);

    let positionCode;
    let statsSorting;
    let type;

    switch (r) {
      case 'F': {
        type = 'skater';
        positionCode = `(positionCode="L" or positionCode="R" or positionCode="C")`;
        statsSorting = `[{"property":"points","direction":"DESC"},{"property":"goals","direction":"DESC"}]`;
        break;
      }
      case 'D': {
        type = 'skater';
        positionCode = `(positionCode="D")`;
        statsSorting = `[{"property":"points","direction":"DESC"},{"property":"goals","direction":"DESC"}]`;
        break;
      }
      case 'G': {
        type = 'goalie';
        positionCode = `(positionCode="G")`;
        statsSorting = `[{"property":"wins","direction":"DESC"}]`;
        break;
      }
      default: {
        type = 'skater';
        positionCode = `(positionCode="L" or positionCode="R" or positionCode="C" or positionCode="D")`;
        statsSorting = `[{"property":"points","direction":"DESC"},{"property":"goals","direction":"DESC"}]`;
        break;
      }
    }

    axios
      .get(
        `https://nhl-pool-ethereum.herokuapp.com/https://api.nhle.com/stats/rest/en/${type}/summary?isAggregate=false&isGame=false&sort=${statsSorting}&start=${s}&limit=${limit}&factCayenneExp=gamesPlayed>=1&cayenneExp=${positionCode} and gameTypeId=2 and seasonId<=20222023 and seasonId>=20222023`
      )
      .then(l => {
        if (reset) setLeaders(l.data.data);
        else setLeaders(prevList => [...prevList, ...l.data.data]);
      });
  };

  const render_skaters_leaders_header = () => (
    <>
      <tr>
        <th colSpan={9}>Current League Leaders</th>
      </tr>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Owner</th>
        <th>Team</th>
        <th>GP</th>
        <th>G</th>
        <th>A</th>
        <th>P</th>
        <th>P/GP</th>
      </tr>
    </>
  );

  const render_goalies_leaders_header = () => (
    <>
      <tr>
        <th colSpan={6}>Current League Leaders</th>
      </tr>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Owner</th>
        <th>Team</th>
        <th>GP</th>
        <th>W</th>
      </tr>
    </>
  );

  const render_skaters_leaders = () =>
    leaders
      .filter(player => {
        switch (filter) {
          case 'All':
            return true;
          case 'Owned':
            return playersIdToPoolerMap[player.playerId];
          case 'Available':
            return !playersIdToPoolerMap[player.playerId];
          default:
            return false;
        }
      })
      .map((player, i) => (
        <tr key={player.playerId}>
          <td>{i + 1}</td>
          <td>
            <PlayerLink name={player.skaterFullName} id={player.playerId} injury={injury} />
          </td>
          <td>
            {playersIdToPoolerMap && playersIdToPoolerMap[player.playerId] ? (
              <User id={playersIdToPoolerMap[player.playerId]} user={user} DictUsers={DictUsers} parenthesis />
            ) : null}
          </td>
          <td>{player.teamAbbrevs}</td>
          <td>{player.gamesPlayed}</td>
          <td>{player.goals}</td>
          <td>{player.assists}</td>
          <td>
            <b style={{ color: '#a20' }}>{player.points}</b>
          </td>
          <td>{player.pointsPerGame}</td>
        </tr>
      ));

  const render_goalies_leaders = () =>
    leaders
      .filter(player => {
        switch (filter) {
          case 'All':
            return true;
          case 'Owned':
            return playersIdToPoolerMap[player.playerId];
          case 'Available':
            return !playersIdToPoolerMap[player.playerId];
          default:
            return false;
        }
      })
      .map((player, i) => (
        <tr key={player.playerId}>
          <td>{i + 1}</td>
          <td>
            <PlayerLink name={player.goalieFullName} id={player.playerId} injury={injury} />
          </td>
          <td>
            {playersIdToPoolerMap && playersIdToPoolerMap[player.playerId] ? (
              <User id={playersIdToPoolerMap[player.playerId]} user={user} DictUsers={DictUsers} parenthesis />
            ) : null}
          </td>
          <td>{player.teamAbbrevs}</td>
          <td>{player.gamesPlayed}</td>
          <td>
            <b style={{ color: '#a20' }}>{player.wins}</b>
          </td>
        </tr>
      ));

  useEffect(() => {
    fetch_top_players(30, role, true);
  }, []);

  const onClickPlayerType = newRole => {
    setRole(newRole);
    fetch_top_players(30, newRole, true);
    setLeaders([]);
  };

  const onClickFilter = newFilter => {
    setFilter(newFilter);
  };

  if (leaders.length > 0) {
    return (
      <>
        <div>
          <h3>Player Type:</h3>
          <label htmlFor="default">
            <input type="checkbox" onClick={() => onClickPlayerType('default')} checked={role === 'default'} />
            All Skaters
          </label>
          <label htmlFor="F">
            <input type="checkbox" onClick={() => onClickPlayerType('F')} checked={role === 'F'} />
            Forwards Only
          </label>
          <label htmlFor="D">
            <input type="checkbox" onClick={() => onClickPlayerType('D')} checked={role === 'D'} />
            Defenders Only
          </label>
          <label htmlFor="G">
            <input type="checkbox" onClick={() => onClickPlayerType('G')} checked={role === 'G'} />
            Goalies Only
          </label>
        </div>
        <div>
          <h3>Filter</h3>
          <label htmlFor="All">
            <input type="checkbox" onClick={() => onClickFilter('All')} checked={filter === 'All'} />
            All
          </label>
          <label htmlFor="Owned">
            <input type="checkbox" onClick={() => onClickFilter('Owned')} checked={filter === 'Owned'} />
            Owned
          </label>
          <label htmlFor="Available">
            <input
              type="checkbox"
              value="Available"
              onClick={() => onClickFilter('Available')}
              checked={filter === 'Available'}
            />
            Available
          </label>
        </div>
        {role === 'G' ? (
          <table className="content-table-no-min">
            <thead>{render_goalies_leaders_header()}</thead>
            <tbody>{render_goalies_leaders()}</tbody>
            <tr>
              <td colSpan={6}>
                <button
                  className="base-button_no_border"
                  type="button"
                  onClick={() => fetch_top_players(20, role, false)}
                >
                  20 More...
                </button>
              </td>
            </tr>
          </table>
        ) : (
          <table className="content-table-no-min">
            <thead>{render_skaters_leaders_header()}</thead>
            <tbody>{render_skaters_leaders()}</tbody>
            <tr>
              <td colSpan={9}>
                <button className="base-button" type="button" onClick={() => fetch_top_players(20, role, false)}>
                  20 More...
                </button>
              </td>
            </tr>
          </table>
        )}
      </>
    );
  }

  return (
    <div className="cont">
      <h1>Fetching league leaders...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

TopSeasonPlayers.propTypes = {};
