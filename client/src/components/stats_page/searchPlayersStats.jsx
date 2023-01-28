// This is the general page to make specific stats search related to nhl players.

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import ReactTooltip from 'react-tooltip';

import { RiInformationFill } from 'react-icons/ri';

// component
import PlayerLink from '../playerLink';
import User from '../user';

import { team_info, abbrevToTeamId } from '../img/logos';

export default function SearchPlayersStats({
  injury,
  user = null, // will only be passed in pool context
  poolInfo = null, // will only be passed in pool context
  DictUsers = null, // will only be passed in pool context
  playersIdToPoolerMap = null, // will only be passed in pool context
  confirm_selection = null, // will only be passed in draft context
}) {
  const [leaders, setLeaders] = useState([]);
  const [start, setStart] = useState(0);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchText, setSearchText] = useState(''); // TODO: use this to search for a players using name

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

    const updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set('type', _type);
    updatedSearchParams.set('statsType', _statsType);
    updatedSearchParams.set('playerType', _playerType);
    updatedSearchParams.set('startSeason', _startSeason);
    updatedSearchParams.set('endSeason', _endSeason);
    updatedSearchParams.set('searchMode', _searchMode);
    setSearchParams(updatedSearchParams.toString());

    const positionCode = make_positionCode_string(_playerType);
    const sorting = make_sorting_string(_statsType, false);
    const isAggregate = _searchMode === 'allSeasonsAggregate';

    try {
      const res = await axios.get(
        `/cors-anywhere/https://api.nhle.com/stats/rest/en/${_type}/summary?isAggregate=${isAggregate}&isGame=false&sort=${sorting}&start=${s}&limit=${limit}&factCayenneExp=gamesPlayed>=1&cayenneExp=${positionCode} and gameTypeId=2 and seasonId<=${_endSeason} and seasonId>=${_startSeason}`
      );
      if (reset) setLeaders(res.data.data);
      else setLeaders(prevList => [...prevList, ...res.data.data]);
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    fetch_top_players(15, true, type, statsType, playerType, startSeason, endSeason, searchMode);
  }, []);

  const onClickSortingColumns = _statsType => {
    setStatsType(_statsType);
    fetch_top_players(15, true, type, _statsType, playerType, startSeason, endSeason, searchMode);
    setLeaders([]);
  };

  const make_readable_season = season => `${season.substr(0, 4)}-${season.substr(-2)}`;

  const render_mode_header_columns = () => (
    <>
      {searchMode === 'allSeasonsAggregate' ? null : <th>T</th>}
      {searchMode === 'allSeasons' ? <th>Season</th> : null}
    </>
  );

  const get_context_column_span = isSkater => {
    let colSpan;

    switch (poolInfo?.status) {
      case 'InProgress':
        colSpan = isSkater ? 12 : 14;
        break; // For skaters only we add the position columns
      case 'Draft':
        colSpan = 9;
        break;
      default:
        // component is not in pool context.
        colSpan = isSkater ? 11 : 13;
        break;
    }

    return searchMode === 'allSeasons' ? colSpan + 1 : colSpan;
  };

  const render_table_title = isSkater => (
    <tr>
      <th colSpan={get_context_column_span(isSkater)}>
        {startSeason === endSeason
          ? make_readable_season(endSeason)
          : `${make_readable_season(startSeason)} to ${make_readable_season(endSeason)}`}{' '}
        - {statsType} - Leaders
      </th>
    </tr>
  );

  const render_sort_column_header = (property, title) => (
    <th className={statsType === property ? 'headerSortDown' : null} onClick={() => onClickSortingColumns(property)}>
      {title}
    </th>
  );

  const render_pool_context_header_columns = () => (poolInfo?.status === 'InProgress' ? <th>Owner</th> : null);

  const render_skaters_leaders_header = () => (
    <>
      {render_table_title(true)}
      <tr>
        <th>#</th>
        <th>Name</th>
        {render_mode_header_columns()}
        {render_pool_context_header_columns()}
        <th>Pos</th>
        {render_sort_column_header('gamesPlayed', 'GP')}
        {render_sort_column_header('goals', 'G')}
        {render_sort_column_header('assists', 'A')}
        {render_sort_column_header('points', 'P')}
        {poolInfo?.status === 'Draft' ? null : ( // Don't display those columns in draft context
          <>
            {render_sort_column_header('plusMinus', '+/-')}
            {render_sort_column_header('penaltyMinutes', 'PIM')}
          </>
        )}
        {render_sort_column_header('pointsPerGame', 'P/GP')}
      </tr>
    </>
  );

  const render_goalies_leaders_header = () => (
    <>
      {render_table_title(false)}
      <tr>
        <th>#</th>
        <th>Name</th>
        {render_mode_header_columns()}
        {render_pool_context_header_columns()}
        {render_sort_column_header('gamesPlayed', 'GP')}
        {render_sort_column_header('wins', 'W')}
        {render_sort_column_header('otLosses', 'OT')}
        {poolInfo?.status === 'Draft' ? null : ( // Don't display those columns in draft context
          <>
            {render_sort_column_header('gamesStarted', 'GS')}
            {render_sort_column_header('losses', 'L')}
            {render_sort_column_header('shotsAgainst', 'SA')}
            {render_sort_column_header('saves', 'Svs')}
          </>
        )}
        {render_sort_column_header('goalsAgainst', 'GA')}
        {render_sort_column_header('savePct', 'Sv%')}
        {render_sort_column_header('goalsAgainstAverage', 'GAA')}
      </tr>
    </>
  );

  const sorting_highlight = (data, _statsType) =>
    _statsType === statsType ? (
      <td style={{ backgroundColor: 'white' }}>
        <b style={{ color: '#a20' }}>{data}</b>
      </td>
    ) : (
      <td>{data}</td>
    );

  const render_mode_columns = player => (
    <>
      {searchMode === 'allSeasonsAggregate' ? null : (
        <td>
          <img src={team_info[abbrevToTeamId[player.teamAbbrevs]].logo} alt="" width="40" height="40" />
        </td>
      )}
      {searchMode === 'allSeasons' ? <td>{make_readable_season(`${player.seasonId}`)}</td> : null}
    </>
  );

  const render_draft_button = player => (
    <td colSpan={8}>
      <button className="base-button" type="button" onClick={() => confirm_selection(player)}>
        Draft Player
      </button>
    </td>
  );

  const render_already_drafted_tooltip = (player, i) =>
    playersIdToPoolerMap && playersIdToPoolerMap[player.playerId] ? (
      <td>
        <a
          data-tip={`${player.skaterFullName ?? player.goalieFullName} has already been drafted by ${
            DictUsers ? DictUsers[playersIdToPoolerMap[player.playerId]] : playersIdToPoolerMap[player.playerId]
          }`}
        >
          <RiInformationFill size={30} color="yellow" />
        </a>
        <ReactTooltip className="tooltip" padding="8px" />
      </td>
    ) : (
      <td>{i + 1}</td>
    );

  const get_already_drafted_bg_color = player =>
    playersIdToPoolerMap && playersIdToPoolerMap[player.playerId] ? { backgroundColor: '#aa4a44' } : null;

  const render_pool_context_columns = player =>
    poolInfo?.status === 'InProgress' ? (
      <td>
        {playersIdToPoolerMap && playersIdToPoolerMap[player.playerId] ? (
          <User id={playersIdToPoolerMap[player.playerId]} user={user} DictUsers={DictUsers} />
        ) : null}
      </td>
    ) : null;

  const render_skaters_leaders = () =>
    leaders.map((player, i) => (
      <tr
        key={player.playerId}
        onClick={() => setSelectedPlayer(player.playerId)}
        style={poolInfo?.status === 'Draft' ? get_already_drafted_bg_color(player) : null}
      >
        {poolInfo?.status === 'Draft' ? render_already_drafted_tooltip(player) : <td>{i + 1}</td>}
        <td>
          <PlayerLink name={player.skaterFullName} id={player.playerId} injury={injury} />
        </td>
        {render_mode_columns(player)}
        {render_pool_context_columns(player)}
        {selectedPlayer === player.playerId && confirm_selection ? (
          render_draft_button(player)
        ) : (
          <>
            {sorting_highlight(player.positionCode, 'positionCode')}
            {sorting_highlight(player.gamesPlayed, 'gamesPlayed')}
            {sorting_highlight(player.goals, 'goals')}
            {sorting_highlight(player.assists, 'assists')}
            {sorting_highlight(player.points, 'points')}
            {poolInfo?.status === 'Draft' ? null : ( // Don't display those columns in draft context
              <>
                {sorting_highlight(player.plusMinus, 'plusMinus')}
                {sorting_highlight(player.penaltyMinutes, 'penaltyMinutes')}
              </>
            )}
            {sorting_highlight(Math.round((player.pointsPerGame + Number.EPSILON) * 100) / 100, 'pointsPerGame')}
          </>
        )}
      </tr>
    ));

  const render_goalies_leaders = () =>
    leaders.map((player, i) => (
      <tr
        key={player.playerId}
        onClick={() => setSelectedPlayer(player.playerId)}
        style={poolInfo?.status === 'Draft' ? get_already_drafted_bg_color(player) : null}
      >
        {poolInfo?.status === 'Draft' ? render_already_drafted_tooltip(player) : <td>{i + 1}</td>}
        <td>
          <PlayerLink name={player.goalieFullName} id={player.playerId} injury={injury} />
        </td>
        {render_mode_columns(player)}
        {render_pool_context_columns(player)}
        {selectedPlayer === player.playerId && confirm_selection ? (
          render_draft_button(player)
        ) : (
          <>
            {sorting_highlight(player.gamesPlayed, 'gamesPlayed')}
            {sorting_highlight(player.wins, 'wins')}
            {sorting_highlight(player.otLosses, 'otLosses')}
            {poolInfo?.status === 'Draft' ? null : ( // Don't display those columns in draft context
              <>
                {sorting_highlight(player.gamesStarted, 'gamesStarted')}
                {sorting_highlight(player.losses, 'losses')}
                {sorting_highlight(player.shotsAgainst, 'shotsAgainst')}
                {sorting_highlight(player.saves, 'saves')}
              </>
            )}
            {sorting_highlight(player.goalsAgainst, 'goalsAgainst')}
            {sorting_highlight(Math.round((player.savePct + Number.EPSILON) * 1000) / 1000, 'savePct')}
            {sorting_highlight(
              Math.round((player.goalsAgainstAverage + Number.EPSILON) * 100) / 100,
              'goalsAgainstAverage'
            )}
          </>
        )}
      </tr>
    ));

  const onClickPlayerType = (_type, _statsType, _playerType) => {
    setType(_type);
    setPlayerType(_playerType);
    setStatsType(_statsType);
    fetch_top_players(15, true, _type, _statsType, _playerType, startSeason, endSeason, searchMode);
    setLeaders([]);
  };

  const render_more_button = isSkater => (
    <tr>
      <td colSpan={get_context_column_span(isSkater)}>
        <button
          className="base-button"
          type="button"
          onClick={() => fetch_top_players(20, false, type, statsType, playerType, startSeason, endSeason, searchMode)}
        >
          20 More...
        </button>
      </td>
    </tr>
  );

  const render_leaders_table = () =>
    type === 'skater' ? (
      <table className="content-table-no-min">
        <thead>{render_skaters_leaders_header()}</thead>
        <tbody>
          {render_skaters_leaders()}
          {render_more_button(true)}
        </tbody>
      </table>
    ) : (
      <table className="content-table-no-min">
        <thead>{render_goalies_leaders_header()}</thead>
        <tbody>
          {render_goalies_leaders()}
          {render_more_button(false)}
        </tbody>
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

  const season_options = (season, isStart, isSingleDate) => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) {
      if (
        isSingleDate || // In Single season mode, we want all date.
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

  const select_option = (value, text) => (
    <option value={value} selected={playerType === value}>
      {text}
    </option>
  );

  // Start season
  const handleChangeStartSeason = event => {
    setLeaders([]);
    setStartSeason(event.target.value);
    fetch_top_players(15, true, type, statsType, playerType, event.target.value, endSeason, searchMode);
  };

  // End season
  const handleChangeEndSeason = event => {
    setLeaders([]);
    setEndSeason(event.target.value);
    fetch_top_players(15, true, type, statsType, playerType, startSeason, event.target.value, searchMode);
  };

  // Single Season
  const handleChangesingleSeason = event => {
    setLeaders([]);
    setStartSeason(event.target.value);
    setEndSeason(event.target.value);
    fetch_top_players(15, true, type, statsType, playerType, event.target.value, event.target.value, searchMode);
  };

  const handleChangesSearchMode = event => {
    setLeaders([]);
    switch (event.target.value) {
      case 'singleSeason': {
        setStartSeason(endSeason); // make sure that when this mode is requested, start date and end date are the same.
        setEndSeason(endSeason);
        fetch_top_players(15, true, type, statsType, playerType, endSeason, endSeason, event.target.value);
        setSearchMode(event.target.value);
        break;
      }
      case 'allSeasons':
      case 'allSeasonsAggregate': {
        fetch_top_players(15, true, type, statsType, playerType, startSeason, endSeason, event.target.value);
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
    <div>
      <table>
        <tbody>
          {!playersIdToPoolerMap ? ( // only display these options when not into pool context.
            <>
              <tr>
                <th>
                  <h2>Search Mode:</h2>
                </th>
                <td>
                  <select onChange={handleChangesSearchMode} defaultValue={searchMode}>
                    {select_option('singleSeason', 'Single Season')}
                    {select_option('allSeasons', 'All Seasons')}
                    {select_option('allSeasonsAggregate', 'All Seasons Aggregate')}
                  </select>
                </td>
              </tr>
              {searchMode === 'singleSeason' ? (
                <tr>
                  <th>
                    <h2>Season:</h2>
                  </th>
                  <td>
                    <select onChange={handleChangesingleSeason}>{season_options(startSeason, null, true)}</select>
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <th>
                      <h2>Start Season:</h2>
                    </th>
                    <td>
                      <select onChange={handleChangeStartSeason}>{season_options(startSeason, true, false)}</select>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <h2>End Season:</h2>
                    </th>
                    <td>
                      <select onChange={handleChangeEndSeason}>{season_options(endSeason, false, false)}</select>
                    </td>
                  </tr>
                </>
              )}
            </>
          ) : null}
          <tr>
            <th>
              <h2>Player Type:</h2>
            </th>
            <td>
              {render_players_type_inputs('skater', 'points', 'allSkaters', 'Skaters')}
              {render_players_type_inputs('goalie', 'wins', 'GOnly', 'Goalies Only')}
            </td>
          </tr>
          {type === 'skater' ? (
            <tr>
              <th>
                <h2>Skater Type:</h2>
              </th>
              <td>
                <select onChange={handleChangesSkaterType} defaultValue={playerType}>
                  {select_option('allSkaters', 'All Skaters')}
                  {select_option('allForwards', 'All Forwards')}
                  {select_option('LOnly', 'LW Only')}
                  {select_option('ROnly', 'RW Only')}
                  {select_option('COnly', 'Centers Only')}
                  {select_option('DOnly', 'Defenders Only')}
                </select>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {leaders.length > 0 ? (
        render_leaders_table()
      ) : (
        <div>
          <h2>Fetching league leaders...</h2>
          <ClipLoader color="#fff" loading size={75} />
        </div>
      )}
    </div>
  );
}
