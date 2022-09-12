import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// icons
import { RiTeamFill } from 'react-icons/ri';
import { BsCalendarDay, BsFillCalculatorFill, BsCashCoin } from 'react-icons/bs';

// component
import DayLeaders from '../home_page/dailyLeaders';
import TradeCenter from './tradeCenter';
import PlayerLink from '../playerLink';
import PickList from './pickList';
import DailyRanking from './dailyRanking';

// modals
import FillSpot from '../../modals/FillSpot';
import RosterModificationModal from '../../modals/rosterModification';

// images
import { logos } from '../img/logos';

// css
import '../react-tabs.css';

export default function InProgressPool({
  user,
  DictUsers,
  poolInfo,
  setPoolInfo,
  injury,
  isUserParticipant,
  formatDate,
  date,
  setDate,
}) {
  const [playersStats, setPlayersStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [playersIdToPoolerMap, setPlayersIdToPoolerMap] = useState(null);
  const [playerIdToPlayersDataMap, setPlayerIdToPlayersDataMap] = useState(null);
  const [todayFormatDate] = useState(new Date().toISOString().slice(0, 10));
  const [showFillSpotModal, setShowFillSpotModal] = useState(false);
  const [fillSpotPosition, setFillSpotPosition] = useState('');
  const [showRosterModificationModal, setShowRosterModificationModal] = useState(false);
  const [selectedRosterPickIndex, setSelectedRosterPickIndex] = useState(0);

  const sort_by_player_member = async (playerMember, array) => {
    // TODO: try to simplified this into no if at all
    if (playerMember !== 'name' && playerMember !== 'team') array.sort((a, b) => b[playerMember] - a[playerMember]);
    else {
      array.sort((a, b) => {
        if (a[playerMember] < b[playerMember]) {
          return -1;
        }
        if (a[playerMember] > b[playerMember]) {
          return 1;
        }
        return 0;
      });
    }

    return array;
  };

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
    let rank = []; // contains pooler total points
    const playersIdToPooler = {};
    const playersIdToPlayersData = {};

    let daily_stats = null;

    if (Object.keys(poolInfo.context.score_by_day).length > 0) {
      daily_stats = await find_last_cumulate(fDate);
    } // TODO make this date variable

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      stats[participant] = {};

      stats[participant].forwards_total_goal =
        daily_stats && daily_stats[participant].cumulate ? daily_stats[participant].cumulate.G_F : 0;
      stats[participant].forwards_total_game = 0; // will be count during the for loop.
      stats[participant].forwards_total_assist = daily_stats ? daily_stats[participant].cumulate.A_F : 0;
      stats[participant].forwards_total_pts = daily_stats ? daily_stats[participant].cumulate.P_F : 0;
      stats[participant].forwards_total_hattrick = daily_stats ? daily_stats[participant].cumulate.HT_F : 0;
      stats[participant].defenders_total_game = 0; // will be count during the for loop.
      stats[participant].defenders_total_goal = daily_stats ? daily_stats[participant].cumulate.G_D : 0;
      stats[participant].defenders_total_assist = daily_stats ? daily_stats[participant].cumulate.A_D : 0;
      stats[participant].defenders_total_hattrick = daily_stats ? daily_stats[participant].cumulate.HT_D : 0;
      stats[participant].defenders_total_pts = daily_stats ? daily_stats[participant].cumulate.P_D : 0;
      stats[participant].goalies_total_game = 0; // will be count during the for loop.
      stats[participant].goalies_total_goal = daily_stats ? daily_stats[participant].cumulate.G_G : 0;
      stats[participant].goalies_total_assist = daily_stats ? daily_stats[participant].cumulate.A_G : 0;
      stats[participant].goalies_total_win = daily_stats ? daily_stats[participant].cumulate.W_G : 0;
      stats[participant].goalies_total_shutout = daily_stats ? daily_stats[participant].cumulate.SO_G : 0;
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

    const startDate = new Date(2021, 9, 13);
    const endDate = new Date(formatDate); // today TODO: change this to match the date selected with the date picker to see the roster and the ranking on each date.

    endDate.setDate(endDate.getDate() + 1);

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        if (!poolInfo.context.score_by_day[jDate]) {
          continue;
        }

        const participant = poolInfo.participants[i];

        // Forwards

        Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.F).map(key => {
          const player = poolInfo.context.score_by_day[jDate][participant].roster.F[key];

          if (player) {
            const index = stats[participant].chosen_forwards.findIndex(f => Number(f.id) === Number(key));

            if (index === -1) {
              const newPlayer = {
                id: key,
                nb_game: 1,
                G: player.G,
                A: player.A,
                HT: player.G >= 3 ? 1 : 0,
                own: false,
              };
              stats[participant].forwards_total_game += 1;
              stats[participant].chosen_forwards.push(newPlayer);
            } else {
              stats[participant].chosen_forwards[index].G += player.G;
              stats[participant].chosen_forwards[index].A += player.A;
              if (player.G >= 3) {
                stats[participant].chosen_forwards[index].HT += 1;
              }
              stats[participant].chosen_forwards[index].nb_game += 1;
              stats[participant].forwards_total_game += 1;
              // total pool points
              stats[participant].chosen_forwards[index].pool_points =
                stats[participant].chosen_forwards[index].G * poolInfo.forward_pts_goals +
                stats[participant].chosen_forwards[index].A * poolInfo.forward_pts_assists +
                stats[participant].chosen_forwards[index].HT * poolInfo.forward_pts_hattricks;
            }
          }
        });

        // Defenders

        Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.D).map(key => {
          const player = poolInfo.context.score_by_day[jDate][participant].roster.D[key];

          if (player) {
            const index = stats[participant].chosen_defenders.findIndex(d => Number(d.id) === Number(key));

            if (index === -1) {
              const newPlayer = {
                id: key,
                nb_game: 1,
                G: player.G,
                A: player.A,
                HT: player.G >= 3 ? 1 : 0,
                own: false,
              };
              stats[participant].defenders_total_game += 1;
              stats[participant].chosen_defenders.push(newPlayer);
            } else {
              stats[participant].chosen_defenders[index].G += player.G;
              stats[participant].chosen_defenders[index].A += player.A;
              if (player.G >= 3) {
                stats[participant].chosen_defenders[index].HT += 1;
              }
              stats[participant].chosen_defenders[index].nb_game += 1;
              stats[participant].defenders_total_game += 1;
              // total pool points
              stats[participant].chosen_defenders[index].pool_points =
                stats[participant].chosen_defenders[index].G * poolInfo.defender_pts_goals +
                stats[participant].chosen_defenders[index].A * poolInfo.defender_pts_assists +
                stats[participant].chosen_defenders[index].HT * poolInfo.defender_pts_hattricks;
            }
          }
        });

        // Goalies

        Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.G).map(key => {
          const player = poolInfo.context.score_by_day[jDate][participant].roster.G[key];

          if (player) {
            const index = stats[participant].chosen_goalies.findIndex(g => Number(g.id) === Number(key));

            if (index === -1) {
              const newPlayer = {
                id: key,
                nb_game: 1,
                G: player.G,
                A: player.A,
                W: player.W,
                SO: player.SO,
                own: false,
              };
              stats[participant].goalies_total_game += 1;
              stats[participant].chosen_goalies.push(newPlayer);
            } else {
              stats[participant].chosen_goalies[index].G += player.G;
              stats[participant].chosen_goalies[index].A += player.A;
              stats[participant].chosen_goalies[index].W += player.W;
              stats[participant].chosen_goalies[index].SO += player.SO;
              stats[participant].chosen_goalies[index].nb_game += 1;
              stats[participant].goalies_total_game += 1;
              // total pool points
              stats[participant].chosen_goalies[index].pool_points =
                stats[participant].chosen_goalies[index].G * poolInfo.goalies_pts_goals +
                stats[participant].chosen_goalies[index].A * poolInfo.goalies_pts_assists +
                stats[participant].chosen_goalies[index].W * poolInfo.goalies_pts_wins +
                stats[participant].chosen_goalies[index].SO * poolInfo.goalies_pts_shutouts;
            }
          }
        });
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
        forwards_total_pts: stats[participant].forwards_total_pts,
        // Defenders global stats
        defenders_total_game: stats[participant].defenders_total_game,
        defenders_total_goal: stats[participant].defenders_total_goal,
        defenders_total_assist: stats[participant].defenders_total_assist,
        defenders_total_hattrick: stats[participant].defenders_total_hattrick,
        defenders_total_pts: stats[participant].defenders_total_pts,
        // goalies global stats
        goalies_total_game: stats[participant].goalies_total_game,
        goalies_total_goal: stats[participant].goalies_total_goal,
        goalies_total_assist: stats[participant].goalies_total_assist,
        goalies_total_win: stats[participant].goalies_total_win,
        goalies_total_shutout: stats[participant].goalies_total_shutout,
        goalies_total_pts: stats[participant].goalies_total_pts,
        total_game:
          stats[participant].forwards_total_game +
          stats[participant].defenders_total_game +
          stats[participant].goalies_total_game,
        total_pts: stats[participant].total_pts,
      };

      rank.push(pooler_global_stats);
    }

    rank = await sort_by_player_member('total_pts', rank);

    setRanking(rank);
    setPlayersStats(stats);
    setPlayersIdToPoolerMap(playersIdToPooler);
    setPlayerIdToPlayersDataMap(playersIdToPlayersData);
  };

  useEffect(() => {
    calculate_pool_stats(formatDate);
  }, [poolInfo, formatDate]);

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
          <td>
            {pooler === user._id.$oid ? (
              <button className="base-button" type="button" onClick={() => open_fill_spot_modal(position)}>
                Fill Spot
              </button>
            ) : (
              '-'
            )}
          </td>
          <td colSpan={8}>Empty spot</td>
        </tr>
      );
    }

    return emptyRows;
  };

  const render_skater_stats = (
    pooler,
    own_key,
    chosen_player_key,
    player_total_pts_key,
    player_total_goal_key,
    player_total_assist_key,
    player_total_hattrick_key,
    max,
    position
  ) => {
    const emptyRows = get_empty_rows(playersStats[pooler][own_key], max, pooler, position);
    return (
      <>
        {playersStats[pooler][chosen_player_key]
          .sort((p1, p2) => p2.pool_points - p1.pool_points)
          .map((player, i) => (
            <tr key={player.id}>
              <td>{i + 1}</td>
              <td>{player.own ? <RiTeamFill size={25} /> : null}</td>
              <td>
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
              <td>
                <b>{player.pool_points}</b>
              </td>
            </tr>
          ))}
        {emptyRows.map(row => row)}
        <tr>
          <th>total</th>
          <th> - </th>
          <th> - </th>
          <th> - </th>
          <th>
            {position === 'F' ? playersStats[pooler].forwards_total_game : playersStats[pooler].defenders_total_game}
          </th>
          <th>{playersStats[pooler][player_total_goal_key]}</th>
          <th>{playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_goal_key] + playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_hattrick_key]}</th>
          <th>
            <b>{playersStats[pooler][player_total_pts_key]}</b>
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
            <tr key={player.id}>
              <td>{i + 1}</td>
              <td>{player.own ? <RiTeamFill size={25} /> : null}</td>
              <td>
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
              <td>
                <b>{player.pool_points}</b>
              </td>
            </tr>
          ))}
        {emptyRows.map(row => row)}
        <tr>
          <th>total</th>
          <th> - </th>
          <th> - </th>
          <th> - </th>
          <th>{playersStats[pooler].goalies_total_game}</th>
          <th>{playersStats[pooler].goalies_total_goal}</th>
          <th>{playersStats[pooler].goalies_total_assist}</th>
          <th>{playersStats[pooler].goalies_total_win}</th>
          <th>{playersStats[pooler].goalies_total_shutout}</th>
          <th>
            <b>{playersStats[pooler].goalies_total_pts}</b>
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
        <td colSpan={6}>
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
      <th>Own</th>
      <th>Name</th>
      <th>Team</th>
      <th>GP</th>
      <th>Goal</th>
      <th>Assist</th>
      <th>Pts</th>
      <th>Hat Trick</th>
      <th>Pts (pool)</th>
    </tr>
  );

  const render_header_goalies = () => (
    <tr>
      <th>#</th>
      <th>Own</th>
      <th>Name</th>
      <th>Team</th>
      <th>GP</th>
      <th>Goal</th>
      <th>Assist</th>
      <th>Win</th>
      <th>Shutout</th>
      <th>Pts (pool)</th>
    </tr>
  );

  const render_header_reservists = () => (
    <tr>
      <th>#</th>
      <th>Own</th>
      <th colSpan={6}>Name</th>
      <th>Team</th>
      <th>Position</th>
    </tr>
  );

  const render_tabs_roster_stats = () => {
    const poolers = poolInfo.participants;

    if (isUserParticipant) {
      // replace pooler user name to be first
      const i = poolers.findIndex(participant => participant === user._id.$oid);
      poolers.splice(i, 1);
      poolers.splice(0, 0, user._id.$oid);
    }

    return (
      <Tabs>
        <TabList>
          {poolers.map(pooler => (
            <Tab key={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</Tab>
          ))}
        </TabList>
        {poolers.map(pooler => (
          <TabPanel key={pooler}>
            <div className="half-cont">
              <Tabs selectedIndex={selectedRosterPickIndex} onSelect={index => setSelectedRosterPickIndex(index)}>
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
                      <tr>
                        {formatDate === todayFormatDate ? (
                          <th colSpan={10}>Today&apos;s {DictUsers ? DictUsers[pooler] : pooler}&apos; roster</th>
                        ) : (
                          <th colSpan={10}>
                            {DictUsers ? DictUsers[pooler] : pooler}&apos;s roster ({formatDate})
                            <button className="base-button" onClick={() => setDate(new Date())} type="button">
                              See today&apos;s stats
                            </button>
                          </th>
                        )}
                      </tr>
                      <tr>
                        <th colSpan={10}>
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
                        poolInfo.number_forwards,
                        'F'
                      )}
                    </tbody>
                    <thead>
                      <tr>
                        <th colSpan={10}>
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
                        poolInfo.number_defenders,
                        'D'
                      )}
                    </tbody>
                    <thead>
                      <tr>
                        <th colSpan={10}>
                          Goalies ({playersStats[pooler].goalies_own}/{poolInfo.number_goalies})
                        </th>
                      </tr>
                      {render_header_goalies()}
                    </thead>
                    <tbody>{render_goalies_stats(pooler, poolInfo.number_goalies)}</tbody>
                    <thead>
                      <tr>
                        <th colSpan={10}>Reservists</th>
                      </tr>
                      {render_header_reservists()}
                    </thead>
                    <tbody>{render_reservists(pooler)}</tbody>
                  </table>
                </TabPanel>
                <TabPanel>
                  <PickList
                    tradablePicks={poolInfo.context.tradable_picks}
                    participant={pooler}
                    DictUsers={DictUsers}
                  />
                </TabPanel>
              </Tabs>
            </div>
          </TabPanel>
        ))}
      </Tabs>
    );
  };

  const render_tabs_pool_rank = () =>
    ranking.map((pooler_stats, i) => (
      <tr key={pooler_stats.name}>
        <td>{i + 1}</td>
        <td>{DictUsers ? DictUsers[pooler_stats.participant] : pooler_stats.participant}</td>
        <td>{pooler_stats.forwards_total_game}</td>
        <td>{pooler_stats.forwards_total_goal}</td>
        <td>{pooler_stats.forwards_total_assist}</td>
        <td>{pooler_stats.forwards_total_hattrick}</td>
        <td>
          <b>{pooler_stats.forwards_total_pts}</b>
        </td>
        <td>{pooler_stats.defenders_total_game}</td>
        <td>{pooler_stats.defenders_total_goal}</td>
        <td>{pooler_stats.defenders_total_assist}</td>
        <td>{pooler_stats.defenders_total_hattrick}</td>
        <td>
          <b>{pooler_stats.defenders_total_pts}</b>
        </td>
        <td>{pooler_stats.goalies_total_game}</td>
        <td>{pooler_stats.goalies_total_goal}</td>
        <td>{pooler_stats.goalies_total_assist}</td>
        <td>{pooler_stats.goalies_total_win}</td>
        <td>{pooler_stats.goalies_total_shutout}</td>
        <td>
          <b>{pooler_stats.goalies_total_pts}</b>
        </td>
        <td>{pooler_stats.total_game}</td>
        <td>
          <b>{pooler_stats.total_pts}</b>
        </td>
      </tr>
    ));

  if (playersStats && ranking && playerIdToPlayersDataMap) {
    return (
      <div className="min-width">
        <div className="cont">
          <Tabs>
            <TabList>
              <Tab>
                <BsFillCalculatorFill size={30} />
                Cumulative
              </Tab>
              <Tab>
                <BsCalendarDay size={30} />
                Daily
              </Tab>
              <Tab>
                <BsCashCoin size={30} />
                Trade Center
              </Tab>
            </TabList>
            <TabPanel>
              <div className="half-cont">
                <table className="content-table-no-min">
                  <thead>
                    <tr>
                      {formatDate === todayFormatDate ? (
                        <th colSpan={22}>Today Cumulative ranking</th>
                      ) : (
                        <th colSpan={22}>
                          Cumulative ranking ({formatDate})
                          <button className="base-button" onClick={() => setDate(new Date())} type="button">
                            See today&apos;s stats
                          </button>
                        </th>
                      )}
                    </tr>
                    <tr>
                      <th rowSpan={2}>Rank</th>
                      <th rowSpan={2}>Pooler</th>
                      <th colSpan={5}>Forwards</th>
                      <th colSpan={5}>Defenders</th>
                      <th colSpan={6}>Goalies</th>
                      <th colSpan={2}>Total</th>
                    </tr>
                    <tr>
                      <th>GP</th>
                      <th>G</th>
                      <th>A</th>
                      <th>HT</th>
                      <th>PTS</th>
                      <th>GP</th>
                      <th>G</th>
                      <th>A</th>
                      <th>HT</th>
                      <th>PTS</th>
                      <th>GP</th>
                      <th>G</th>
                      <th>A</th>
                      <th>W</th>
                      <th>SO</th>
                      <th>PTS</th>
                      <th>GP</th>
                      <th>PTS</th>
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
                  setDate={setDate}
                  formatDate={formatDate}
                  todayFormatDate={todayFormatDate}
                  poolInfo={poolInfo}
                  isUserParticipant={isUserParticipant}
                  playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                  injury={injury}
                  user={user}
                  DictUsers={DictUsers}
                />
                <DayLeaders
                  formatDate={formatDate}
                  playersIdToPoolerMap={playersIdToPoolerMap}
                  user={user}
                  DictUsers={DictUsers}
                  injury={injury}
                />
              </div>
            </TabPanel>
            <TabPanel>
              <TradeCenter
                poolInfo={poolInfo}
                setPoolInfo={setPoolInfo}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
                isUserParticipant={isUserParticipant}
              />
            </TabPanel>
          </Tabs>
        </div>
        {isUserParticipant ? (
          <>
            <FillSpot
              showFillSpotModal={showFillSpotModal}
              setShowFillSpotModal={setShowFillSpotModal}
              poolInfo={poolInfo}
              setPoolInfo={setPoolInfo}
              user={user}
              fillSpotPosition={fillSpotPosition}
              isUserParticipant={isUserParticipant}
            />
            <RosterModificationModal
              showRosterModificationModal={showRosterModificationModal}
              setShowRosterModificationModal={setShowRosterModificationModal}
              poolInfo={poolInfo}
              setPoolInfo={setPoolInfo}
              injury={injury}
              user={user}
            />
          </>
        ) : null}
      </div>
    );
  }
  return (
    <div>
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
