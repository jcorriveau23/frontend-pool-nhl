import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';

// Components
import PlayerLink from '../playerLink';

// images
import { logos } from '../img/logos';

// Icons
import { ImArrowRight } from 'react-icons/im';

export default function DailyRanking({
  setDate,
  formatDate,
  todayFormatDate,
  poolInfo,
  isUserParticipant,
  playerIdToPlayersDataMap,
  injury,
  user,
  DictUsers,
}) {
  const [forwDailyStats, setForwDailyStats] = useState(null);
  const [defDailyStats, setDefDailyStats] = useState(null);
  const [goalDailyStats, setGoalDailyStats] = useState(null);
  const [dailyRank, setDailyRank] = useState(null);
  const [isNoGameInDay, setIsNoGameInDay] = useState(false);

  useEffect(() => {
    const forwDailyStatsTemp = {};
    const defDailyStatsTemp = {};
    const goalDailyStatsTemp = {};

    const score_by_day = poolInfo.context.score_by_day;

    if (score_by_day[formatDate]) {
      const dailyRankTemp = [];

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        const participant = poolInfo.participants[i];

        // These variable will count the number of games.

        let forwardDailyGames = 0;
        let defendersDailyGames = 0;
        let goaliesDailyGames = 0;

        // Forwards daily stats

        forwDailyStatsTemp[participant] = [];
        Object.keys(score_by_day[formatDate][participant].roster.F).map(key => {
          let player;
          if (score_by_day[formatDate][participant].roster.F[key]) {
            forwardDailyGames += 1;
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              G: score_by_day[formatDate][participant].roster.F[key].G,
              A: score_by_day[formatDate][participant].roster.F[key].A,
              pts:
                score_by_day[formatDate][participant].roster.F[key].G * poolInfo.forward_pts_goals +
                score_by_day[formatDate][participant].roster.F[key].A * poolInfo.forward_pts_assists,
              played: true,
            };
            if (player.G >= 3) {
              player.pts += poolInfo.forward_pts_hattricks;
            }
          } else {
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              pts: 0,
              played: false,
            };
          }

          forwDailyStatsTemp[participant].push(player);
        });

        // Defenders daily stats

        defDailyStatsTemp[participant] = [];
        Object.keys(score_by_day[formatDate][participant].roster.D).map(key => {
          let player;
          if (score_by_day[formatDate][participant].roster.D[key]) {
            defendersDailyGames += 1;
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              G: score_by_day[formatDate][participant].roster.D[key].G,
              A: score_by_day[formatDate][participant].roster.D[key].A,
              pts:
                score_by_day[formatDate][participant].roster.D[key].G * poolInfo.defender_pts_goals +
                score_by_day[formatDate][participant].roster.D[key].A * poolInfo.defender_pts_assists,
              played: true,
            };
            if (player.G >= 3) {
              player.pts += poolInfo.defender_pts_hattricks;
            }
          } else {
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              pts: 0,
              played: false,
            };
          }
          defDailyStatsTemp[participant].push(player);
        });

        // Goalies daily stats

        goalDailyStatsTemp[participant] = [];
        Object.keys(score_by_day[formatDate][participant].roster.G).map(key => {
          let player;
          if (score_by_day[formatDate][participant].roster.G[key]) {
            goaliesDailyGames += 1;
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              G: score_by_day[formatDate][participant].roster.G[key].G,
              A: score_by_day[formatDate][participant].roster.G[key].A,
              W: score_by_day[formatDate][participant].roster.G[key].W,
              SO: score_by_day[formatDate][participant].roster.G[key].SO,
              pts:
                score_by_day[formatDate][participant].roster.G[key].G * poolInfo.goalies_pts_goals +
                score_by_day[formatDate][participant].roster.G[key].A * poolInfo.goalies_pts_assists,
              played: true,
            };
            if (player.W) {
              player.pts += poolInfo.goalies_pts_wins;
            }
            if (player.SO) {
              player.pts += poolInfo.goalies_pts_shutouts;
            }
          } else {
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              pts: 0,
              played: false,
            };
          }
          goalDailyStatsTemp[participant].push(player);
        });

        dailyRankTemp.push({
          participant,
          // Forwards total daily points
          F_games: forwardDailyGames,
          G_F: score_by_day[formatDate][participant].F_tot.G,
          A_F: score_by_day[formatDate][participant].F_tot.A,
          HT_F: score_by_day[formatDate][participant].F_tot.HT,
          P_F: score_by_day[formatDate][participant].F_tot.pts,
          // Defenders total daily points
          D_games: defendersDailyGames,
          G_D: score_by_day[formatDate][participant].D_tot.G,
          A_D: score_by_day[formatDate][participant].D_tot.A,
          HT_D: score_by_day[formatDate][participant].D_tot.HT,
          P_D: score_by_day[formatDate][participant].D_tot.pts,
          // Goalies total daily points
          G_games: goaliesDailyGames,
          G_G: score_by_day[formatDate][participant].G_tot.G,
          A_G: score_by_day[formatDate][participant].G_tot.A,
          W_G: score_by_day[formatDate][participant].G_tot.W,
          SO_G: score_by_day[formatDate][participant].G_tot.SO,
          P_G: score_by_day[formatDate][participant].G_tot.pts,
          // Total daily points
          total_games: forwardDailyGames + defendersDailyGames + goaliesDailyGames,
          P: score_by_day[formatDate][participant].tot_pts,
        });
      }

      setForwDailyStats(forwDailyStatsTemp);
      setDefDailyStats(defDailyStatsTemp);
      setGoalDailyStats(goalDailyStatsTemp);
      setDailyRank(dailyRankTemp);
      setIsNoGameInDay(false);
    } else {
      setIsNoGameInDay(true);
    }
  }, [formatDate]);

  const render_table_rank_header = () => (
    <>
      <tr>
        {formatDate === todayFormatDate ? (
          <th colSpan={22}>Today daily ranking</th>
        ) : (
          <th colSpan={22}>
            Daily ranking ({formatDate})
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
    </>
  );

  const render_table_rank_body = () =>
    dailyRank
      .sort((val1, val2) => val2.P - val1.P)
      .map((val, i) => (
        <tr>
          <td>{i + 1}</td>
          <td>{DictUsers ? DictUsers[val.participant] : val.participant}</td>
          <td>{val.F_games}</td>
          <td>{val.G_F}</td>
          <td>{val.A_F}</td>
          <td>{val.HT_F}</td>
          <td>
            <b>{val.P_F}</b>
          </td>
          <td>{val.D_games}</td>
          <td>{val.G_D}</td>
          <td>{val.A_D}</td>
          <td>{val.HT_D}</td>
          <td>
            <b>{val.P_D}</b>
          </td>
          <td>{val.G_games}</td>
          <td>{val.G_G}</td>
          <td>{val.A_G}</td>
          <td>{val.W_G}</td>
          <td>{val.SO_G}</td>
          <td>
            <b>{val.P_G}</b>
          </td>
          <td>{val.total_games}</td>
          <td>
            <b>{val.P}</b>
          </td>
        </tr>
      ));

  const render_table_roster_header = participant => (
    <tr>
      {formatDate === todayFormatDate ? (
        <th colSpan={7}>Today&apos;s {DictUsers ? DictUsers[participant] : participant}&apos;s pointers</th>
      ) : (
        <th colSpan={7}>
          {DictUsers ? DictUsers[participant] : participant}&apos;s pointers ({formatDate})
          <button className="base-button" onClick={() => setDate(new Date())} type="button">
            See today&apos;s stats
          </button>
        </th>
      )}
    </tr>
  );

  const render_skaters_headers_stats = (participant, position, maxPosition, skaterDailyStats) => (
    <>
      <tr>
        <th colSpan={7}>
          {position} ({skaterDailyStats[participant].length}/{maxPosition})
        </th>
      </tr>
      <tr>
        <th colSpan={2}>Name</th>
        <th colSpan={2}>Team</th>
        <th>G</th>
        <th>A</th>
        <th>Pts</th>
      </tr>
    </>
  );

  const render_skaters_stats = (participant, skaterDailyStats) =>
    skaterDailyStats[participant]
      .sort((player1, player2) => player2.pts + player2.played - player1.pts - player1.played)
      .map(player => (
        <tr>
          <td colSpan={2}>
            <PlayerLink name={player.name} id={player.id} />
          </td>
          <td colSpan={2}>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
          {player.played ? (
            <>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>
                <b>{player.pts}</b>
              </td>
            </>
          ) : (
            <td colSpan={3}>Did not played</td>
          )}
        </tr>
      ));

  const render_skaters_total = (participant, position_key) => {
    if (poolInfo.context.score_by_day[formatDate]) {
      return (
        <tr>
          <th colSpan={4}>Total</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key].G}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key].A}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key].pts}</th>
        </tr>
      );
    }
    return null;
  };

  const render_goalies_total = (participant, position_key) => {
    if (poolInfo.context.score_by_day[formatDate]) {
      return (
        <tr>
          <th colSpan={2}>Total</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot.G}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot.A}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot.W}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot.SO}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot.pts}</th>
        </tr>
      );
    }
    return null;
  };

  const render_goalies_headers_stats = participant => (
    <>
      <tr>
        <th colSpan={7}>
          Goalies ({goalDailyStats[participant].length}/{poolInfo.number_goalies})
        </th>
      </tr>
      <tr>
        <th>Name</th>
        <th>Team</th>
        <th>G</th>
        <th>A</th>
        <th>W</th>
        <th>SO</th>
        <th>Pts</th>
      </tr>
    </>
  );

  const render_goalies_stats = participant =>
    goalDailyStats[participant]
      .sort(player => player.played)
      .map(player => (
        <tr>
          <td>
            <PlayerLink name={player.name} id={player.id} injury={injury} />
          </td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
          {player.played ? (
            <>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.W ? 'Yes' : 'No'}</td>
              <td>{player.SO ? 'Yes' : 'No'}</td>
              <td>
                <b>{player.pts}</b>
              </td>
            </>
          ) : (
            <td colSpan={5}>Did not played</td>
          )}
        </tr>
      ));

  const poolers = poolInfo.participants;

  if (isUserParticipant) {
    // replace pooler user name to be first
    const i = poolers.findIndex(participant => participant === user._id.$oid);
    poolers.splice(i, 1);
    poolers.splice(0, 0, user._id.$oid);
  }

  console.log(isNoGameInDay);

  if (isNoGameInDay || (forwDailyStats && defDailyStats && goalDailyStats)) {
    return (
      <>
        <table className="content-table-no-min">
          <thead>{render_table_rank_header()}</thead>
          <tbody>
            {isNoGameInDay ? (
              <tr>
                <td colSpan={22}>No games started yet ({formatDate})</td>
              </tr>
            ) : (
              render_table_rank_body()
            )}
          </tbody>
        </table>
        <Tabs>
          <TabList>
            {poolers.map(participant => (
              <Tab key={participant}>{DictUsers ? DictUsers[participant] : participant}</Tab>
            ))}
          </TabList>
          {poolers.map(participant => (
            <TabPanel>
              <div className="half-cont">
                <table className="content-table-no-min">
                  <thead>{render_table_roster_header(participant)}</thead>
                  <tbody>
                    {isNoGameInDay ? (
                      <tr>
                        <td colSpan={6}>No games started yet ({formatDate})</td>
                      </tr>
                    ) : (
                      <>
                        {render_skaters_headers_stats(
                          participant,
                          'Forwards',
                          poolInfo.number_forwards,
                          forwDailyStats
                        )}
                        {render_skaters_stats(participant, forwDailyStats)}
                        {render_skaters_total(participant, 'F_tot')}
                        {render_skaters_headers_stats(
                          participant,
                          'Defenders',
                          poolInfo.number_defenders,
                          defDailyStats
                        )}
                        {render_skaters_stats(participant, defDailyStats)}
                        {render_skaters_total(participant, 'D_tot')}
                        {render_goalies_headers_stats(participant)}
                        {render_goalies_stats(participant)}
                        {render_goalies_total(participant)}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </>
    );
  }
  return (
    <div>
      <h1>Processing pool informations...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

DailyRanking.propTypes = {};
