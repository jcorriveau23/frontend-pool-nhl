import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import Cookies from 'js-cookie';

// icons
import { RiTeamFill, RiInformationFill, RiSettings2Fill } from 'react-icons/ri';
import { BsCalendarDay, BsFillCalculatorFill, BsCashCoin, BsGraphUp } from 'react-icons/bs';
import { ImHammer, ImHistory } from 'react-icons/im';
import { FaExchangeAlt } from 'react-icons/fa';

// component
import DayLeaders from '../home_page/dailyLeaders';
import PlayerLink from '../playerLink';
import PickList from './pickList';
import DailyRanking from './dailyRanking';
import DraftOrder from './draftOrder';
import NaviguateToday from './naviguateToday';
import User from '../user';
import RosterCapHit from './rosterCapHit';
import SearchPlayersStats from '../stats_page/searchPlayersStats';
import PoolHistory from './poolHistory';
import PoolSettings from './poolSettings';
import TradeCenter from './tradeCenter';

// modals
import FillSpotModal from '../../modals/FillSpot';
import RosterModificationModal from '../../modals/rosterModification';
import CumulativeGraphStats from '../../modals/cumulativeGraphStats';
import PlayerGraphStats from '../../modals/playerGraphStats';
import AddPlayerModal from '../../modals/addPlayer';

// images
import { team_info } from '../img/logos';
import liveGame from '../img/icons/live-game.png';

// css
import '../react-tabs.css';

export default function InProgressPool({
  user,
  hasOwnerRights,
  DictUsers,
  poolInfo,
  playersIdToPoolerMap,
  injury,
  userIndex,
  formatDate,
  todayFormatDate,
  gameStatus,
  setPoolUpdate,
  DictTeamAgainst,
}) {
  const get_default_mainTab = () => (gameStatus === 'Live' ? 1 : 0);
  const get_default_userTab = () => (userIndex === -1 ? 0 : userIndex);

  const [playersStats, setPlayersStats] = useState(null);
  const [dayLeaders, setDayLeaders] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [showFillSpotModal, setShowFillSpotModal] = useState(false);
  const [fillSpotPosition, setFillSpotPosition] = useState('');
  const [showRosterModificationModal, setShowRosterModificationModal] = useState(false);
  const [showCumulativeGraphStats, setShowCumultiveGraphStats] = useState(false);
  const [showPlayerGraphStats, setShowPlayerGraphStats] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [rosterModificationAllowed, setRosterModificationAllowed] = useState(false);
  const [tabSelectionParams, setTabSelectionParams] = useSearchParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  // Tab Index states. They are used in different child components.
  const [mainTabIndex, setMainTabIndex] = useState(Number(tabSelectionParams.get('mainTab') ?? get_default_mainTab()));
  const [userTabIndex, setUserTabIndex] = useState(Number(tabSelectionParams.get('userTab') ?? get_default_userTab()));

  const get_new_skater = (playerId, isOwn, isReservist) => {
    const player = { ...poolInfo.context.players[playerId] };

    player.nb_game = 0;
    player.G = 0;
    player.A = 0;
    player.HT = 0;
    player.SOG = 0;
    player.pool_points = 0;
    player.own = isOwn;
    player.reservist = isReservist;
    player.ignore = true;

    return player;
  };

  const get_new_goaly = (playerId, isOwn, isReservist) => {
    const player = { ...poolInfo.context.players[playerId] };

    player.nb_game = 0;
    player.G = 0;
    player.A = 0;
    player.W = 0;
    player.SO = 0;
    player.OT = 0;
    player.pool_points = 0;
    player.own = isOwn;
    player.reservist = isReservist;
    player.ignore = true;

    return player;
  };

  const calculate_pool_stats = async () => {
    const stats = {}; // contains players list per pooler and poolers total points
    const rank = []; // contains pooler total points

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      stats[participant] = {
        forwards_total_game: 0,
        forwards_total_goal: 0,
        forwards_total_assist: 0,
        forwards_total_hattrick: 0,
        forwards_total_shootout_goals: 0,
        forwards_total_pts: 0,
        defenders_total_game: 0,
        defenders_total_goal: 0,
        defenders_total_assist: 0,
        defenders_total_hattrick: 0,
        defenders_total_shootout_goals: 0,
        defenders_total_pts: 0,
        goalies_total_game: 0,
        goalies_total_goal: 0,
        goalies_total_assist: 0,
        goalies_total_win: 0,
        goalies_total_shutout: 0,
        goalies_total_OT: 0,
        goalies_total_pts: 0,
        chosen_forwards: [],
        chosen_defenders: [],
        chosen_goalies: [],
        chosen_reservists: [],
      };

      // Forwards

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_forwards.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_forwards[j];

        stats[participant].chosen_forwards.push(get_new_skater(playerId.toString(), true, false));
      }

      // Defenders

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_defenders.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_defenders[j];

        stats[participant].chosen_defenders.push(get_new_skater(playerId.toString(), true, false));
      }

      // Goalies

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_goalies.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_goalies[j];

        stats[participant].chosen_goalies.push(get_new_goaly(playerId.toString(), true, false));
      }

      // Reservists

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_reservists.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_reservists[j];
        const player = { ...poolInfo.context.players[playerId.toString()] };

        player.own = false;
      }
    }

    // Parse the list of all daily games information to get the stats of each players

    const startDate = new Date(poolInfo.season_start);
    let endDate = new Date(formatDate);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
    if (endDate < startDate) {
      endDate = poolInfo.season_start;
    }

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
          const participant = poolInfo.participants[i];

          // Forwards

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.F).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.F[key];
            const playerId = Number(key);

            if (player) {
              let index = stats[participant].chosen_forwards.findIndex(f => f.id === playerId);

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  r => r === playerId
                );

                // The player has played in the past for this participant but is no more into the starting roster.
                index = stats[participant].chosen_forwards.push(get_new_skater(key, false, indexReservist > -1)) - 1;
              }

              stats[participant].chosen_forwards[index].nb_game += 1;
              stats[participant].chosen_forwards[index].G += player.G;
              stats[participant].chosen_forwards[index].A += player.A;
              stats[participant].chosen_forwards[index].HT += player.G >= 3 ? 1 : 0; //  hattrick
              stats[participant].chosen_forwards[index].SOG += player.SOG ? player.SOG : 0; // Shootout goals

              // total pool points
              stats[participant].chosen_forwards[index].pool_points =
                stats[participant].chosen_forwards[index].G * poolInfo.settings.forward_pts_goals +
                stats[participant].chosen_forwards[index].A * poolInfo.settings.forward_pts_assists +
                stats[participant].chosen_forwards[index].HT * poolInfo.settings.forward_pts_hattricks +
                stats[participant].chosen_forwards[index].SOG * poolInfo.settings.forward_pts_shootout_goals;
            }

            return null;
          });

          // Defenders

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.D).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.D[key];
            const playerId = Number(key);

            if (player) {
              let index = stats[participant].chosen_defenders.findIndex(d => d.id === playerId);

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  r => r === playerId
                );

                // The player has played in the past for this participant but is no more into the starting roster.
                index = stats[participant].chosen_defenders.push(get_new_skater(key, false, indexReservist > -1)) - 1;
              }

              stats[participant].chosen_defenders[index].nb_game += 1;
              stats[participant].chosen_defenders[index].G += player.G;
              stats[participant].chosen_defenders[index].A += player.A;
              stats[participant].chosen_defenders[index].HT += player.G >= 3 ? 1 : 0; // hattricks
              stats[participant].chosen_defenders[index].SOG += player.SOG ? player.SOG : 0; // shootout goals

              // total pool points
              stats[participant].chosen_defenders[index].pool_points =
                stats[participant].chosen_defenders[index].G * poolInfo.settings.defender_pts_goals +
                stats[participant].chosen_defenders[index].A * poolInfo.settings.defender_pts_assists +
                stats[participant].chosen_defenders[index].HT * poolInfo.settings.defender_pts_hattricks +
                stats[participant].chosen_defenders[index].SOG * poolInfo.settings.defender_pts_shootout_goals;
            }

            return null;
          });

          // Goalies

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.G).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.G[key];
            const playerId = Number(key);

            if (player) {
              let index = stats[participant].chosen_goalies.findIndex(g => g.id === playerId);

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  r => r === playerId
                );

                // The player has played in the past for this participant but is no more into the starting roster.
                index = stats[participant].chosen_goalies.push(get_new_goaly(key, false, indexReservist > -1)) - 1;
              }

              stats[participant].chosen_goalies[index].nb_game += 1;
              stats[participant].chosen_goalies[index].G += player.G;
              stats[participant].chosen_goalies[index].A += player.A;
              stats[participant].chosen_goalies[index].W += player.W;
              stats[participant].chosen_goalies[index].SO += player.SO;
              stats[participant].chosen_goalies[index].OT += player.OT;

              // total pool points
              stats[participant].chosen_goalies[index].pool_points =
                stats[participant].chosen_goalies[index].G * poolInfo.settings.goalies_pts_goals +
                stats[participant].chosen_goalies[index].A * poolInfo.settings.goalies_pts_assists +
                stats[participant].chosen_goalies[index].W * poolInfo.settings.goalies_pts_wins +
                stats[participant].chosen_goalies[index].SO * poolInfo.settings.goalies_pts_shutouts +
                stats[participant].chosen_goalies[index].OT * poolInfo.settings.goalies_pts_overtimes;
            }

            return null;
          });
        }
      }
    }

    // Count the number of players own on that date
    // Also create the Rank table.
    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      stats[participant].forwards_own = 0;
      stats[participant].defenders_own = 0;
      stats[participant].goalies_own = 0;

      // Sort player list using the pool_points field.
      stats[participant].chosen_forwards.sort((a, b) => b.pool_points - a.pool_points);
      stats[participant].chosen_defenders.sort((a, b) => b.pool_points - a.pool_points);
      stats[participant].chosen_goalies.sort((a, b) => b.pool_points - a.pool_points);

      for (let j = 0; j < stats[participant].chosen_forwards.length; j += 1) {
        const player = stats[participant].chosen_forwards[j];
        stats[participant].forwards_own += player.own ? 1 : 0;
        // cumulative info.
        if (j < stats[participant].chosen_forwards.length - poolInfo.settings.number_worst_forwards_to_ignore) {
          player.ignore = false;
          stats[participant].forwards_total_goal += player.G;
          stats[participant].forwards_total_game += player.nb_game; // will be count during the for loop.
          stats[participant].forwards_total_assist += player.A;
          stats[participant].forwards_total_hattrick += player.HT;
          stats[participant].forwards_total_shootout_goals += player.SOG;
          stats[participant].forwards_total_pts +=
            player.G * poolInfo.settings.forward_pts_goals +
            player.A * poolInfo.settings.forward_pts_assists +
            player.SOG * poolInfo.settings.forward_pts_shootout_goals +
            player.HT * poolInfo.settings.forward_pts_hattricks;
        }
      }

      for (let j = 0; j < stats[participant].chosen_defenders.length; j += 1) {
        const player = stats[participant].chosen_defenders[j];
        stats[participant].defenders_own += player.own ? 1 : 0;
        // cumulative info.
        if (j < stats[participant].chosen_defenders.length - poolInfo.settings.number_worst_defenders_to_ignore) {
          player.ignore = false;
          stats[participant].defenders_total_goal += player.G;
          stats[participant].defenders_total_game += player.nb_game; // will be count during the for loop.
          stats[participant].defenders_total_assist += player.A;
          stats[participant].defenders_total_hattrick += player.HT;
          stats[participant].defenders_total_shootout_goals += player.SOG;
          stats[participant].defenders_total_pts +=
            player.G * poolInfo.settings.defender_pts_goals +
            player.A * poolInfo.settings.defender_pts_assists +
            player.SOG * poolInfo.settings.defender_pts_shootout_goals +
            player.HT * poolInfo.settings.defender_pts_hattricks;
        }
      }

      for (let j = 0; j < stats[participant].chosen_goalies.length; j += 1) {
        const player = stats[participant].chosen_goalies[j];
        stats[participant].goalies_own += player.own ? 1 : 0;
        // cumulative info.
        if (j < stats[participant].chosen_goalies.length - poolInfo.settings.number_worst_goalies_to_ignore) {
          player.ignore = false;
          stats[participant].goalies_total_goal += player.G;
          stats[participant].goalies_total_game += player.nb_game; // will be count during the for loop.
          stats[participant].goalies_total_assist += player.A;
          stats[participant].goalies_total_win += player.W;
          stats[participant].goalies_total_shutout += player.SO;
          stats[participant].goalies_total_OT += player.OT;
          stats[participant].goalies_total_pts +=
            player.G * poolInfo.settings.goalies_pts_goals +
            player.A * poolInfo.settings.goalies_pts_assists +
            player.W * poolInfo.settings.goalies_pts_wins +
            player.SO * poolInfo.settings.goalies_pts_shutouts +
            player.OT * poolInfo.settings.goalies_pts_overtimes;
        }
      }

      rank.push({
        participant,
        // forwards global stats
        forwards_total_game: stats[participant].forwards_total_game,
        forwards_total_goal: stats[participant].forwards_total_goal,
        forwards_total_assist: stats[participant].forwards_total_assist,
        forwards_total_hattrick: stats[participant].forwards_total_hattrick,
        forwards_total_shootout_goals: stats[participant].forwards_total_shootout_goals,
        forwards_total_pts: stats[participant].forwards_total_pts,
        // Defenders global stats
        defenders_total_game: stats[participant].defenders_total_game,
        defenders_total_goal: stats[participant].defenders_total_goal,
        defenders_total_assist: stats[participant].defenders_total_assist,
        defenders_total_hattrick: stats[participant].defenders_total_hattrick,
        defenders_total_shootout_goals: stats[participant].defenders_total_shootout_goals,
        defenders_total_pts: stats[participant].defenders_total_pts,
        // goalies global stats
        goalies_total_game: stats[participant].goalies_total_game,
        goalies_total_goal: stats[participant].goalies_total_goal,
        goalies_total_assist: stats[participant].goalies_total_assist,
        goalies_total_win: stats[participant].goalies_total_win,
        goalies_total_shutout: stats[participant].goalies_total_shutout,
        goalies_total_OT: stats[participant].goalies_total_OT,
        goalies_total_pts: stats[participant].goalies_total_pts,
        total_game:
          stats[participant].forwards_total_game +
          stats[participant].defenders_total_game +
          stats[participant].goalies_total_game,
        total_pts:
          stats[participant].forwards_total_pts +
          stats[participant].defenders_total_pts +
          stats[participant].goalies_total_pts,
      });
    }

    setRanking(rank);
    setPlayersStats(stats);
    console.log('done calculating');
  };

  useEffect(() => {
    if (formatDate) {
      calculate_pool_stats();
    }

    if (todayFormatDate) {
      const d = new Date(todayFormatDate);
      d.setDate(d.getDate() + 1);
      const seasonStartDate = new Date(poolInfo.season_start);

      // Allow to modify the roster on the modification dates and before the season starts.
      setRosterModificationAllowed(
        poolInfo.settings.roster_modification_date.includes(d.toISOString().slice(0, 10)) || seasonStartDate >= d
      );
    }
  }, [formatDate, poolInfo.context.score_by_day]);

  const mark_as_final = async pool => {
    try {
      await axios.post(
        '/api-rust/mark-as-final',
        {
          pool_name: poolInfo.name,
        },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
        }
      );
    } catch (e) {
      alert(e);
    }
  };

  const download_csv = pool => {
    let csv = 'Player Name,Team\n';

    for (let i = 0; i < pool.number_poolers; i += 1) {
      const pooler = pool.participants[i];

      // forward
      csv += `\n${pooler}'s forwards\n`;
      for (let j = 0; j < pool.context[pooler].chosen_forwards.length; j += 1) {
        csv += `${pool.context[pooler].chosen_forwards[j].name}, ${pool.context[pooler].chosen_forwards[j].team}\n`;
      }

      // defenders
      csv += `\n${pooler}'s defenders\n`;
      for (let j = 0; j < pool.context[pooler].chosen_defenders.length; j += 1) {
        csv += `${pool.context[pooler].chosen_defenders[j].name}, ${pool.context[pooler].chosen_defenders[j].team}\n`;
      }

      // goalies
      csv += `\n${pooler}'s goalies\n`;
      for (let j = 0; j < pool.context[pooler].chosen_goalies.length; j += 1) {
        csv += `${pool.context[pooler].chosen_goalies[j].name}, ${pool.context[pooler].chosen_goalies[j].team}\n`;
      }

      // reservist
      csv += `\n${pooler}'s reservists\n`;
      for (let j = 0; j < pool.context[pooler].chosen_reservists.length; j += 1) {
        csv += `${pool.context[pooler].chosen_reservists[j].name}, ${pool.context[pooler].chosen_reservists[j].team}\n`;
      }

      csv += '\n\n-------, -------, -------, -------\n\n';
    }

    const hiddenElement = document.createElement('a');
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
    hiddenElement.target = '_blank';
    hiddenElement.download = `${poolInfo.name}.csv`;
    hiddenElement.click();
  };

  const open_fill_spot_modal = position => {
    setShowFillSpotModal(true);
    setFillSpotPosition(position);
  };

  const get_empty_rows = (players_length, max, pooler, position) => {
    const emptyRows = [];
    for (let i = players_length; i < max; i += 1) {
      emptyRows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td colSpan={3}>
            {pooler === user?._id ||
            poolInfo.owner === user?._id ||
            poolInfo.settings.assistants.includes(user?._id) ? (
              <button className="base-button" type="button" onClick={() => open_fill_spot_modal(position)}>
                Fill Spot
              </button>
            ) : (
              '-'
            )}
          </td>
          <td colSpan={9}>Empty spot</td>
        </tr>
      );
    }

    return emptyRows;
  };

  const get_inactive_player_message = player => {
    if (player.reservist) {
      return `${poolInfo.context.players[player.id].name} is a reservist.`;
    }
    if (player.ignore) {
      return `${poolInfo.context.players[player.id].name} stats is ignore.`;
    }
    return `${poolInfo.context.players[player.id].name} has been traded.`;
  };

  const render_inactive_players_tooltip = player => (
    <>
      <a data-tip={get_inactive_player_message(player)}>
        <RiInformationFill size={30} color="yellow" />
      </a>
      <ReactTooltip className="tooltip" padding="8px" />
    </>
  );

  const render_not_own_player_color = isReservist => (isReservist ? '#e1ad01' : '#aa4a44');

  const render_skater_stats = (
    pooler,
    own_key,
    chosen_player_key,
    player_total_pts_key,
    player_total_goal_key,
    player_total_assist_key,
    player_total_hattrick_key,
    player_total_shootout_goal_key,
    max,
    position
  ) => {
    const emptyRows = get_empty_rows(playersStats[pooler][own_key], max, pooler, position);
    const playerTotalGame =
      position === 'F' ? playersStats[pooler].forwards_total_game : playersStats[pooler].defenders_total_game;
    return (
      <>
        {playersStats[pooler][chosen_player_key]
          .sort((p1, p2) => p2.pool_points - p1.pool_points)
          .map((player, i) => (
            <tr
              key={player.id}
              style={{
                backgroundColor: player.own && !player.ignore ? null : render_not_own_player_color(player.reservist),
              }}
              onClick={() => setSelectedPlayerId(player.id)}
            >
              <td>{i + 1}</td>
              <td>
                {player.own && !player.ignore ? <RiTeamFill size={25} /> : render_inactive_players_tooltip(player)}
              </td>
              <td colSpan={2}>
                <PlayerLink name={poolInfo.context.players[player.id].name} id={player.id} injury={injury} />
              </td>
              <td>
                <img src={team_info[poolInfo.context.players[player.id].team]?.logo} alt="" width="40" height="40" />
              </td>
              <td>{player.nb_game}</td>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.G + player.A}</td>
              <td>{player.HT}</td>
              <td>{player.SOG}</td>
              {player.id === selectedPlayerId ? (
                <td colSpan={2}>
                  <button
                    type="button"
                    className="base-button"
                    onClick={() => setShowPlayerGraphStats(!showPlayerGraphStats)}
                  >
                    <BsGraphUp size={30} />
                  </button>
                </td>
              ) : (
                <>
                  <td>
                    <b style={{ color: '#a20' }}>{player.pool_points}</b>
                  </td>
                  <td>
                    {player.nb_game
                      ? Math.round((player.pool_points / player.nb_game + Number.EPSILON) * 100) / 100
                      : 0.0}
                  </td>
                </>
              )}
            </tr>
          ))}
        {emptyRows.map(row => row)}
        <tr>
          <th>total</th>
          <th> - </th>
          <th colSpan={2}> - </th>
          <th> - </th>
          <th>{playerTotalGame}</th>
          <th>{playersStats[pooler][player_total_goal_key]}</th>
          <th>{playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_goal_key] + playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_hattrick_key]}</th>
          <th>{playersStats[pooler][player_total_shootout_goal_key]}</th>
          <th>
            <b>{playersStats[pooler][player_total_pts_key]}</b>
          </th>
          <th>
            {playerTotalGame
              ? Math.round((playersStats[pooler][player_total_pts_key] / playerTotalGame + Number.EPSILON) * 100) / 100
              : 0.0}
          </th>
        </tr>
      </>
    );
  };

  const render_goalies_stats = (pooler, max) => {
    const emptyRows = get_empty_rows(playersStats[pooler].goalies_own, max, pooler, 'G');
    return (
      <>
        {playersStats[pooler].chosen_goalies
          .sort((p1, p2) => p2.pool_points - p1.pool_points)
          .map((player, i) => (
            <tr
              key={player.id}
              style={{
                backgroundColor: player.own && !player.ignore ? null : render_not_own_player_color(player.reservist),
              }}
              onClick={() => setSelectedPlayerId(player.id)}
            >
              <td>{i + 1}</td>
              <td>
                {player.own && !player.ignore ? <RiTeamFill size={25} /> : render_inactive_players_tooltip(player)}
              </td>
              <td colSpan={2}>
                <PlayerLink name={poolInfo.context.players[player.id].name} id={player.id} injury={injury} />
              </td>
              <td>
                <img src={team_info[poolInfo.context.players[player.id].team]?.logo} alt="" width="40" height="40" />
              </td>
              <td>{player.nb_game}</td>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.W}</td>
              <td>{player.SO}</td>
              <td>{player.OT}</td>
              {player.id === selectedPlayerId ? (
                <td colSpan={2}>
                  <button type="button" className="base-button">
                    <BsGraphUp size={30} />
                  </button>
                </td>
              ) : (
                <>
                  <td>
                    <b style={{ color: '#a20' }}>{player.pool_points}</b>
                  </td>
                  <td>
                    {player.nb_game
                      ? Math.round((player.pool_points / player.nb_game + Number.EPSILON) * 100) / 100
                      : 0.0}
                  </td>
                </>
              )}
            </tr>
          ))}
        {emptyRows.map(row => row)}
        <tr>
          <th>total</th>
          <th> - </th>
          <th colSpan={2}> - </th>
          <th> - </th>
          <th>{playersStats[pooler].goalies_total_game}</th>
          <th>{playersStats[pooler].goalies_total_goal}</th>
          <th>{playersStats[pooler].goalies_total_assist}</th>
          <th>{playersStats[pooler].goalies_total_win}</th>
          <th>{playersStats[pooler].goalies_total_shutout}</th>
          <th>{playersStats[pooler].goalies_total_OT}</th>
          <th>
            <b>{playersStats[pooler].goalies_total_pts}</b>
          </th>
          <th>
            {playersStats[pooler].goalies_total_game
              ? Math.round(
                  (playersStats[pooler].goalies_total_pts / playersStats[pooler].goalies_total_game + Number.EPSILON) *
                    100
                ) / 100
              : 0.0}
          </th>
        </tr>
      </>
    );
  };

  const render_reservists = pooler =>
    poolInfo.context.pooler_roster[pooler].chosen_reservists.map((playerId, i) => (
      <tr key={playerId}>
        <td>{i + 1}</td>
        <td>
          <RiTeamFill size={25} />
        </td>
        <td colSpan={9}>
          <PlayerLink name={poolInfo.context.players[playerId].name} id={playerId} injury={injury} />
        </td>
        <td>
          <img src={team_info[poolInfo.context.players[playerId].team]?.logo} alt="" width="40" height="40" />
        </td>
        <td>{poolInfo.context.players[playerId].position}</td>
      </tr>
    ));

  const render_header_skaters = () => (
    <tr>
      <th>#</th>
      <th>Status</th>
      <th colSpan={2}>Name</th>
      <th>Team</th>
      <th>GP</th>
      <th>G</th>
      <th>A</th>
      <th>P</th>
      <th>HT</th>
      <th>G*</th>
      <th>P (pool)</th>
      <th>P/G (pool)</th>
    </tr>
  );

  const render_header_goalies = () => (
    <tr>
      <th>#</th>
      <th>Status</th>
      <th colSpan={2}>Name</th>
      <th>Team</th>
      <th>GP</th>
      <th>G</th>
      <th>A</th>
      <th>W</th>
      <th>SO</th>
      <th>OT</th>
      <th>P (pool)</th>
      <th>P/G (pool)</th>
    </tr>
  );

  const render_header_reservists = () => (
    <tr>
      <th>#</th>
      <th>Own</th>
      <th colSpan={9}>Name</th>
      <th>Team</th>
      <th>Position</th>
    </tr>
  );

  const setUserTab = _userTabIndex => {
    const updatedSearchParams = new URLSearchParams(tabSelectionParams.toString());
    updatedSearchParams.set('userTab', _userTabIndex);
    setTabSelectionParams(updatedSearchParams.toString());

    setUserTabIndex(_userTabIndex);
  };

  const select_participant = _participant => {
    const index = poolInfo.participants.findIndex(participant => participant === _participant);
    setUserTab(index);
  };

  const tooltip_msg = () => {
    if (
      formatDate === todayFormatDate &&
      poolInfo.context.score_by_day &&
      poolInfo.context.score_by_day[formatDate] &&
      !poolInfo.context.score_by_day[formatDate][poolInfo.participants[0]].is_cumulated
    ) {
      if (gameStatus === 'Live') {
        return 'The current game have not been cumulated yet.';
      }
      if (gameStatus === 'Final') {
        return 'Yesterday games have not been cumulated yet.';
      }
    }

    return null;
  };

  const render_tabs_roster_stats = () => (
    <Tabs selectedIndex={userTabIndex} onSelect={index => setUserTab(index)}>
      <TabList>
        {poolInfo.participants.map(pooler => (
          <Tab key={pooler}>
            <User id={pooler} user={user} DictUsers={DictUsers} />
          </Tab>
        ))}
      </TabList>
      {poolInfo.participants.map(pooler => (
        <TabPanel key={pooler}>
          <div className="half-cont">
            {(pooler === user?._id ||
              poolInfo.owner === user?._id ||
              poolInfo.settings.assistants.includes(user?._id)) &&
            rosterModificationAllowed ? (
              <table>
                <tbody>
                  <tr>
                    <td>
                      <button
                        className="base-button"
                        type="button"
                        onClick={() => setShowRosterModificationModal(true)}
                      >
                        Modify Roster
                      </button>
                    </td>
                    <td>
                      <a data-tip="Roster modification are allowed today!">
                        <RiInformationFill size={45} color="yellow" />
                      </a>
                      <ReactTooltip className="tooltip" />
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : null}
            <table className="content-table-no-min">
              <thead>
                <NaviguateToday
                  formatDate={formatDate}
                  todayFormatDate={todayFormatDate}
                  msg="Points Cumulate"
                  colSpan={13}
                  tooltipMsg={tooltip_msg()}
                />
                <tr>
                  <th colSpan={13}>
                    Forwards ({playersStats[pooler].forwards_own}/{poolInfo.settings.number_forwards})
                  </th>
                </tr>
                {render_header_skaters()}
              </thead>
              <tbody>
                {render_skater_stats(
                  pooler,
                  'forwards_own',
                  'chosen_forwards',
                  'forwards_total_pts',
                  'forwards_total_goal',
                  'forwards_total_assist',
                  'forwards_total_hattrick',
                  'forwards_total_shootout_goals',
                  poolInfo.settings.number_forwards,
                  'F'
                )}
              </tbody>
            </table>
            <table className="content-table-no-min">
              <thead>
                <tr>
                  <th colSpan={13}>
                    Defenders ({playersStats[pooler].defenders_own}/{poolInfo.settings.number_defenders})
                  </th>
                </tr>
                {render_header_skaters()}
              </thead>
              <tbody>
                {render_skater_stats(
                  pooler,
                  'defenders_own',
                  'chosen_defenders',
                  'defenders_total_pts',
                  'defenders_total_goal',
                  'defenders_total_assist',
                  'defenders_total_hattrick',
                  'defenders_total_shootout_goals',
                  poolInfo.settings.number_defenders,
                  'D'
                )}
              </tbody>
            </table>
            <table className="content-table-no-min">
              <thead>
                <tr>
                  <th colSpan={13}>
                    Goalies ({playersStats[pooler].goalies_own}/{poolInfo.settings.number_goalies})
                  </th>
                </tr>
                {render_header_goalies()}
              </thead>
              <tbody>{render_goalies_stats(pooler, poolInfo.settings.number_goalies)}</tbody>
            </table>
            <table className="content-table-no-min">
              <thead>
                <tr>
                  <th colSpan={13}>Reservists</th>
                </tr>
                {render_header_reservists()}
              </thead>
              <tbody>{render_reservists(pooler)}</tbody>
              {poolInfo.owner === user?._id || poolInfo.settings.assistants.includes(user?._id) ? (
                <tr>
                  <td colSpan={13}>
                    <button className="base-button" onClick={() => setShowAddPlayerModal(true)} type="button">
                      Add Player
                    </button>
                  </td>
                </tr>
              ) : null}
            </table>
            <PickList tradablePicks={poolInfo.context.tradable_picks} participant={pooler} DictUsers={DictUsers} />
          </div>
        </TabPanel>
      ))}
    </Tabs>
  );

  const setMainTab = _mainTabIndex => {
    const updatedSearchParams = new URLSearchParams(tabSelectionParams.toString());
    updatedSearchParams.set('mainTab', _mainTabIndex);
    setTabSelectionParams(updatedSearchParams.toString());

    setMainTabIndex(_mainTabIndex);
  };

  const render_tabs_pool_rank = () => (
    <table className="content-table-no-min">
      <thead>
        <NaviguateToday
          formatDate={formatDate}
          todayFormatDate={todayFormatDate}
          msg="Cumulative Ranking"
          tooltipMsg={tooltip_msg()}
          colSpan={26}
        />
        <tr>
          <th rowSpan={2}>#</th>
          <th rowSpan={2}>Pooler</th>
          <th colSpan={6}>Forwards</th>
          <th colSpan={6}>Defenders</th>
          <th colSpan={7}>Goalies</th>
          <th colSpan={3}>Total</th>
        </tr>
        <tr>
          <th>GP</th>
          <th>G</th>
          <th>A</th>
          <th>HT</th>
          <th>G*</th>
          <th>P</th>
          <th>GP</th>
          <th>G</th>
          <th>A</th>
          <th>HT</th>
          <th>G*</th>
          <th>P</th>
          <th>GP</th>
          <th>G</th>
          <th>A</th>
          <th>W</th>
          <th>SO</th>
          <th>OT</th>
          <th>P</th>
          <th>GP</th>
          <th>P</th>
          <th>P/G</th>
        </tr>
      </thead>
      <tbody>
        {ranking
          .sort((p1, p2) => {
            const diff = p2.total_pts - p1.total_pts;
            if (diff === 0) {
              return p1.total_game - p2.total_game;
            }
            return diff;
          })
          .map((rank, i) => (
            <tr
              key={rank.name}
              onClick={() => select_participant(rank.participant)}
              style={
                poolInfo.participants[userTabIndex] === rank.participant
                  ? { backgroundColor: '#eee', cursor: 'pointer' }
                  : { cursor: 'pointer' }
              }
            >
              <td>{i + 1}</td>
              <td>
                <User id={rank.participant} user={user} DictUsers={DictUsers} />
              </td>
              <td>{rank.forwards_total_game}</td>
              <td>{rank.forwards_total_goal}</td>
              <td>{rank.forwards_total_assist}</td>
              <td>{rank.forwards_total_hattrick}</td>
              <td>{rank.forwards_total_shootout_goals}</td>
              <td>
                <b>{rank.forwards_total_pts}</b>
              </td>
              <td>{rank.defenders_total_game}</td>
              <td>{rank.defenders_total_goal}</td>
              <td>{rank.defenders_total_assist}</td>
              <td>{rank.defenders_total_hattrick}</td>
              <td>{rank.defenders_total_shootout_goals}</td>
              <td>
                <b>{rank.defenders_total_pts}</b>
              </td>
              <td>{rank.goalies_total_game}</td>
              <td>{rank.goalies_total_goal}</td>
              <td>{rank.goalies_total_assist}</td>
              <td>{rank.goalies_total_win}</td>
              <td>{rank.goalies_total_shutout}</td>
              <td>{rank.goalies_total_OT}</td>
              <td>
                <b>{rank.goalies_total_pts}</b>
              </td>
              <td style={{ backgroundColor: '#eee', cursor: 'pointer' }}>{rank.total_game}</td>
              <td style={{ backgroundColor: '#eee', cursor: 'pointer' }}>
                <b style={{ color: '#a20' }}>{rank.total_pts}</b>
              </td>
              <td style={{ backgroundColor: '#eee', cursor: 'pointer' }}>
                {Math.round((rank.total_game > 0 ? rank.total_pts / rank.total_game : 0 + Number.EPSILON) * 100) / 100}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  return (
    <div className="min-width">
      <div className="cont">
        {poolInfo.owner === user?._id ? (
          <button className="base-button" type="button" onClick={() => mark_as_final()}>
            Mark as Final
          </button>
        ) : null}
        {playersStats && ranking && gameStatus ? (
          <Tabs selectedIndex={mainTabIndex} onSelect={index => setMainTab(index)}>
            <TabList>
              <Tab>
                <BsFillCalculatorFill size={30} style={{ paddingRight: '5px' }} />
                Cumulative
              </Tab>
              <Tab>
                {gameStatus === 'Live' ? (
                  <img src={liveGame} alt="" width="40" height="40" style={{ paddingRight: '5px' }} />
                ) : (
                  <BsCalendarDay size={30} style={{ paddingRight: '5px' }} />
                )}
                Daily
              </Tab>
              {/* <Tab>
                <BsCashCoin size={30} style={{ paddingRight: '5px' }} />
                Cap Hit
              </Tab> */}
              {poolInfo.settings.can_trade ? (
                <Tab>
                  <FaExchangeAlt size={30} style={{ paddingRight: '5px' }} />
                  Trade
                </Tab>
              ) : null}
              <Tab>
                <ImHistory size={30} style={{ paddingRight: '5px' }} />
                History
              </Tab>
              <Tab>
                <ImHammer size={30} style={{ paddingRight: '5px' }} />
                Draft
              </Tab>
              <Tab>
                <RiSettings2Fill size={30} style={{ paddingRight: '5px' }} />
                Settings
              </Tab>
            </TabList>
            <TabPanel>
              <div className="half-cont">
                <button
                  className="base-button"
                  onClick={() => setShowCumultiveGraphStats(!showCumulativeGraphStats)}
                  type="button"
                >
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <BsGraphUp size={30} />
                        </td>
                        <td width="75%">
                          <b>Graph</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </button>
                {showCumulativeGraphStats ? <CumulativeGraphStats poolInfo={poolInfo} DictUsers={DictUsers} /> : null}
                {showPlayerGraphStats ? (
                  <PlayerGraphStats
                    poolInfo={poolInfo}
                    participant={poolInfo.participants[userTabIndex]}
                    player={poolInfo.context.players[selectedPlayerId]}
                    DictUsers={DictUsers}
                  />
                ) : null}
                {render_tabs_pool_rank()}
                {render_tabs_roster_stats()}
                <button className="base-button" onClick={() => download_csv(poolInfo)} disabled={false} type="button">
                  Download CSV
                </button>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="half-cont">
                <DailyRanking
                  formatDate={formatDate}
                  todayFormatDate={todayFormatDate}
                  dayLeaders={dayLeaders}
                  poolInfo={poolInfo}
                  userTabIndex={userTabIndex}
                  setUserTab={setUserTab}
                  select_participant={select_participant}
                  injury={injury}
                  user={user}
                  DictUsers={DictUsers}
                  gameStatus={gameStatus}
                  DictTeamAgainst={DictTeamAgainst}
                />
                <DayLeaders
                  formatDate={formatDate}
                  todayFormatDate={todayFormatDate}
                  playersIdToPoolerMap={playersIdToPoolerMap}
                  gameStatus={gameStatus}
                  user={user}
                  DictUsers={DictUsers}
                  injury={injury}
                  dayLeaders={dayLeaders}
                  setDayLeaders={setDayLeaders}
                  isPoolContext
                />
              </div>
            </TabPanel>
            {/* <TabPanel>
              <RosterCapHit
                poolInfo={poolInfo}
                userTabIndex={userTabIndex}
                setUserTab={setUserTab}
                select_participant={select_participant}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
              />
            </TabPanel> */}
            {poolInfo.settings.can_trade ? (
              <TabPanel>
                <TradeCenter
                  poolInfo={poolInfo}
                  setPoolUpdate={setPoolUpdate}
                  injury={injury}
                  user={user}
                  hasOwnerRights={hasOwnerRights}
                  DictUsers={DictUsers}
                  userIndex={userIndex}
                />
              </TabPanel>
            ) : null}
            <TabPanel>
              <PoolHistory
                poolInfo={poolInfo}
                todayFormatDate={todayFormatDate}
                setPoolUpdate={setPoolUpdate}
                hasOwnerRights={hasOwnerRights}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
                userIndex={userIndex}
              />
            </TabPanel>
            <TabPanel>
              <DraftOrder poolInfo={poolInfo} injury={injury} DictUsers={DictUsers} user={user} />
            </TabPanel>
            <TabPanel>
              <PoolSettings
                user={user}
                poolInfo={poolInfo}
                hasOwnerRights={hasOwnerRights}
                setPoolUpdate={setPoolUpdate}
                DictUsers={DictUsers}
              />
            </TabPanel>
          </Tabs>
        ) : (
          <div className="cont">
            <h1>Processing pool informations...</h1>
            <ClipLoader color="#fff" loading size={75} />
          </div>
        )}
      </div>
      <div className="cont">
        <h1>Current League Leaders</h1>
        <SearchPlayersStats
          injury={injury}
          user={user}
          poolInfo={poolInfo}
          DictUsers={DictUsers}
          playersIdToPoolerMap={playersIdToPoolerMap}
        />
      </div>
      {poolInfo.participants.includes(user?._id) ? (
        <>
          <FillSpotModal
            showFillSpotModal={showFillSpotModal}
            setShowFillSpotModal={setShowFillSpotModal}
            poolInfo={poolInfo}
            userModified={poolInfo.participants[userTabIndex]}
            setPoolUpdate={setPoolUpdate}
            user={user}
            fillSpotPosition={fillSpotPosition}
            userIndex={userIndex}
          />
          <RosterModificationModal
            showRosterModificationModal={showRosterModificationModal}
            setShowRosterModificationModal={setShowRosterModificationModal}
            poolInfo={poolInfo}
            userModified={poolInfo.participants[userTabIndex]}
            setPoolUpdate={setPoolUpdate}
            injury={injury}
            user={user}
          />
          <AddPlayerModal
            showAddPlayerModal={showAddPlayerModal}
            setShowAddPlayerModal={setShowAddPlayerModal}
            participant={poolInfo.participants[userTabIndex]}
            poolInfo={poolInfo}
            DictUsers={DictUsers}
            setPoolUpdate={setPoolUpdate}
            injury={injury}
            playersIdToPoolerMap={playersIdToPoolerMap}
            user={user}
          />
        </>
      ) : null}
    </div>
  );
}
