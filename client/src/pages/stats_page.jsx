// This is the general page to make specific stats search related to nhl players.

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

// component
import PlayerLink from '../components/playerLink';

import { logos, abbrevToTeamId } from '../components/img/logos';

export const make_positionCode_string = _positions => {
  const positionCodes = [];
  for (let i = 0; i < _positions.length; i += 1) {
    positionCodes.push(`positionCode="${_positions[i]}"`);
  }

  return `(${positionCodes.join(' or ')})`;
};

export const make_sorting_string = (_property, _isAscending) => {
  const direction = _isAscending ? 'ASC' : 'DESC';
  return JSON.stringify([{ property: _property, direction }]);
};

export default function StatsPage({ injury }) {
  const [leaders, setLeaders] = useState([]);
  const [start, setStart] = useState(0);

  // Search Parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState(searchParams.get('type') ?? 'skater');
  const [sorting, setSorting] = useState(searchParams.get('sorting') ?? make_sorting_string('points', false));
  const [positionCode, setPositionCode] = useState(
    searchParams.get('positionCode') ?? make_positionCode_string(['L', 'R', 'C', 'D'])
  );
  const [startSeason, setStartSeason] = useState(searchParams.get('startSeason') ?? '20222023');
  const [endSeason, setEndSeason] = useState(searchParams.get('endSeason') ?? '20222023');

  const fetch_top_players = async (limit, reset, _type, _sorting, _positionCode, _startSeason, _endSeason) => {
    let s = start;
    if (reset) {
      s = 0;
      setStart(limit);
    } else setStart(start + limit); // the next start will be the limit.

    setSearchParams({
      type: _type,
      sorting: _sorting,
      positionCode: _positionCode,
      startSeason: _startSeason,
      endSeason: _endSeason,
    });

    axios
      .get(
        `/cors-anywhere/https://api.nhle.com/stats/rest/en/${_type}/summary?isAggregate=false&isGame=false&sort=${_sorting}&start=${s}&limit=${limit}&factCayenneExp=gamesPlayed>=1&cayenneExp=${_positionCode} and gameTypeId=2 and seasonId<=${_endSeason} and seasonId>=${_startSeason}`
      )
      .then(l => {
        if (reset) setLeaders(l.data.data);
        else setLeaders(prevList => [...prevList, ...l.data.data]);
      });
  };

  useEffect(() => {
    fetch_top_players(20, true, type, sorting, positionCode, startSeason, endSeason);
  }, []);

  const onClickSortingColumns = _sorting => {
    const sortingString = make_sorting_string(_sorting);
    setSorting(sortingString);
    fetch_top_players(20, true, type, sortingString, positionCode, startSeason, endSeason);
    setLeaders([]);
  };

  const render_skaters_leaders_header = () => (
    <>
      <tr>
        <th colSpan={11}>Current League Leaders</th>
      </tr>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Team</th>
        <th>Pos</th>
        <th onClick={() => onClickSortingColumns('gamesPlayed')}>GP</th>
        <th onClick={() => onClickSortingColumns('goals')}>G</th>
        <th onClick={() => onClickSortingColumns('assists')}>A</th>
        <th onClick={() => onClickSortingColumns('points')}>P</th>
        <th onClick={() => onClickSortingColumns('plusMinus')}>+/-</th>
        <th onClick={() => onClickSortingColumns('penaltyMinutes')}>PIM</th>
        <th onClick={() => onClickSortingColumns('pointsPerGame')}>P/GP</th>
      </tr>
    </>
  );

  const render_goalies_leaders_header = () => (
    <>
      <tr>
        <th colSpan={13}>Current League Leaders</th>
      </tr>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Team</th>
        <th onClick={() => onClickSortingColumns('gamesPlayed')}>GP</th>
        <th onClick={() => onClickSortingColumns('gamesStarted')}>GS</th>
        <th onClick={() => onClickSortingColumns('wins')}>W</th>
        <th onClick={() => onClickSortingColumns('losses')}>L</th>
        <th onClick={() => onClickSortingColumns('otLosses')}>OT</th>
        <th onClick={() => onClickSortingColumns('shotsAgainst')}>SA</th>
        <th onClick={() => onClickSortingColumns('saves')}>Svs</th>
        <th onClick={() => onClickSortingColumns('goalsAgainst')}>GA</th>
        <th onClick={() => onClickSortingColumns('savePct')}>Sv%</th>
        <th onClick={() => onClickSortingColumns('goalsAgainstAverage')}>GAA</th>
      </tr>
    </>
  );

  const sorting_highlight = (data, property) =>
    make_sorting_string(property) === sorting ? (
      <td>
        <b style={{ color: '#a20' }}>{data}</b>
      </td>
    ) : (
      <td>{data}</td>
    );

  const render_skaters_leaders = () =>
    leaders.map((player, i) => (
      <tr key={player.playerId}>
        <td>{i + 1}</td>
        <td>
          <PlayerLink name={player.skaterFullName} id={player.playerId} injury={injury} />
        </td>
        <td>
          <img src={logos[abbrevToTeamId[player.teamAbbrevs]]} alt="" width="40" height="40" />
        </td>
        {sorting_highlight(player.positionCode, 'positionCode')}
        {sorting_highlight(player.gamesPlayed, 'gamesPlayed')}
        {sorting_highlight(player.goals, 'goals')}
        {sorting_highlight(player.assists, 'assists')}
        {sorting_highlight(player.points, 'points')}
        {sorting_highlight(player.plusMinus, 'plusMinus')}
        {sorting_highlight(player.penaltyMinutes, 'penaltyMinutes')}
        {sorting_highlight(Math.round((player.pointsPerGame + Number.EPSILON) * 100) / 100, 'pointsPerGame')}
      </tr>
    ));

  const render_goalies_leaders = () =>
    leaders.map((player, i) => (
      <tr key={player.playerId}>
        <td>{i + 1}</td>
        <td>
          <PlayerLink name={player.goalieFullName} id={player.playerId} injury={injury} />
        </td>
        <td>
          <img src={logos[abbrevToTeamId[player.teamAbbrevs]]} alt="" width="40" height="40" />
        </td>
        {sorting_highlight(player.gamesPlayed, 'gamesPlayed')}
        {sorting_highlight(player.gamesStarted, 'gamesStarted')}
        {sorting_highlight(player.wins, 'wins')}
        {sorting_highlight(player.losses, 'losses')}
        {sorting_highlight(player.otLosses, 'otLosses')}
        {sorting_highlight(player.shotsAgainst, 'shotsAgainst')}
        {sorting_highlight(player.saves, 'saves')}
        {sorting_highlight(player.goalsAgainst, 'goalsAgainst')}
        {sorting_highlight(Math.round((player.savePct + Number.EPSILON) * 1000) / 1000, 'savePct')}
        {sorting_highlight(
          Math.round((player.goalsAgainstAverage + Number.EPSILON) * 100) / 100,
          'goalsAgainstAverage'
        )}
      </tr>
    ));

  const onClickPlayerType = (_type, _sorting, _positionCode) => {
    const positionCodeString = make_positionCode_string(_positionCode);
    const sortingString = make_sorting_string(_sorting);
    setType(_type);
    setPositionCode(positionCodeString);
    setSorting(sortingString);
    fetch_top_players(20, true, _type, sortingString, positionCodeString, startSeason, endSeason);
    setLeaders([]);
  };

  const render_leaders_table = () =>
    type === 'skater' ? (
      <table className="content-table-no-min">
        <thead>{render_skaters_leaders_header()}</thead>
        <tbody>{render_skaters_leaders()}</tbody>
        <tr>
          <td colSpan={13}>
            <button
              className="base-button"
              type="button"
              onClick={() => fetch_top_players(20, false, type, sorting, positionCode, startSeason, endSeason)}
            >
              20 More...
            </button>
          </td>
        </tr>
      </table>
    ) : (
      <table className="content-table-no-min">
        <thead>{render_goalies_leaders_header()}</thead>
        <tbody>{render_goalies_leaders()}</tbody>
        <tr>
          <td colSpan={13}>
            <button
              className="base-button"
              type="button"
              onClick={() => fetch_top_players(20, false, type, sorting, positionCode, startSeason, endSeason)}
            >
              20 More...
            </button>
          </td>
        </tr>
      </table>
    );

  const render_players_type_inputs = (_type, _positionCode, _sorting, _title) => (
    <label htmlFor="default">
      <input
        type="checkbox"
        onClick={() => onClickPlayerType(_type, _sorting, _positionCode)}
        checked={positionCode === make_positionCode_string(_positionCode)}
      />
      {_title}
    </label>
  );

  const season_options = (season, isStart) => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) {
      if (
        (isStart && i < Number(endSeason.substr(endSeason.length - 4))) || // Start date cannot be higher than End date
        (!isStart && i >= Number(startSeason.substr(0, 4))) // End date cannot be lower than Start date
      ) {
        seasonArray.push(i);
      }
    }

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

  const handleChangeStartSeason = event => {
    setLeaders([]);
    setStartSeason(event.target.value);
    fetch_top_players(20, true, type, sorting, positionCode, event.target.value, endSeason);
  };

  const handleChangeEndSeason = event => {
    setLeaders([]);
    setEndSeason(event.target.value);
    fetch_top_players(20, true, type, sorting, positionCode, startSeason, event.target.value);
  };

  return (
    <div className="cont">
      <div>
        <h3>Player Type:</h3>
        {render_players_type_inputs('skater', ['L', 'R', 'C', 'D'], 'points', 'All Skaters')}
        {render_players_type_inputs('skater', ['L', 'R', 'C'], 'points', 'Forwards Only')}
        {render_players_type_inputs('skater', ['D'], 'points', 'Defenders Only')}
        {render_players_type_inputs('goalie', ['G'], 'wins', 'Goalies Only')}
        <h3>Start Season:</h3>
        <select onChange={handleChangeStartSeason}>{season_options(startSeason, true)}</select>
        <h3>End Season:</h3>
        <select onChange={handleChangeEndSeason}>{season_options(endSeason, false)}</select>
      </div>

      {leaders.length > 0 ? (
        render_leaders_table()
      ) : (
        <div>
          <h1>Fetching league leaders...</h1>
          <ClipLoader color="#fff" loading size={75} />
        </div>
      )}
    </div>
  );
}
