import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// images
import { logos } from '../img/logos';

// css
import '../react-tabs.css';

export default function InProgressPool({ user, DictUsers, poolName, poolInfo }) {
  const [playersStats, setPlayersStats] = useState({});
  const [ranking, setRanking] = useState([]);

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
    const stats = {};
    let rank = [];

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const pooler = poolInfo.participants[i];

      stats[pooler] = {};
      stats[pooler].chosen_forward = [];

      stats[pooler].forwards_total_pts = 0;
      stats[pooler].defenders_total_pts = 0;
      stats[pooler].goalies_total_pts = 0;
      stats[pooler].reservists_total_pts = 0;

      for (let j = 0; j < poolInfo.context[pooler].chosen_forward.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_forward[j].name);

        player.pool_points =
          poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists; // + hat trick
        stats[pooler].forwards_total_pts +=
          poolInfo.forward_pts_goals * player.stats.goals + poolInfo.forward_pts_assists * player.stats.assists;

        stats[pooler].chosen_forward.push(player);
      }

      stats[pooler].chosen_defender = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_defender.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_defender[j].name);

        player.pool_points =
          poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick
        stats[pooler].defenders_total_pts +=
          poolInfo.defender_pts_goals * player.stats.goals + poolInfo.defender_pts_assists * player.stats.assists; // + hat trick

        stats[pooler].chosen_defender.push(player);
      }

      stats[pooler].chosen_goalies = [];

      for (let j = 0; j < poolInfo.context[pooler].chosen_goalies.length; j += 1) {
        const player = players_stats.find(p => p.name === poolInfo.context[pooler].chosen_goalies[j].name);

        player.pool_points =
          poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;
        stats[pooler].goalies_total_pts +=
          poolInfo.goalies_pts_wins * player.stats.wins + poolInfo.goalies_pts_shutouts * player.stats.shutouts;

        stats[pooler].chosen_goalies.push(player);
      }

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

    setRanking([...rank]);
    setPlayersStats({ ...stats });
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
          if (res.data.success === true) {
            calculate_pool_stats(res.data.players);
          }
        });
    }
    return () => {};
  }, []);

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

  const render_skater_stats = (pooler, chosen_player_key, player_total_pts_key) => {
    if (playersStats[pooler]) {
      return (
        <>
          {playersStats[pooler][chosen_player_key].map((player, i) => (
            <tr key={player.name}>
              <td>{i + 1}</td>
              <td>{player.name}</td>
              <td>
                <img src={logos[player.team]} alt="" width="30" height="30" />
              </td>
              <td>{player.stats.goals}</td>
              <td>{player.stats.assists}</td>
              <td>{player.stats.pts}</td>
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
            <th>{playersStats[pooler][player_total_pts_key]}</th>
          </tr>
        </>
      );
    }

    return null;
  };

  const render_goalies_stats = pooler => {
    if (playersStats[pooler]) {
      return (
        <>
          {playersStats[pooler].chosen_goalies.map((player, i) => (
            <tr key={player.name}>
              <td>{i + 1}</td>
              <td>{player.name}</td>
              <td>
                <img src={logos[player.team]} alt="" width="30" height="30" />
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
              <Tab key={pooler}>{DictUsers[pooler]}</Tab>
            ))}
          </TabList>
          {poolers.map(pooler => (
            <TabPanel key={pooler}>
              <Tabs>
                <TabList>
                  <Tab>Forwards</Tab>
                  <Tab>Defenders</Tab>
                  <Tab>Goalies</Tab>
                  <Tab>Reservists</Tab>
                </TabList>
                <TabPanel>
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>name</th>
                        <th>team</th>
                        <th>Goal</th>
                        <th>Assist</th>
                        <th>Pts</th>
                        <th>Pts (pool)</th>
                      </tr>
                    </thead>
                    <tbody>{render_skater_stats(pooler, 'chosen_forward', 'forwards_total_pts')}</tbody>
                  </table>
                </TabPanel>
                <TabPanel>
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>name</th>
                        <th>team</th>
                        <th>Goal</th>
                        <th>Assist</th>
                        <th>Pts</th>
                        <th>Pts (pool)</th>
                      </tr>
                    </thead>
                    <tbody>{render_skater_stats(pooler, 'chosen_defender', 'defenders_total_pts')}</tbody>
                  </table>
                </TabPanel>
                <TabPanel>
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>name</th>
                        <th>team</th>
                        <th>Win</th>
                        <th>Loss</th>
                        <th>Shutout</th>
                        <th>Save %</th>
                        <th>Pts (pool)</th>
                      </tr>
                    </thead>
                    <tbody>{render_goalies_stats(pooler)}</tbody>
                  </table>
                </TabPanel>
                <TabPanel>
                  <table className="content-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>name</th>
                        <th>team</th>
                      </tr>
                    </thead>
                    <tbody>{render_skater_stats(pooler, 'chosen_reservist', 'reservists_total_pts')}</tbody>
                  </table>
                </TabPanel>
              </Tabs>
            </TabPanel>
          ))}
        </Tabs>
      );
    }

    return null;
  };

  const render_tabs_pool_rank = () => {
    if (ranking) {
      return ranking.map((pooler_stats, i) => (
        <tr key={pooler_stats.name}>
          <td>{i + 1}</td>
          <td>{DictUsers[pooler_stats.name]}</td>
          <td>{pooler_stats.forwards_total_pts}</td>
          <td>{pooler_stats.defenders_total_pts}</td>
          <td>{pooler_stats.goalies_total_pts}</td>
          <td>{pooler_stats.reservists_total_pts}</td>
          <td>{pooler_stats.total_pts}</td>
        </tr>
      ));
    }

    return null;
  };

  if (poolInfo) {
    return (
      <div className="back-site">
        <h1>Pool in progress...</h1>
        <div className="floatLeft">
          <div>{render_tabs_choice_stats()}</div>
        </div>
        <div className="floatRight">
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
        <button className="base_button" onClick={() => download_csv(poolInfo)} disabled={false} type="button">
          Download CSV
        </button>
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
