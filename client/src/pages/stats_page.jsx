// This is the general page to make specific stats search related to nhl players.

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

// component
import PlayerLink from '../components/playerLink';

import { logos, abbrevToTeamId } from '../components/img/logos';

export default function StatsPage({ injury }) {
  const [leaders, setLeaders] = useState([]);
  const [start, setStart] = useState(0);

  // Search Parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState(searchParams.get('type') ?? 'skater');
  const [statsType, setStatsType] = useState(searchParams.get('statsType') ?? 'points');
  const [playerType, setPlayerType] = useState(searchParams.get('playerType') ?? 'allSkaters'); // allSkaters, allForwards, LOnly, ROnly, COnly, DOnly, GOnly
  const [startSeason, setStartSeason] = useState(searchParams.get('startSeason') ?? '20222023');
  const [endSeason, setEndSeason] = useState(searchParams.get('endSeason') ?? '20222023');
  const [searchMode, setSearchMode] = useState(searchParams.get('searchMode') ?? 'singleSeason'); // singleSeason, allSeasons, allSeasonsAggregate

  const get_positionCode_with_playerType = _playerType => {
    switch (_playerType) {
      case 'allSkaters':
        return ['L', 'C', 'R', 'D'];
      case 'allForwards':
        return ['L', 'C', 'R'];
      case 'LOnly':
        return ['L'];
      case 'COnly':
        return ['C'];
      case 'ROnly':
        return ['R'];
      case 'DOnly':
        return ['D'];
      case 'GOnly':
        return ['G'];
      default: {
        return ['L', 'C', 'R', 'D'];
      }
    }
  };

  const make_positionCode_string = _playerType => {
    const positionCodes = get_positionCode_with_playerType(_playerType);

    const positionCodeStrings = [];

    for (let i = 0; i < positionCodes.length; i += 1) {
      positionCodeStrings.push(`positionCode="${positionCodes[i]}"`);
    }

    return `(${positionCodeStrings.join(' or ')})`;
  };

  const make_sorting_string = (_property, _isAscending) => {
    const direction = _isAscending ? 'ASC' : 'DESC';
    return JSON.stringify([{ property: _property, direction }]);
  };

  const fetch_top_players = async (
    limit,
    reset,
    _type,
    _statsType,
    _playerType,
    _startSeason,
    _endSeason,
    _searchMode
  ) => {
    let s = start;
    if (reset) {
      s = 0;
      setStart(limit);
    } else setStart(start + limit); // the next start will be the limit.

    setSearchParams({
      type: _type,
      statsType: _statsType,
      playerType: _playerType,
      startSeason: _startSeason,
      endSeason: _endSeason,
      searchMode: _searchMode,
    });

    const positionCode = make_positionCode_string(_playerType);
    console.log(positionCode);
    const sorting = make_sorting_string(_statsType, false);
    console.log(sorting);
    const isAggregate = _searchMode === 'allSeasonsAggregate';

    axios
      .get(
        `/cors-anywhere/https://api.nhle.com/stats/rest/en/${_type}/summary?isAggregate=${isAggregate}&isGame=false&sort=${sorting}&start=${s}&limit=${limit}&factCayenneExp=gamesPlayed>=1&cayenneExp=${positionCode} and gameTypeId=2 and seasonId<=${_endSeason} and seasonId>=${_startSeason}`
      )
      .then(l => {
        console.log(l.data.data);
        if (reset) setLeaders(l.data.data);
        else setLeaders(prevList => [...prevList, ...l.data.data]);
      });
  };

  useEffect(() => {
    fetch_top_players(20, true, type, statsType, playerType, startSeason, endSeason, searchMode);
  }, []);

  const onClickSortingColumns = _statsType => {
    setStatsType(_statsType);
    fetch_top_players(20, true, type, _statsType, playerType, startSeason, endSeason, searchMode);
    setLeaders([]);
  };

  const make_readable_season = season => `${season.substr(0, 4)}-${season.substr(-2)}`;

  const render_mode_header_columns = () => (
    <>
      {searchMode === 'allSeasonsAggregate' ? null : <th>Team</th>}
      {searchMode === 'allSeasons' ? <th>Season</th> : null}
    </>
  );

  const render_table_title = colSpan => (
    <tr>
      <th colSpan={searchMode === 'allSeasons' ? colSpan + 1 : colSpan}>
        {startSeason === endSeason
          ? make_readable_season(endSeason)
          : `${make_readable_season(startSeason)} to ${make_readable_season(endSeason)} `}
        - {statsType} - Leaders
      </th>
    </tr>
  );

  const render_skaters_leaders_header = () => (
    <>
      {render_table_title(11)}
      <tr>
        <th>Rank</th>
        <th>Name</th>
        {render_mode_header_columns()}
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
      {render_table_title(13)}
      <tr>
        <th>Rank</th>
        <th>Name</th>
        {render_mode_header_columns()}
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

  const sorting_highlight = (data, _statsType) =>
    _statsType === statsType ? (
      <td style={{ backgroudColor: 'white' }}>
        <b style={{ color: '#a20' }}>{data}</b>
      </td>
    ) : (
      <td>{data}</td>
    );

  const render_mode_columns = player => (
    <>
      {searchMode === 'allSeasonsAggregate' ? null : (
        <td>
          <img src={logos[abbrevToTeamId[player.teamAbbrevs]]} alt="" width="40" height="40" />
        </td>
      )}
      {searchMode === 'allSeasons' ? <td>{make_readable_season(`${player.seasonId}`)}</td> : null}
    </>
  );

  const render_skaters_leaders = () =>
    leaders.map((player, i) => (
      <tr key={player.playerId}>
        <td>{i + 1}</td>
        <td>
          <PlayerLink name={player.skaterFullName} id={player.playerId} injury={injury} />
        </td>
        {render_mode_columns(player)}
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
        {render_mode_columns(player)}
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

  const onClickPlayerType = (_type, _statsType, _playerType) => {
    setType(_type);
    setPlayerType(_playerType);
    setStatsType(_statsType);
    fetch_top_players(20, true, _type, _statsType, _playerType, startSeason, endSeason, searchMode);
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
              onClick={() =>
                fetch_top_players(20, false, type, statsType, playerType, startSeason, endSeason, searchMode)
              }
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
              onClick={() =>
                fetch_top_players(20, false, type, statsType, playerType, startSeason, endSeason, searchMode)
              }
            >
              20 More...
            </button>
          </td>
        </tr>
      </table>
    );

  const render_players_type_inputs = (_type, _statsType, _playerType, _title) => (
    <label htmlFor="default">
      <input
        type="checkbox"
        onClick={() => onClickPlayerType(_type, _statsType, _playerType)}
        checked={type === _type}
      />
      {_title}
    </label>
  );

  const season_options = (season, isStart) => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) {
      if (
        !isStart || // In Single season mode, the isStart is not being passed (we need to add all dates).
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

  // Start season
  const handleChangeStartSeason = event => {
    setLeaders([]);
    setStartSeason(event.target.value);
    fetch_top_players(20, true, type, statsType, playerType, event.target.value, endSeason, searchMode);
  };

  // End season
  const handleChangeEndSeason = event => {
    setLeaders([]);
    setEndSeason(event.target.value);
    fetch_top_players(20, true, type, statsType, playerType, startSeason, event.target.value, searchMode);
  };

  // Single Season
  const handleChangesingleSeason = event => {
    setLeaders([]);
    setStartSeason(event.target.value);
    setEndSeason(event.target.value);
    fetch_top_players(20, true, type, statsType, playerType, event.target.value, event.target.value, searchMode);
  };

  const handleChangesSearchMode = event => {
    setLeaders([]);
    switch (event.target.value) {
      case 'singleSeason': {
        setStartSeason(endSeason); // make sure that when this mode is requested, start date and end date are the same.
        setEndSeason(endSeason);
        fetch_top_players(20, true, type, statsType, playerType, endSeason, endSeason, event.target.value);
        setSearchMode(event.target.value);
        break;
      }
      case 'allSeasons':
      case 'allSeasonsAggregate': {
        fetch_top_players(20, true, type, statsType, playerType, startSeason, endSeason, event.target.value);
        setSearchMode(event.target.value);
        break;
      }
      default: {
        break; // invalid case,
      }
    }
  };

  const handleChangesSkaterType = event => {
    onClickPlayerType(type, statsType, event.target.value);
  };

  return (
    <div className="cont">
      <div>
        <div className="flex-centered">
          <h1>Player Type:</h1>
          {render_players_type_inputs('skater', 'points', 'allSkaters', 'Skaters')}
          {render_players_type_inputs('goalie', 'wins', 'GOnly', 'Goalies Only')}
        </div>

        {type === 'skater' ? (
          <div className="flex-centered">
            <h1>Skater Type:</h1>
            <select onChange={handleChangesSkaterType}>
              <option value="allSkaters" selected={playerType === 'allSkaters'}>
                All Skaters
              </option>
              <option value="allForwards" selected={searchMode === 'allForwards'}>
                All Forwards
              </option>
              <option value="LOnly" selected={searchMode === 'LOnly'}>
                LW Only
              </option>
              <option value="ROnly" selected={searchMode === 'ROnly'}>
                RW Only
              </option>
              <option value="COnly" selected={searchMode === 'COnly'}>
                Centers Only
              </option>
              <option value="DOnly" selected={searchMode === 'DOnly'}>
                Defenders Only
              </option>
            </select>
          </div>
        ) : null}
        <div className="flex-centered">
          <h1>Search Mode:</h1>
          <select onChange={handleChangesSearchMode}>
            <option value="singleSeason" selected={searchMode === 'singleSeason'}>
              Single Season
            </option>
            <option value="allSeasons" selected={searchMode === 'allSeasons'}>
              All Seasons
            </option>
            <option value="allSeasonsAggregate" selected={searchMode === 'allSeasonsAggregate'}>
              All Seasons Aggregate
            </option>
          </select>
        </div>
        {searchMode === 'singleSeason' ? (
          <div className="flex-centered">
            <h1>Season:</h1>
            <select onChange={handleChangesingleSeason}>{season_options(startSeason, null)}</select>
          </div>
        ) : (
          <div className="flex-centered">
            <h1>Start Season:</h1>
            <select onChange={handleChangeStartSeason}>{season_options(startSeason, true)}</select>
            <h1>End Season:</h1>
            <select onChange={handleChangeEndSeason}>{season_options(endSeason, false)}</select>
          </div>
        )}
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
