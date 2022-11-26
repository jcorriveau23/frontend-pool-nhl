import React, { useState, useEffect } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

// icons
import { RiTeamFill, RiInformationFill } from 'react-icons/ri';
import { BsCalendarDay, BsFillCalculatorFill, BsCashCoin, BsGraphUp } from 'react-icons/bs';
import { ImHammer, ImHistory } from 'react-icons/im';
import { FaExchangeAlt } from 'react-icons/fa';

// component
import DayLeaders from '../home_page/dailyLeaders';
import TradeCenter from './tradeCenter';
import PlayerLink from '../playerLink';
import PickList from './pickList';
import DailyRanking from './dailyRanking';
import DraftOrder from './draftOrder';
import NaviguateToday from './naviguateToday';
import User from '../user';
import RosterCapHit from './roster';
import TopSeasonPlayers from './topSeasonPlayers';
import PoolHistory from './poolHistory';

// modals
import FillSpot from '../../modals/FillSpot';
import RosterModificationModal from '../../modals/rosterModification';
import GraphStatsModal from '../../modals/graphStats';

// images
import { logos } from '../img/logos';
import liveGame from '../img/icons/live-game.png';

// css
import '../react-tabs.css';

export default function InProgressPool({
  user,
  DictUsers,
  poolInfo,
  injury,
  isUserParticipant,
  formatDate,
  todayFormatDate,
  gameStatus,
  setPoolUpdate,
  DictTeamAgainst,
}) {
  const [playersStats, setPlayersStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [playersIdToPoolerMap, setPlayersIdToPoolerMap] = useState(null);
  const [playerIdToPlayersDataMap, setPlayerIdToPlayersDataMap] = useState(null);
  const [showFillSpotModal, setShowFillSpotModal] = useState(false);
  const [fillSpotPosition, setFillSpotPosition] = useState('');
  const [showRosterModificationModal, setShowRosterModificationModal] = useState(false);
  const [showGraphStatsModal, setShowGraphStatsModal] = useState(false);
  const [selectedRosterPickIndex, setSelectedRosterPickIndex] = useState(0);
  const [cumulativeDailyTabIndex, setCumulativeDailyTabIndex] = useState(0);
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState(
    poolInfo.participants.findIndex(participant => participant === user._id.$oid)
  );
  const [tabSelectionParams, setTabSelectionParams] = useSearchParams();

  const find_last_cumulate = async fDate => {
    let daily_stats = null;
    const tempDate = new Date(fDate);

    let i = 200; // Will look into the past 200 days to find the last date from now.

    do {
      const fTempDate = tempDate.toISOString().slice(0, 10);
      daily_stats = poolInfo.context.score_by_day[fTempDate];

      tempDate.setDate(tempDate.getDate() - 1);
      i -= 1;
    } while (i > 0 && (!daily_stats || !daily_stats[poolInfo.participants[0]].cumulate));

    return daily_stats;
  };

  const calculate_pool_stats = async fDate => {
    const stats = {}; // contains players list per pooler and poolers total points
    const rank = []; // contains pooler total points
    const playersIdToPooler = {};
    const playersIdToPlayersData = {};

    let daily_stats = null;

    if (poolInfo.context.score_by_day && Object.keys(poolInfo.context.score_by_day).length > 0) {
      daily_stats = await find_last_cumulate(fDate);
    }

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      stats[participant] = {};

      stats[participant].forwards_total_goal = daily_stats ? daily_stats[participant].cumulate.G_F : 0;
      stats[participant].forwards_total_game = 0; // will be count during the for loop.
      stats[participant].forwards_total_assist = daily_stats ? daily_stats[participant].cumulate.A_F : 0;
      stats[participant].forwards_total_pts = daily_stats ? daily_stats[participant].cumulate.P_F : 0;
      stats[participant].forwards_total_hattrick = daily_stats ? daily_stats[participant].cumulate.HT_F : 0;
      stats[participant].forwards_total_shootout_goals = daily_stats ? daily_stats[participant].cumulate.SOG_F : 0;
      stats[participant].defenders_total_game = 0; // will be count during the for loop.
      stats[participant].defenders_total_goal = daily_stats ? daily_stats[participant].cumulate.G_D : 0;
      stats[participant].defenders_total_assist = daily_stats ? daily_stats[participant].cumulate.A_D : 0;
      stats[participant].defenders_total_hattrick = daily_stats ? daily_stats[participant].cumulate.HT_D : 0;
      stats[participant].defenders_total_pts = daily_stats ? daily_stats[participant].cumulate.P_D : 0;
      stats[participant].defenders_total_shootout_goals = daily_stats ? daily_stats[participant].cumulate.SOG_D : 0;
      stats[participant].goalies_total_game = 0; // will be count during the for loop.
      stats[participant].goalies_total_goal = daily_stats ? daily_stats[participant].cumulate.G_G : 0;
      stats[participant].goalies_total_assist = daily_stats ? daily_stats[participant].cumulate.A_G : 0;
      stats[participant].goalies_total_win = daily_stats ? daily_stats[participant].cumulate.W_G : 0;
      stats[participant].goalies_total_shutout = daily_stats ? daily_stats[participant].cumulate.SO_G : 0;
      stats[participant].goalies_total_OT = daily_stats ? daily_stats[participant].cumulate.OT_G : 0;
      stats[participant].goalies_total_pts = daily_stats ? daily_stats[participant].cumulate.P_G : 0;
      stats[participant].total_pts = daily_stats ? daily_stats[participant].cumulate.P : 0;

      stats[participant].chosen_forwards = [];
      stats[participant].chosen_defenders = [];
      stats[participant].chosen_goalies = [];
      stats[participant].chosen_reservists = [];

      // Create 2 HashMaps for each players that is included in this pool.
      // 1st Player-ID -> Pooler-owner
      // 2nd Player-ID -> Player-info

      // Forwards

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_forwards.length; j += 1) {
        const player = poolInfo.context.pooler_roster[participant].chosen_forwards[j];

        playersIdToPooler[player.id] = participant;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.HT = 0;
        player.SOG = 0;
        player.pool_points = 0;
        player.own = true;
        stats[participant].chosen_forwards.push(player);
      }

      // Defenders

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_defenders.length; j += 1) {
        const player = poolInfo.context.pooler_roster[participant].chosen_defenders[j];

        playersIdToPooler[player.id] = participant;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.HT = 0;
        player.SOG = 0;
        player.pool_points = 0;
        player.own = true;
        stats[participant].chosen_defenders.push(player);
      }

      // Goalies

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_goalies.length; j += 1) {
        const player = poolInfo.context.pooler_roster[participant].chosen_goalies[j];

        playersIdToPooler[player.id] = participant;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.W = 0;
        player.SO = 0;
        player.OT = 0;
        player.pool_points = 0;
        player.own = true;
        stats[participant].chosen_goalies.push(player);
      }

      // Reservists

      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_reservists.length; j += 1) {
        const player = poolInfo.context.pooler_roster[participant].chosen_reservists[j];
        player.own = false;

        playersIdToPooler[player.id] = participant;
        playersIdToPlayersData[player.id] = player;
      }
    }

    // Parse the list of all daily games information to get the stats of each players

    const startDate = new Date(poolInfo.season_start);
    const endDate = new Date(formatDate);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
          const participant = poolInfo.participants[i];

          // Forwards

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.F).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.F[key];

            if (player) {
              let index = stats[participant].chosen_forwards.findIndex(f => Number(f.id) === Number(key));

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  f => Number(f.id) === Number(key)
                );

                const newPlayer = {
                  id: key,
                  nb_game: 1,
                  G: player.G,
                  A: player.A,
                  HT: player.G >= 3 ? 1 : 0,
                  SOG: player.SOG ? player.SOG : 0,
                  own: false,
                  reservist: indexReservist > -1,
                };
                stats[participant].forwards_total_game += 1;
                index = stats[participant].chosen_forwards.push(newPlayer) - 1;
              } else {
                stats[participant].chosen_forwards[index].nb_game += 1;
                stats[participant].chosen_forwards[index].G += player.G;
                stats[participant].chosen_forwards[index].A += player.A;
                stats[participant].chosen_forwards[index].HT += player.G >= 3 ? 1 : 0; //  hattrick
                stats[participant].chosen_forwards[index].SOG += player.SOG ? player.SOG : 0; // Shootout goals
                stats[participant].forwards_total_game += 1;
              }
              // total pool points
              stats[participant].chosen_forwards[index].pool_points =
                stats[participant].chosen_forwards[index].G * poolInfo.forward_pts_goals +
                stats[participant].chosen_forwards[index].A * poolInfo.forward_pts_assists +
                stats[participant].chosen_forwards[index].HT * poolInfo.forward_pts_hattricks +
                stats[participant].chosen_forwards[index].SOG * poolInfo.forward_pts_shootout_goals;
            }

            return null;
          });

          // Defenders

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.D).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.D[key];

            if (player) {
              let index = stats[participant].chosen_defenders.findIndex(d => Number(d.id) === Number(key));

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  d => Number(d.id) === Number(key)
                );

                const newPlayer = {
                  id: key,
                  nb_game: 1,
                  G: player.G,
                  A: player.A,
                  HT: player.HT >= 3 ? 1 : 0,
                  SOG: player.SOG ? player.SOG : 0,
                  own: false,
                  reservist: indexReservist > -1,
                };
                stats[participant].defenders_total_game += 1;
                index = stats[participant].chosen_defenders.push(newPlayer) - 1;
              } else {
                stats[participant].chosen_defenders[index].nb_game += 1;
                stats[participant].chosen_defenders[index].G += player.G;
                stats[participant].chosen_defenders[index].A += player.A;
                stats[participant].chosen_defenders[index].HT += player.G >= 3 ? 1 : 0; // hattricks
                stats[participant].chosen_defenders[index].SOG += player.SOG ? player.SOG : 0; // shootout goals
                stats[participant].defenders_total_game += 1;
              }
              // total pool points
              stats[participant].chosen_defenders[index].pool_points =
                stats[participant].chosen_defenders[index].G * poolInfo.defender_pts_goals +
                stats[participant].chosen_defenders[index].A * poolInfo.defender_pts_assists +
                stats[participant].chosen_defenders[index].HT * poolInfo.defender_pts_hattricks +
                stats[participant].chosen_defenders[index].SOG * poolInfo.defender_pts_shootout_goals;
            }

            return null;
          });

          // Goalies

          Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.G).map(key => {
            const player = poolInfo.context.score_by_day[jDate][participant].roster.G[key];

            if (player) {
              let index = stats[participant].chosen_goalies.findIndex(g => Number(g.id) === Number(key));

              if (index === -1) {
                const indexReservist = poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(
                  g => Number(g.id) === Number(key)
                );
                const newPlayer = {
                  id: key,
                  nb_game: 1,
                  G: player.G,
                  A: player.A,
                  W: player.W,
                  SO: player.SO,
                  OT: player.OT,
                  own: false,
                  reservist: indexReservist > -1,
                };
                stats[participant].goalies_total_game += 1;
                index = stats[participant].chosen_goalies.push(newPlayer) - 1;
              } else {
                stats[participant].chosen_goalies[index].nb_game += 1;
                stats[participant].chosen_goalies[index].G += player.G;
                stats[participant].chosen_goalies[index].A += player.A;
                stats[participant].chosen_goalies[index].W += player.W;
                stats[participant].chosen_goalies[index].SO += player.SO;
                stats[participant].chosen_goalies[index].OT += player.OT;
                stats[participant].goalies_total_game += 1;
              }

              // total pool points
              stats[participant].chosen_goalies[index].pool_points =
                stats[participant].chosen_goalies[index].G * poolInfo.goalies_pts_goals +
                stats[participant].chosen_goalies[index].A * poolInfo.goalies_pts_assists +
                stats[participant].chosen_goalies[index].W * poolInfo.goalies_pts_wins +
                stats[participant].chosen_goalies[index].SO * poolInfo.goalies_pts_shutouts +
                stats[participant].chosen_goalies[index].OT * poolInfo.goalies_pts_overtimes;
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
      for (let j = 0; j < stats[participant].chosen_forwards.length; j += 1) {
        stats[participant].forwards_own += stats[participant].chosen_forwards[j].own ? 1 : 0;
      }

      stats[participant].defenders_own = 0;
      for (let j = 0; j < stats[participant].chosen_defenders.length; j += 1) {
        stats[participant].defenders_own += stats[participant].chosen_defenders[j].own ? 1 : 0;
      }

      stats[participant].goalies_own = 0;
      for (let j = 0; j < stats[participant].chosen_goalies.length; j += 1) {
        stats[participant].goalies_own += stats[participant].chosen_goalies[j].own ? 1 : 0;
      }

      const pooler_global_stats = {
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
        total_pts: stats[participant].total_pts,
      };

      rank.push(pooler_global_stats);
    }

    setRanking(rank);
    setPlayersStats(stats);
    setPlayersIdToPoolerMap(playersIdToPooler);
    setPlayerIdToPlayersDataMap(playersIdToPlayersData);
  };

  useEffect(() => {
    console.log('in progress');
    if (formatDate) {
      calculate_pool_stats(formatDate);
    }
    const mainTab = tabSelectionParams.get('mainTab');
    const userTab = tabSelectionParams.get('userTab');

    if (mainTab) setCumulativeDailyTabIndex(Number(mainTab));
    if (userTab) setSelectedParticipantIndex(Number(userTab));
  }, [formatDate, poolInfo.context.score_by_day]);

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
        <tr>
          <td>{i + 1}</td>
          <td colSpan={2}>
            {pooler === user._id.$oid ? (
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

  const render_inactive_players_tooltip = player =>
    player.reservist ? (
      <>
        <a data-tip={`${playerIdToPlayersDataMap[player.id].name} is a reservist.`}>
          <RiInformationFill size={30} color="yellow" />
        </a>
        <ReactTooltip className="tooltip" padding="8px" />
      </>
    ) : (
      <>
        <a data-tip={`${playerIdToPlayersDataMap[player.id].name} has been traded.`}>
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
              style={{ backgroundColor: player.own ? null : render_not_own_player_color(player.reservist) }}
            >
              <td>{i + 1}</td>
              <td>{player.own ? <RiTeamFill size={25} /> : render_inactive_players_tooltip(player)}</td>
              <td colSpan={2}>
                <PlayerLink name={playerIdToPlayersDataMap[player.id].name} id={player.id} injury={injury} />
              </td>
              <td>
                <img src={logos[playerIdToPlayersDataMap[player.id].team]} alt="" width="40" height="40" />
              </td>
              <td>{player.nb_game}</td>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.G + player.A}</td>
              <td>{player.HT}</td>
              <td>{player.SOG}</td>
              <td>
                <b style={{ color: '#a20' }}>{player.pool_points}</b>
              </td>
              <td>
                {player.nb_game ? Math.round((player.pool_points / player.nb_game + Number.EPSILON) * 100) / 100 : 0.0}
              </td>
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
              style={{ backgroundColor: player.own ? null : render_not_own_player_color(player.reservist) }}
            >
              <td>{i + 1}</td>
              <td>{player.own ? <RiTeamFill size={25} /> : render_inactive_players_tooltip(player)}</td>
              <td colSpan={2}>
                <PlayerLink name={playerIdToPlayersDataMap[player.id].name} id={player.id} injury={injury} />
              </td>
              <td>
                <img src={logos[playerIdToPlayersDataMap[player.id].team]} alt="" width="40" height="40" />
              </td>
              <td>{player.nb_game}</td>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.W}</td>
              <td>{player.SO}</td>
              <td>{player.OT}</td>
              <td>
                <b style={{ color: '#a20' }}>{player.pool_points}</b>
              </td>
              <td>
                {player.nb_game ? Math.round((player.pool_points / player.nb_game + Number.EPSILON) * 100) / 100 : 0.0}
              </td>
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
    poolInfo.context.pooler_roster[pooler].chosen_reservists.map((player, i) => (
      <tr key={player.name}>
        <td>{i + 1}</td>
        <td>
          <RiTeamFill size={25} />
        </td>
        <td colSpan={9}>
          <PlayerLink name={playerIdToPlayersDataMap[player.id].name} id={player.id} injury={injury} />
        </td>
        <td>
          <img src={logos[playerIdToPlayersDataMap[player.id].team]} alt="" width="40" height="40" />
        </td>
        <td>{player.position}</td>
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

  const setUserTab = index => {
    setTabSelectionParams({ mainTab: cumulativeDailyTabIndex, userTab: index });

    setSelectedParticipantIndex(index);
  };

  const select_participant = _participant => {
    const index = poolInfo.participants.findIndex(participant => participant === _participant);
    setUserTab(index);
  };

  const render_tabs_roster_stats = () => (
    <Tabs selectedIndex={selectedParticipantIndex} onSelect={index => setUserTab(index)} forceRenderTabPanel>
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
            <Tabs
              selectedIndex={selectedRosterPickIndex}
              onSelect={index => setSelectedRosterPickIndex(index)}
              forceRenderTabPanel
            >
              <TabList>
                <Tab>Roster</Tab>
                <Tab>Picks</Tab>
              </TabList>
              <TabPanel>
                {pooler === user._id.$oid ? (
                  <button className="base-button" type="button" onClick={() => setShowRosterModificationModal(true)}>
                    Modify Roster
                  </button>
                ) : (
                  '-'
                )}
                <table className="content-table-no-min">
                  <thead>
                    <NaviguateToday
                      formatDate={formatDate}
                      todayFormatDate={todayFormatDate}
                      msg="Points Cumulate"
                      colSpan={13}
                    />
                    <tr>
                      <th colSpan={13}>
                        Forwards ({playersStats[pooler].forwards_own}/{poolInfo.number_forwards})
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
                      poolInfo.number_forwards,
                      'F'
                    )}
                  </tbody>
                  <thead>
                    <tr>
                      <th colSpan={13}>
                        Defenders ({playersStats[pooler].defenders_own}/{poolInfo.number_defenders})
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
                      poolInfo.number_defenders,
                      'D'
                    )}
                  </tbody>
                  <thead>
                    <tr>
                      <th colSpan={13}>
                        Goalies ({playersStats[pooler].goalies_own}/{poolInfo.number_goalies})
                      </th>
                    </tr>
                    {render_header_goalies()}
                  </thead>
                  <tbody>{render_goalies_stats(pooler, poolInfo.number_goalies)}</tbody>
                  <thead>
                    <tr>
                      <th colSpan={13}>Reservists</th>
                    </tr>
                    {render_header_reservists()}
                  </thead>
                  <tbody>{render_reservists(pooler)}</tbody>
                </table>
              </TabPanel>
              <TabPanel>
                <PickList tradablePicks={poolInfo.context.tradable_picks} participant={pooler} DictUsers={DictUsers} />
              </TabPanel>
            </Tabs>
          </div>
        </TabPanel>
      ))}
    </Tabs>
  );

  const setMainTab = index => {
    setTabSelectionParams({ mainTab: index, userTab: selectedParticipantIndex });

    setCumulativeDailyTabIndex(index);
  };

  const render_tabs_pool_rank = () =>
    ranking
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
            poolInfo.participants[selectedParticipantIndex] === rank.participant
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
      ));

  if (playersStats && ranking && playerIdToPlayersDataMap && gameStatus) {
    return (
      <div className="min-width">
        <div className="cont">
          <Tabs selectedIndex={cumulativeDailyTabIndex} onSelect={index => setMainTab(index)}>
            <TabList>
              <Tab>
                <BsFillCalculatorFill size={30} />
                Cumulative
              </Tab>
              <Tab>
                {gameStatus === 'Live' ? (
                  <img src={liveGame} alt="" width="40" height="40" />
                ) : (
                  <BsCalendarDay size={30} />
                )}
                Daily
              </Tab>
              <Tab>
                <BsCashCoin size={30} />
                Cap Hit
              </Tab>
              <Tab>
                <FaExchangeAlt size={30} />
                Trade Center
              </Tab>
              <Tab>
                <ImHistory size={30} />
                History
              </Tab>
              <Tab>
                <ImHammer size={30} />
                Draft
              </Tab>
            </TabList>
            <TabPanel>
              <div className="half-cont">
                <button
                  className="base-button"
                  onClick={() => setShowGraphStatsModal(!showGraphStatsModal)}
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
                {showGraphStatsModal ? <GraphStatsModal poolInfo={poolInfo} DictUsers={DictUsers} /> : null}
                <table className="content-table-no-min">
                  <thead>
                    <NaviguateToday
                      formatDate={formatDate}
                      todayFormatDate={todayFormatDate}
                      msg="Cumulative Ranking"
                      colSpan={26}
                    />
                    <tr>
                      <th rowSpan={2}>Rank</th>
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
                  <tbody>{render_tabs_pool_rank()}</tbody>
                </table>
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
                  poolInfo={poolInfo}
                  playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                  selectedParticipantIndex={selectedParticipantIndex}
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
                  isPoolContext
                />
              </div>
            </TabPanel>
            <TabPanel>
              <RosterCapHit
                poolInfo={poolInfo}
                selectedParticipantIndex={selectedParticipantIndex}
                setUserTab={setUserTab}
                select_participant={select_participant}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
              />
            </TabPanel>
            <TabPanel>
              <TradeCenter
                poolInfo={poolInfo}
                setPoolUpdate={setPoolUpdate}
                playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
                isUserParticipant={isUserParticipant}
              />
            </TabPanel>
            <TabPanel>
              <PoolHistory
                poolInfo={poolInfo}
                playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
                isUserParticipant={isUserParticipant}
              />
            </TabPanel>
            <TabPanel>
              <DraftOrder
                poolInfo={poolInfo}
                players_name_drafted={poolInfo.context.players_name_drafted}
                participants={poolInfo.participants}
                final_rank={poolInfo.final_rank}
                tradable_picks={poolInfo.context.past_tradable_picks}
                nb_players={
                  poolInfo.number_forwards +
                  poolInfo.number_defenders +
                  poolInfo.number_goalies +
                  poolInfo.number_reservists
                }
                nb_protected_players={poolInfo.next_season_number_players_protected}
                injury={injury}
                DictUsers={DictUsers}
                user={user}
              />
            </TabPanel>
          </Tabs>
          <TopSeasonPlayers
            user={user}
            injury={injury}
            playersIdToPoolerMap={playersIdToPoolerMap}
            playerIdToPlayersDataMap={playerIdToPlayersDataMap}
            DictUsers={DictUsers}
          />
        </div>
        {isUserParticipant ? (
          <>
            <FillSpot
              showFillSpotModal={showFillSpotModal}
              setShowFillSpotModal={setShowFillSpotModal}
              poolInfo={poolInfo}
              setPoolUpdate={setPoolUpdate}
              user={user}
              fillSpotPosition={fillSpotPosition}
              isUserParticipant={isUserParticipant}
            />
            <RosterModificationModal
              showRosterModificationModal={showRosterModificationModal}
              setShowRosterModificationModal={setShowRosterModificationModal}
              poolInfo={poolInfo}
              setPoolUpdate={setPoolUpdate}
              injury={injury}
              user={user}
            />
          </>
        ) : null}
      </div>
    );
  }
  return (
    <div className="cont">
      <h1>Processing pool informations...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

InProgressPool.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
  DictUsers: PropTypes.shape({}).isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    context: PropTypes.arrayOf(
      PropTypes.shape({
        chosen_forwards: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_defenders: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_goalies: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_reservists: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
      }).isRequired
    ).isRequired,
    forward_pts_goals: PropTypes.number.isRequired,
    forward_pts_assists: PropTypes.number.isRequired,
    forward_pts_hattricks: PropTypes.number.isRequired,
    defender_pts_goals: PropTypes.number.isRequired,
    defender_pts_assists: PropTypes.number.isRequired,
    defender_pts_hattricks: PropTypes.number.isRequired,
    goalies_pts_goals: PropTypes.number.isRequired,
    goalies_pts_assists: PropTypes.number.isRequired,
    goalies_pts_wins: PropTypes.number.isRequired,
    goalies_pts_shutouts: PropTypes.number.isRequired,
  }).isRequired,
};
