import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';
import { RiTeamFill } from 'react-icons/ri';

// component
import DayLeaders from '../home_page/dailyLeaders';
import TradeCenter from './tradeCenter';
import PlayerLink from '../playerLink';

// modals
import FillSpot from '../../modals/FillSpot';

// images
import { logos } from '../img/logos';

// css
import '../react-tabs.css';

export default function InProgressPool({
  user,
  DictUsers,
  poolName,
  poolInfo,
  setPoolInfo,
  injury,
  isUserParticipant,
}) {
  const [playersStats, setPlayersStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [playersIdToPoolerMap, setPlayersIdToPoolerMap] = useState(null);
  const [playerIdToPlayersDataMap, setPlayerIdToPlayersDataMap] = useState(null);
  const [formatDate, setFormatDate] = useState('');
  const [showFillSpotModal, setShowFillSpotModal] = useState(false);
  const [fillSpotPosition, setFillSpotPosition] = useState('');
  const [dayLeaders, setDayLeaders] = useState(null);
  const [isCumulative, seIsCumulative] = useState(true); // TODO: use this to be in cumulative or daily mode.

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

    do {
      const fTempDate = tempDate.toISOString().slice(0, 10);
      daily_stats = poolInfo.context.score_by_day[fTempDate];

      tempDate.setDate(tempDate.getDate() - 1);
    } while (!daily_stats[poolInfo.participants[0]].cumulate);

    return daily_stats;
  };

  const calculate_pool_stats = async fDate => {
    const stats = {}; // contains players list per pooler and poolers total points
    let rank = []; // contains pooler total points
    const playersIdToPooler = {};
    const playersIdToPlayersData = {};

    const daily_stats = await find_last_cumulate(fDate);
    console.log(daily_stats); // TODO make this date variable

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const pooler = poolInfo.participants[i];

      stats[pooler] = {};

      stats[pooler].forwards_total_goal =
        daily_stats && daily_stats[pooler].cumulate ? daily_stats[pooler].cumulate.G_F : 0;
      stats[pooler].forwards_total_assist = daily_stats ? daily_stats[pooler].cumulate.A_F : 0;
      stats[pooler].forwards_total_pts = daily_stats ? daily_stats[pooler].cumulate.P_F : 0;
      stats[pooler].forwards_total_hattrick = daily_stats ? daily_stats[pooler].cumulate.HT_F : 0;
      stats[pooler].defenders_total_goal = daily_stats ? daily_stats[pooler].cumulate.G_D : 0;
      stats[pooler].defenders_total_assist = daily_stats ? daily_stats[pooler].cumulate.A_D : 0;
      stats[pooler].defenders_total_hattrick = daily_stats ? daily_stats[pooler].cumulate.HT_D : 0;
      stats[pooler].defenders_total_pts = daily_stats ? daily_stats[pooler].cumulate.P_D : 0;
      stats[pooler].goalies_total_goal = daily_stats ? daily_stats[pooler].cumulate.G_G : 0;
      stats[pooler].goalies_total_assist = daily_stats ? daily_stats[pooler].cumulate.A_G : 0;
      stats[pooler].goalies_total_win = daily_stats ? daily_stats[pooler].cumulate.W_G : 0;
      stats[pooler].goalies_total_shutout = daily_stats ? daily_stats[pooler].cumulate.SO_G : 0;
      stats[pooler].goalies_total_pts = daily_stats ? daily_stats[pooler].cumulate.P_G : 0;
      stats[pooler].total_pts = daily_stats ? daily_stats[pooler].cumulate.P : 0;

      stats[pooler].chosen_forwards = [];
      stats[pooler].chosen_defenders = [];
      stats[pooler].chosen_goalies = [];
      stats[pooler].chosen_reservists = [];

      // Create 2 HashMaps for each players that is included in this pool.
      // 1st Player-ID -> Pooler-owner
      // 2nd Player-ID -> Player-info

      // Forwards

      for (let j = 0; j < poolInfo.context.pooler_roster[pooler].chosen_forwards.length; j += 1) {
        const player = poolInfo.context.pooler_roster[pooler].chosen_forwards[j];

        playersIdToPooler[player.id] = pooler;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.HT = 0;
        player.pool_points = 0;
        player.own = true;
        stats[pooler].chosen_forwards.push(player);
      }

      // Defenders

      for (let j = 0; j < poolInfo.context.pooler_roster[pooler].chosen_defenders.length; j += 1) {
        const player = poolInfo.context.pooler_roster[pooler].chosen_defenders[j];

        playersIdToPooler[player.id] = pooler;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.HT = 0;
        player.pool_points = 0;
        player.own = true;
        stats[pooler].chosen_defenders.push(player);
      }

      // Goalies

      for (let j = 0; j < poolInfo.context.pooler_roster[pooler].chosen_goalies.length; j += 1) {
        const player = poolInfo.context.pooler_roster[pooler].chosen_goalies[j];

        playersIdToPooler[player.id] = pooler;
        playersIdToPlayersData[player.id] = player;

        player.nb_game = 0;
        player.G = 0;
        player.A = 0;
        player.W = 0;
        player.SO = 0;
        player.pool_points = 0;
        player.own = true;
        stats[pooler].chosen_goalies.push(player);
      }

      // Reservists

      for (let j = 0; j < poolInfo.context.pooler_roster[pooler].chosen_reservists.length; j += 1) {
        const player = poolInfo.context.pooler_roster[pooler].chosen_reservists[j];

        playersIdToPooler[player.id] = pooler;
        playersIdToPlayersData[player.id] = player;
      }

      const pooler_global_stats = {
        name: pooler,
        defenders_total_pts: stats[pooler].defenders_total_pts,
        forwards_total_pts: stats[pooler].forwards_total_pts,
        goalies_total_pts: stats[pooler].goalies_total_pts,
        total_pts: stats[pooler].total_pts,
      };

      rank.push(pooler_global_stats);
    }

    rank = await sort_by_player_member('total_pts', rank);

    // Parse the list of all daily games information to get the stats of each players

    const startDate = new Date(2022, 4, 2); // Beginning of the 2021 nhl post season 2022-05-02
    const endDate = new Date(); // today

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
            const index = stats[participant].chosen_forwards.findIndex(object => object.id === Number(key));

            if (index === -1) {
              player.id = key;
              player.nb_game = 1;
              player.HT = player.G >= 3 ? 1 : 0;
              player.own = false;
              stats[participant].chosen_forwards.push(player);
            } else {
              stats[participant].chosen_forwards[index].G += player.G;
              stats[participant].chosen_forwards[index].A += player.A;
              if (player.G >= 3) {
                stats[participant].chosen_forwards[index].HT += 1;
              }
              stats[participant].chosen_forwards[index].nb_game += 1;
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
            const index = stats[participant].chosen_defenders.findIndex(object => object.id === Number(key));

            if (index === -1) {
              player.id = key;
              player.nb_game = 1;
              player.HT = player.G >= 3 ? 1 : 0;
              player.own = false;
              stats[participant].chosen_defenders.push(player);
            } else {
              stats[participant].chosen_defenders[index].G += player.G;
              stats[participant].chosen_defenders[index].A += player.A;
              if (player.G >= 3) {
                stats[participant].chosen_defenders[index].HT += 1;
              }
              stats[participant].chosen_defenders[index].nb_game += 1;
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
            const index = stats[participant].chosen_goalies.findIndex(object => object.id === Number(key));

            if (index === -1) {
              player.id = key;
              player.nb_game = 1;
              player.own = false;
              stats[participant].chosen_goalies.push(player);
            } else {
              stats[participant].chosen_goalies[index].G += player.G;
              stats[participant].chosen_goalies[index].A += player.A;
              stats[participant].chosen_goalies[index].W += player.W;
              stats[participant].chosen_goalies[index].SO += player.SO;
              stats[participant].chosen_goalies[index].nb_game += 1;
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

    // count the number of player currently own in each position.
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
    }

    setRanking(rank);
    setPlayersStats(stats);
    setPlayersIdToPoolerMap(playersIdToPooler);
    setPlayerIdToPlayersDataMap(playersIdToPlayersData);
  };

  useEffect(() => {
    const newDate = new Date();

    let fDate = newDate.toISOString().slice(0, 10);

    // This mechanics allows us to dynamically get the live data game or the past day if no data games are yet discovered for today.

    axios
      .get(`/api-rust/daily_leaders/${fDate}`)
      .then(res => {
        if (res.status === 200) {
          setFormatDate(fDate);
          setDayLeaders({ ...res.data }); // set it in this component
          calculate_pool_stats(fDate);
        }
      })
      .catch(e => {
        newDate.setDate(newDate.getDate() - 1);
        fDate = newDate.toISOString().slice(0, 10);
        setFormatDate(fDate);
        calculate_pool_stats(fDate);
      });
  }, [poolInfo]);

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
          .sort((p1, p2) => {
            return p2.pool_points - p1.pool_points;
          })
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
          <th>{playersStats[pooler][player_total_goal_key]}</th>
          <th>{playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_goal_key] + playersStats[pooler][player_total_assist_key]}</th>
          <th>{playersStats[pooler][player_total_hattrick_key]}</th>
          <th>{playersStats[pooler][player_total_pts_key]}</th>
        </tr>
      </>
    );
  };

  const render_goalies_stats = (pooler, max) => {
    const emptyRows = get_empty_rows(playersStats[pooler].goalies_own, max, pooler, 'G');
    return (
      <>
        {playersStats[pooler].chosen_goalies
          .sort((p1, p2) => {
            return p2.pool_points - p1.pool_points;
          })
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
          <th>{playersStats[pooler].goalies_total_goal}</th>
          <th>{playersStats[pooler].goalies_total_assist}</th>
          <th>{playersStats[pooler].goalies_total_win}</th>
          <th>{playersStats[pooler].goalies_total_shutout}</th>
          <th>{playersStats[pooler].goalies_total_pts}</th>
        </tr>
      </>
    );
  };

  const render_reservists = pooler =>
    poolInfo.context.pooler_roster[pooler].chosen_reservists.map((player, i) => (
      <tr key={player.id}>
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

  const render_tabs_choice_stats = () => {
    if (poolInfo.participants) {
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
              <table className="content-table">
                <thead>
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
        <td>{pooler_stats.total_pts}</td>
      </tr>
    ));

  if (playersStats && ranking && playerIdToPlayersDataMap) {
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
        <TradeCenter
          poolInfo={poolInfo}
          setPoolInfo={setPoolInfo}
          user={user}
          DictUsers={DictUsers}
          isUserParticipant={isUserParticipant}
        />
        <div className="cont">
          <DayLeaders
            formatDate={formatDate}
            playersIdToPoolerMap={playersIdToPoolerMap}
            user={user}
            DictUsers={DictUsers}
            dayLeadersRef={dayLeaders}
            injury={injury}
          />
          {isUserParticipant ? (
            <FillSpot
              showFillSpotModal={showFillSpotModal}
              setShowFillSpotModal={setShowFillSpotModal}
              poolInfo={poolInfo}
              setPoolInfo={setPoolInfo}
              user={user}
              fillSpotPosition={fillSpotPosition}
              isUserParticipant={isUserParticipant}
            />
          ) : null}
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
    defender_pts_goals: PropTypes.number.isRequired,
    defender_pts_assists: PropTypes.number.isRequired,
    goalies_pts_wins: PropTypes.number.isRequired,
    goalies_pts_shutouts: PropTypes.number.isRequired,
  }).isRequired,
};
