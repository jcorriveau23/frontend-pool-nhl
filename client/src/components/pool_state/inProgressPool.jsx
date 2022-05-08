import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// component
import DayLeaders from '../home_page/dailyLeaders';
import TradeCenter from './tradeCenter';

// modals
import FillSpot from '../../modals/FillSpot';

// images
import { logos } from '../img/logos';

// css
import '../react-tabs.css';

export default function InProgressPool({ user, DictUsers, poolName, poolInfo, setPoolInfo }) {
  const [playersStats, setPlayersStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [playersToPoolerMap, setPlayersToPoolerMap] = useState(null);
  const [formatDate, setFormatDate] = useState('');
  const [showFillSpotModal, setShowFillSpotModal] = useState(false);
  const [fillSpotPosition, setFillSpotPosition] = useState('');

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

  const calculate_pool_stats = async players_stats => {
    const stats = {}; // contains players list per pooler and poolers total points
    let rank = []; // contains pooler total points
    const playersToPooler = {};

    // TODO create a mapping of all players in the pool with the users that own it to be able to display
    // the top scorer of last night with the pooler name that own it. store that map in anoter state. Use the current for loops.

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const pooler = poolInfo.participants[i];

      stats[pooler] = {};

      stats[pooler].forwards_total_pts = 0;
      stats[pooler].defenders_total_pts = 0;
      stats[pooler].goalies_total_pts = 0;
      stats[pooler].reservists_total_pts = 0;

      // Forwards

      stats[pooler].chosen_forward = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_forward.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_forward[j].name);

        player.pool_points =
          poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists; // + hat trick
        stats[pooler].forwards_total_pts +=
          poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists;

        stats[pooler].chosen_forward.push(player);
        playersToPooler[player.id] = pooler;
      }

      // Defenders

      stats[pooler].chosen_defender = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_defender.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_defender[j].name);

        player.pool_points =
          poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick
        stats[pooler].defenders_total_pts +=
          poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick

        stats[pooler].chosen_defender.push(player);
        playersToPooler[player.id] = pooler;
      }

      // Goalies

      stats[pooler].chosen_goalies = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_goalies.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_goalies[j].name);

        player.pool_points =
          poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;
        stats[pooler].goalies_total_pts +=
          poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;

        stats[pooler].chosen_goalies.push(player);
        playersToPooler[player.id] = pooler;
      }

      // Reservists

      stats[pooler].chosen_reservist = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_reservist.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_reservist[j].name);

        if (player.position === 'G') {
          player.pool_points =
            poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;
          stats[pooler].reservists_total_pts +=
            poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;
        } else if (player.position === 'F') {
          player.pool_points =
            poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists; // + hat trick
          stats[pooler].reservists_total_pts +=
            poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists; // + hat trick
        } else {
          player.pool_points =
            poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick
          stats[pooler].reservists_total_pts +=
            poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick
        }
        stats[pooler].chosen_reservist.push(player);
        playersToPooler[player.id] = pooler;
      }

      stats[pooler].total_pts =
        stats[pooler].forwards_total_pts +
        stats[pooler].defenders_total_pts +
        stats[pooler].goalies_total_pts +
        stats[pooler].reservists_total_pts;

      const pooler_global_stats = {
        name: pooler,
        defenders_total_pts: stats[pooler].defenders_total_pts,
        forwards_total_pts: stats[pooler].forwards_total_pts,
        goalies_total_pts: stats[pooler].goalies_total_pts,
        reservists_total_pts: stats[pooler].reservists_total_pts,
        total_pts: stats[pooler].total_pts,
      };

      rank.push(pooler_global_stats);
    }

    rank = await sort_by_player_member('total_pts', rank);

    setRanking(rank);
    setPlayersStats(stats);
    setPlayersToPoolerMap(playersToPooler);
  };

  useEffect(() => {
    if (poolName) {
      axios
        .get('/api/pool/get_pool_stats', {
          headers: {
            token: Cookies.get(`token-${user._id}`),
            poolname: poolName,
          },
        })
        .then(res => {
          if (res.data.success) {
            const newDate = new Date();
            if (newDate.getHours() < 12) {
              newDate.setDate(newDate.getDate() - 1);
            }

            newDate.setHours(0);
            const fDate = newDate.toISOString().slice(0, 10);
            setFormatDate(fDate);
            calculate_pool_stats(res.data.players);
          }
        });
    }
    return () => {};
  }, [poolInfo]);

  const download_csv = pool => {
    let csv = 'Player Name,Team\n';

    for (let i = 0; i < pool.number_poolers; i += 1) {
      const pooler = pool.participants[i];

      // forward
      csv += `\n${pooler}'s forwards\n`;
      for (let j = 0; j < pool.context[pooler].chosen_forward.length; j += 1) {
        csv += `${pool.context[pooler].chosen_forward[j].name}, ${pool.context[pooler].chosen_forward[j].team}\n`;
      }

      // defenders
      csv += `\n${pooler}'s defenders\n`;
      for (let j = 0; j < pool.context[pooler].chosen_defender.length; j += 1) {
        csv += `${pool.context[pooler].chosen_defender[j].name}, ${pool.context[pooler].chosen_defender[j].team}\n`;
      }

      // goalies
      csv += `\n${pooler}'s goalies\n`;
      for (let j = 0; j < pool.context[pooler].chosen_goalies.length; j += 1) {
        csv += `${pool.context[pooler].chosen_goalies[j].name}, ${pool.context[pooler].chosen_goalies[j].team}\n`;
      }

      // reservist
      csv += `\n${pooler}'s reservists\n`;
      for (let j = 0; j < pool.context[pooler].chosen_reservist.length; j += 1) {
        csv += `${pool.context[pooler].chosen_reservist[j].name}, ${pool.context[pooler].chosen_reservist[j].team}\n`;
      }

      csv += '\n\n-------, -------, -------, -------\n\n';
    }

    const hiddenElement = document.createElement('a');
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
    hiddenElement.target = '_blank';
    hiddenElement.download = `${poolInfo.name}.csv`;
    hiddenElement.click();
  };

  const isUser = participant => participant === user._id;

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
            {pooler === user._id ? (
              <button className="base-button" type="button" onClick={() => open_fill_spot_modal(position)}>
                Fill Spot
              </button>
            ) : (
              '-'
            )}
          </td>
          <td colSpan={6}>Empty spot</td>
        </tr>
      );
    }

    return emptyRows;
  };

  const render_skater_stats = (pooler, chosen_player_key, player_total_pts_key, max, position) => {
    if (playersStats[pooler]) {
      const emptyRows = get_empty_rows(playersStats[pooler][chosen_player_key].length, max, pooler, position);
      return (
        <>
          {playersStats[pooler][chosen_player_key].map((player, i) => (
            <tr key={player.name}>
              <td>{i + 1}</td>

              <td>
                <Link to={`/player-info/${player.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {player.name}
                </Link>
              </td>
              <td>
                <img src={logos[player.team]} alt="" width="40" height="40" />
              </td>
              <td>{player.stats.goals}</td>
              <td>{player.stats.assists}</td>
              <td>{player.stats.pts}</td>
              <td>-</td>
              <td>{player.pool_points}</td>
            </tr>
          ))}
          {emptyRows.map(row => row)}
          <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{playersStats[pooler][player_total_pts_key]}</th>
          </tr>
        </>
      );
    }

    return null;
  };

  const render_goalies_stats = (pooler, max) => {
    if (playersStats[pooler]) {
      const emptyRows = get_empty_rows(playersStats[pooler].chosen_goalies.length, max, 'G');
      return (
        <>
          {playersStats[pooler].chosen_goalies.map((player, i) => (
            <tr key={player.name}>
              <td>{i + 1}</td>
              <td>
                <Link to={`/player-info/${player.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {player.name}
                </Link>
              </td>
              <td>
                <img src={logos[player.team]} alt="" width="40" height="40" />
              </td>
              <td>{player.stats.wins}</td>
              <td>{player.stats.losses}</td>
              <td>{player.stats.shutouts}</td>
              <td>{player.stats.savePercentage}</td>
              <td>{player.pool_points}</td>
            </tr>
          ))}
          <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{playersStats[pooler].goalies_total_pts}</th>
          </tr>
        </>
      );
    }

    return null;
  };

  const render_header_skaters = () => (
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Team</th>
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
      <th>Name</th>
      <th>Team</th>
      <th>Win</th>
      <th>Loss</th>
      <th>Shutout</th>
      <th>Save %</th>
      <th>Pts (pool)</th>
    </tr>
  );

  const render_tabs_choice_stats = () => {
    if (poolInfo.participants) {
      const poolers = poolInfo.participants;

      // replace pooler user name to be first
      const i = poolers.findIndex(isUser);
      poolers.splice(i, 1);
      poolers.splice(0, 0, user._id);

      return (
        <Tabs>
          <TabList>
            {poolers.map(pooler => (
              <Tab key={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</Tab>
            ))}
          </TabList>
          {poolers.map(pooler => (
            <TabPanel key={pooler}>
              <table className="content-table">
                <thead>
                  <tr>
                    <th colSpan={8}>Forwards</th>
                  </tr>
                  {render_header_skaters()}
                </thead>
                <tbody>
                  {render_skater_stats(pooler, 'chosen_forward', 'forwards_total_pts', poolInfo.number_forward, 'F')}
                </tbody>
                <thead>
                  <tr>
                    <th colSpan={8}>Defenders</th>
                  </tr>
                  {render_header_skaters()}
                </thead>
                <tbody>
                  {render_skater_stats(
                    pooler,
                    'chosen_defender',
                    'defenders_total_pts',
                    poolInfo.number_defenders,
                    'D'
                  )}
                </tbody>
                <thead>
                  <tr>
                    <th colSpan={8}>Goalies</th>
                  </tr>
                  {render_header_goalies()}
                </thead>
                <tbody>{render_goalies_stats(pooler, poolInfo.number_goalies)}</tbody>
                <thead>
                  <tr>
                    <th colSpan={8}>Reservists</th>
                  </tr>
                  {render_header_skaters()}
                </thead>
                <tbody>
                  {render_skater_stats(
                    pooler,
                    'chosen_reservist',
                    'reservists_total_pts',
                    poolInfo.number_reservist,
                    null
                  )}
                </tbody>
              </table>
            </TabPanel>
          ))}
        </Tabs>
      );
    }

    return null;
  };

  const render_tabs_pool_rank = () =>
    ranking.map((pooler_stats, i) => (
      <tr key={pooler_stats.name}>
        <td>{i + 1}</td>
        <td>{DictUsers ? DictUsers[pooler_stats.name] : pooler_stats.name}</td>
        <td>{pooler_stats.forwards_total_pts}</td>
        <td>{pooler_stats.defenders_total_pts}</td>
        <td>{pooler_stats.goalies_total_pts}</td>
        <td>{pooler_stats.reservists_total_pts}</td>
        <td>{pooler_stats.total_pts}</td>
      </tr>
    ));

  if (playersStats && ranking) {
    return (
      <div className="min-width">
        <div className="cont">
          <h1>Today&apos;s ranking</h1>
          <table className="content-table">
            <thead>
              <tr>
                <th>rank</th>
                <th>pooler name</th>
                <th>forwards (pts)</th>
                <th>defenders (pts)</th>
                <th>goalies (pts)</th>
                <th>reservists (pts)</th>
                <th>total (pts)</th>
              </tr>
            </thead>
            <tbody>{render_tabs_pool_rank()}</tbody>
          </table>
        </div>
        <div className="cont">
          <h1>Pooler&apos;s roster</h1>
          {render_tabs_choice_stats()}
          <button className="base-button" onClick={() => download_csv(poolInfo)} disabled={false} type="button">
            Download CSV
          </button>
        </div>
        <TradeCenter poolInfo={poolInfo} setPoolInfo={setPoolInfo} user={user} DictUsers={DictUsers} />
        <div className="cont">
          <DayLeaders
            formatDate={formatDate}
            playersToPoolerMap={playersToPoolerMap}
            user={user}
            DictUsers={DictUsers}
          />
          <FillSpot
            showFillSpotModal={showFillSpotModal}
            setShowFillSpotModal={setShowFillSpotModal}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            user={user}
            fillSpotPosition={fillSpotPosition}
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1>trying to fetch pool data info...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

InProgressPool.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
  DictUsers: PropTypes.shape({}).isRequired,
  poolName: PropTypes.string.isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    context: PropTypes.arrayOf(
      PropTypes.shape({
        chosen_forward: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_defender: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_goalies: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_reservist: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
      }).isRequired
    ).isRequired,
    forward_pts_goals: PropTypes.number.isRequired,
    forward_pts_assists: PropTypes.number.isRequired,
    defender_pts_goals: PropTypes.number.isRequired,
    defender_pts_assists: PropTypes.number.isRequired,
    goalies_pts_wins: PropTypes.number.isRequired,
    goalies_pts_shutouts: PropTypes.number.isRequired,
  }).isRequired,
};
