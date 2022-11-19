import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import ReactTooltip from 'react-tooltip';

// icons
import { BiLockAlt } from 'react-icons/bi';

// Components
import PlayerLink from '../playerLink';
import NaviguateToday from './naviguateToday';
import User from '../user';

// images
import { logos } from '../img/logos';

export default function DailyRanking({
  formatDate,
  todayFormatDate,
  poolInfo,
  playerIdToPlayersDataMap,
  selectedParticipantIndex,
  setUserTab,
  select_participant,
  injury,
  user,
  DictUsers,
  gameStatus,
  DictTeamAgainst,
}) {
  const [forwDailyStats, setForwDailyStats] = useState(null);
  const [defDailyStats, setDefDailyStats] = useState(null);
  const [goalDailyStats, setGoalDailyStats] = useState(null);
  const [dailyRank, setDailyRank] = useState(null);
  const [dailyPreview, setDailyPreview] = useState(null);

  const calculate_daily_stats = () => {
    const forwDailyStatsTemp = {};
    const defDailyStatsTemp = {};
    const goalDailyStatsTemp = {};

    const { score_by_day } = poolInfo.context;

    if (score_by_day && score_by_day[formatDate]) {
      const dailyRankTemp = [];

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        const participant = poolInfo.participants[i];

        // These variable will count the number of games.

        let forwardDailyGames = 0;
        let defendersDailyGames = 0;
        let goaliesDailyGames = 0;

        // Forwards daily stats

        forwDailyStatsTemp[participant] = Object.keys(score_by_day[formatDate][participant].roster.F).map(key => {
          let player;
          if (score_by_day[formatDate][participant].roster.F[key]) {
            forwardDailyGames += 1;
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              G: score_by_day[formatDate][participant].roster.F[key].G,
              A: score_by_day[formatDate][participant].roster.F[key].A,
              SOG: score_by_day[formatDate][participant].roster.F[key].SOG,
              pts:
                score_by_day[formatDate][participant].roster.F[key].G * poolInfo.forward_pts_goals +
                score_by_day[formatDate][participant].roster.F[key].A * poolInfo.forward_pts_assists,
              played: true,
            };

            if (player.G >= 3) {
              player.pts += poolInfo.forward_pts_hattricks;
            }

            if (player.SOG) {
              player.pts += player.SOG * poolInfo.forward_pts_shootout_goals;
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

          return player;
        });

        // Defenders daily stats

        defDailyStatsTemp[participant] = Object.keys(score_by_day[formatDate][participant].roster.D).map(key => {
          let player;
          if (score_by_day[formatDate][participant].roster.D[key]) {
            defendersDailyGames += 1;
            player = {
              name: playerIdToPlayersDataMap[key].name,
              team: playerIdToPlayersDataMap[key].team,
              id: key,
              G: score_by_day[formatDate][participant].roster.D[key].G,
              A: score_by_day[formatDate][participant].roster.D[key].A,
              SOG: score_by_day[formatDate][participant].roster.D[key].SOG,
              pts:
                score_by_day[formatDate][participant].roster.D[key].G * poolInfo.defender_pts_goals +
                score_by_day[formatDate][participant].roster.D[key].A * poolInfo.defender_pts_assists,
              played: true,
            };
            if (player.G >= 3) {
              player.pts += poolInfo.defender_pts_hattricks;
            }
            if (player.SOG) {
              player.pts += player.SOG * poolInfo.defender_pts_shootout_goals;
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

          return player;
        });

        // Goalies daily stats

        goalDailyStatsTemp[participant] = Object.keys(score_by_day[formatDate][participant].roster.G).map(key => {
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
              OT: score_by_day[formatDate][participant].roster.G[key].OT,
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
            if (player.OT) {
              player.pts += poolInfo.goalies_pts_overtimes;
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

          return player;
        });

        dailyRankTemp.push({
          participant,
          // Forwards total daily points
          F_games: forwardDailyGames,
          G_F: score_by_day[formatDate][participant].F_tot ? score_by_day[formatDate][participant].F_tot.G : 0,
          A_F: score_by_day[formatDate][participant].F_tot ? score_by_day[formatDate][participant].F_tot.A : 0,
          HT_F: score_by_day[formatDate][participant].F_tot ? score_by_day[formatDate][participant].F_tot.HT : 0,
          SOG_F: score_by_day[formatDate][participant].F_tot ? score_by_day[formatDate][participant].F_tot.SOG : 0,
          P_F: score_by_day[formatDate][participant].F_tot ? score_by_day[formatDate][participant].F_tot.pts : 0,
          // Defenders total daily points
          D_games: defendersDailyGames,
          G_D: score_by_day[formatDate][participant].D_tot ? score_by_day[formatDate][participant].D_tot.G : 0,
          A_D: score_by_day[formatDate][participant].D_tot ? score_by_day[formatDate][participant].D_tot.A : 0,
          HT_D: score_by_day[formatDate][participant].D_tot ? score_by_day[formatDate][participant].D_tot.HT : 0,
          SOG_D: score_by_day[formatDate][participant].D_tot ? score_by_day[formatDate][participant].D_tot.SOG : 0,
          P_D: score_by_day[formatDate][participant].D_tot ? score_by_day[formatDate][participant].D_tot.pts : 0,
          // Goalies total daily points
          G_games: goaliesDailyGames,
          G_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.G : 0,
          A_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.A : 0,
          W_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.W : 0,
          SO_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.SO : 0,
          OT_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.OT : 0,
          P_G: score_by_day[formatDate][participant].G_tot ? score_by_day[formatDate][participant].G_tot.pts : 0,
          // Total daily points
          total_games: forwardDailyGames + defendersDailyGames + goaliesDailyGames,
          P: score_by_day[formatDate][participant].tot_pts ? score_by_day[formatDate][participant].tot_pts : 0,
        });
      }

      setForwDailyStats(forwDailyStatsTemp);
      setDefDailyStats(defDailyStatsTemp);
      setGoalDailyStats(goalDailyStatsTemp);
      setDailyRank(dailyRankTemp);
    }
  };

  const calculate_daily_preview = () => {
    const poolerRoster = poolInfo.context.pooler_roster;

    const dailyPreviewTemp = [];

    if (poolerRoster) {
      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        const participant = poolInfo.participants[i];

        const participantPreview = { participant };

        let forwardsCount = 0;
        let defendersCount = 0;
        let goaliesCount = 0;

        // Count the forwards that plays on that day.
        if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[formatDate]) {
          // After 12PM the roster has been locked so use the lock roster to count

          const forwardsIds = Object.keys(poolInfo.context.score_by_day[formatDate][participant].roster.F);
          for (let j = 0; j < forwardsIds.length; j += 1) {
            if (playerIdToPlayersDataMap[forwardsIds[j]].team in DictTeamAgainst) forwardsCount += 1;
          }

          const defendersIds = Object.keys(poolInfo.context.score_by_day[formatDate][participant].roster.D);
          for (let j = 0; j < defendersIds.length; j += 1) {
            if (playerIdToPlayersDataMap[defendersIds[j]].team in DictTeamAgainst) defendersCount += 1;
          }

          const goaliesIds = Object.keys(poolInfo.context.score_by_day[formatDate][participant].roster.G);
          for (let j = 0; j < goaliesIds.length; j += 1) {
            if (playerIdToPlayersDataMap[goaliesIds[j]].team in DictTeamAgainst) goaliesCount += 1;
          }
        } else {
          for (let j = 0; j < poolerRoster[participant].chosen_forwards.length; j += 1) {
            if (poolerRoster[participant].chosen_forwards[j].team in DictTeamAgainst) forwardsCount += 1;
          }

          for (let j = 0; j < poolerRoster[participant].chosen_defenders.length; j += 1) {
            if (poolerRoster[participant].chosen_defenders[j].team in DictTeamAgainst) defendersCount += 1;
          }

          for (let j = 0; j < poolerRoster[participant].chosen_goalies.length; j += 1) {
            if (poolerRoster[participant].chosen_goalies[j].team in DictTeamAgainst) goaliesCount += 1;
          }
        }

        participantPreview.F = forwardsCount;
        participantPreview.D = defendersCount;
        participantPreview.G = goaliesCount;
        participantPreview.T = forwardsCount + defendersCount + goaliesCount;

        dailyPreviewTemp.push(participantPreview);
      }

      setDailyPreview(dailyPreviewTemp);
    }
  };

  useEffect(() => {
    if (gameStatus === 'Preview') calculate_daily_preview();
    else if (gameStatus !== 'N/A') calculate_daily_stats();
  }, [formatDate, gameStatus, DictTeamAgainst]);

  const render_table_preview_header = () => (
    <>
      <NaviguateToday formatDate={formatDate} todayFormatDate={todayFormatDate} msg="Games Planned" colSpan={5} />
      <tr>
        <th>Pooler</th>
        <th>Forwards</th>
        <th>Defenders</th>
        <th>Goalies</th>
        <th>Total</th>
      </tr>
    </>
  );

  const render_table_preview_content = () =>
    dailyPreview
      .sort((p1, p2) => p2.T - p1.T)
      .map(p => (
        <tr
          onClick={() => select_participant(p.participant)}
          style={
            poolInfo.participants[selectedParticipantIndex] === p.participant
              ? { backgroundColor: '#eee', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
        >
          <td>
            <User id={p.participant} user={user} DictUsers={DictUsers} />
          </td>
          <td>{p.F}</td>
          <td>{p.D}</td>
          <td>{p.G}</td>
          <td>
            <b style={{ color: '#a20' }}>{p.T}</b>
          </td>
        </tr>
      ));

  const render_table_roster_preview = (players, position) => (
    <>
      <tr>
        <th colSpan={3}>{position}</th>
      </tr>
      <tr>
        <th>Name</th>
        <th>Team</th>
        <th>Playing Against</th>
      </tr>
      {players
        .sort((p1, p2) => (p2.team in DictTeamAgainst) - (p1.team in DictTeamAgainst))
        .map(player => (
          <tr>
            <td>
              <PlayerLink name={player.name} id={player.id} injury={injury} />
            </td>
            <td>
              <img src={logos[player.team]} alt="" width="40" height="40" />
            </td>
            {player.team in DictTeamAgainst ? (
              <td>
                <img src={logos[DictTeamAgainst[player.team]]} alt="" width="40" height="40" />
              </td>
            ) : (
              <td>Not playing</td>
            )}
          </tr>
        ))}
    </>
  );

  const render_table_roster_preview_locked = (roster, position) => {
    // After 12PM the roster was locked so we need to use score_by_day to display the locked roster instead of the pooler_roster

    const playerIds = Object.keys(roster);
    const players = playerIds.map(id => playerIdToPlayersDataMap[id]);
    return (
      <>
        <tr>
          <th width="85%" colSpan={3}>
            <a data-tip="This is the roster that was locked at 12PM for tonight's games">
              <BiLockAlt size={30} color="red" />
            </a>
            <ReactTooltip className="tooltip" padding="8px" />
            {position}
          </th>
        </tr>
        <tr>
          <th>Name</th>
          <th>Team</th>
          <th>Playing Against</th>
        </tr>
        {players
          .sort((p1, p2) => (p2.team in DictTeamAgainst) - (p1.team in DictTeamAgainst))
          .map(player => (
            <tr>
              <td>
                <PlayerLink name={player.name} id={player.id} injury={injury} />
              </td>
              <td>
                <img src={logos[player.team]} alt="" width="40" height="40" />
              </td>
              {player.team in DictTeamAgainst ? (
                <td>
                  <img src={logos[DictTeamAgainst[player.team]]} alt="" width="40" height="40" />
                </td>
              ) : (
                <td>Not playing</td>
              )}
            </tr>
          ))}
      </>
    );
  };

  const render_table_rank_header = () => (
    <>
      <NaviguateToday formatDate={formatDate} todayFormatDate={todayFormatDate} msg="Daily Ranking" colSpan={24} />
      <tr>
        <th rowSpan={2}>Rank</th>
        <th rowSpan={2}>Pooler</th>
        <th colSpan={6}>Forwards</th>
        <th colSpan={6}>Defenders</th>
        <th colSpan={7}>Goalies</th>
        <th colSpan={2}>Total</th>
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
      </tr>
    </>
  );

  const render_table_rank_body = () =>
    dailyRank
      .sort((p1, p2) => {
        const diff = p2.P - p1.P;
        if (diff === 0) {
          return p1.total_games - p2.total_games;
        }
        return diff;
      })
      .map((p, i) => (
        <tr
          onClick={() => select_participant(p.participant)}
          style={
            poolInfo.participants[selectedParticipantIndex] === p.participant
              ? { backgroundColor: '#eee', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
        >
          <td>{i + 1}</td>
          <td>
            <User id={p.participant} user={user} DictUsers={DictUsers} />
          </td>
          <td>{p.F_games}</td>
          <td>{p.G_F}</td>
          <td>{p.A_F}</td>
          <td>{p.HT_F}</td>
          <td>{p.SOG_F}</td>
          <td>
            <b>{p.P_F}</b>
          </td>
          <td>{p.D_games}</td>
          <td>{p.G_D}</td>
          <td>{p.A_D}</td>
          <td>{p.HT_D}</td>
          <td>{p.SOG_D}</td>
          <td>
            <b>{p.P_D}</b>
          </td>
          <td>{p.G_games}</td>
          <td>{p.G_G}</td>
          <td>{p.A_G}</td>
          <td>{p.W_G}</td>
          <td>{p.SO_G}</td>
          <td>{p.OT_G}</td>
          <td>
            <b>{p.P_G}</b>
          </td>
          <td style={{ backgroundColor: '#eee', cursor: 'pointer' }}>{p.total_games}</td>
          <td style={{ backgroundColor: '#eee', cursor: 'pointer' }}>
            <b style={{ color: '#a20' }}>{p.P}</b>
          </td>
        </tr>
      ));

  const render_skaters_headers_stats = (participant, position, maxPosition, skaterDailyStats) => (
    <>
      <tr>
        <th colSpan={9}>
          {position} ({skaterDailyStats[participant].length}/{maxPosition})
        </th>
      </tr>
      <tr>
        <th colSpan={2}>Name</th>
        <th colSpan={2}>Team</th>
        <th>G</th>
        <th>A</th>
        <th>HT</th>
        <th>G*</th>
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
            <PlayerLink name={player.name} id={player.id} injury={injury} />
          </td>
          <td colSpan={2}>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
          {player.played ? (
            <>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.G >= 3 ? <b style={{ color: '#070' }}>Yes</b> : null}</td>
              <td>{player.SOG ? player.SOG : 0}</td>
              <td>
                <b style={{ color: '#a20' }}>{player.pts}</b>
              </td>
            </>
          ) : (
            <td colSpan={5}>Have not played</td>
          )}
        </tr>
      ));

  const render_skaters_total = (participant, position_key) => {
    if (poolInfo.context.score_by_day[formatDate]) {
      return (
        <tr>
          <th colSpan={4}>Total</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key]?.G}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key]?.A}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key]?.HT}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key]?.SOG}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant][position_key]?.pts}</th>
        </tr>
      );
    }
    return null;
  };

  const render_goalies_headers_stats = participant => (
    <>
      <tr>
        <th colSpan={9}>
          Goalies ({goalDailyStats[participant].length}/{poolInfo.number_goalies})
        </th>
      </tr>
      <tr>
        <th colSpan={2}>Name</th>
        <th>Team</th>
        <th>G</th>
        <th>A</th>
        <th>W</th>
        <th>SO</th>
        <th>OT</th>
        <th>Pts</th>
      </tr>
    </>
  );

  const render_goalies_stats = participant =>
    goalDailyStats[participant]
      .sort(player => player.played)
      .map(player => (
        <tr>
          <td colSpan={2}>
            <PlayerLink name={player.name} id={player.id} injury={injury} />
          </td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
          {player.played ? (
            <>
              <td>{player.G}</td>
              <td>{player.A}</td>
              <td>{player.W ? <b style={{ color: '#070' }}>Yes</b> : <b style={{ color: '#a20' }}>No</b>}</td>
              <td>{player.SO ? <b style={{ color: '#070' }}>Yes</b> : <b style={{ color: '#a20' }}>No</b>}</td>
              <td>{player.OT ? <b style={{ color: '#070' }}>Yes</b> : <b style={{ color: '#a20' }}>No</b>}</td>
              <td>
                <b style={{ color: '#a20' }}>{player.pts}</b>
              </td>
            </>
          ) : (
            <td colSpan={6}>Have not played</td>
          )}
        </tr>
      ));

  const render_goalies_total = participant => {
    if (poolInfo.context.score_by_day[formatDate]) {
      return (
        <tr>
          <th colSpan={3}>Total</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.G}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.A}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.W}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.SO}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.OT}</th>
          <th>{poolInfo.context.score_by_day[formatDate][participant].G_tot?.pts}</th>
        </tr>
      );
    }
    return null;
  };

  if (gameStatus === 'Preview' && dailyPreview && DictTeamAgainst) {
    return (
      <>
        <table className="content-table-no-min">
          {render_table_preview_header()}
          {render_table_preview_content()}
        </table>
        <Tabs selectedIndex={selectedParticipantIndex} onSelect={index => setUserTab(index)} forceRenderTabPanel>
          <TabList>
            {poolInfo.participants.map(participant => (
              <Tab key={participant}>
                <User id={participant} user={user} DictUsers={DictUsers} />
              </Tab>
            ))}
          </TabList>
          {poolInfo.participants.map(participant => (
            <TabPanel>
              <div className="half-cont">
                <table className="content-table-no-min">
                  <NaviguateToday
                    formatDate={formatDate}
                    todayFormatDate={todayFormatDate}
                    msg="Daily Roster"
                    colSpan={4}
                  />
                  {poolInfo.context.score_by_day && poolInfo.context.score_by_day[formatDate] ? (
                    <>
                      {render_table_roster_preview_locked(
                        poolInfo.context.score_by_day[formatDate][participant].roster.F,
                        'Forwards'
                      )}
                      {render_table_roster_preview_locked(
                        poolInfo.context.score_by_day[formatDate][participant].roster.D,
                        'Defenders'
                      )}
                      {render_table_roster_preview_locked(
                        poolInfo.context.score_by_day[formatDate][participant].roster.G,
                        'Goalies'
                      )}
                    </>
                  ) : (
                    <>
                      {render_table_roster_preview(
                        poolInfo.context.pooler_roster[participant].chosen_forwards,
                        'Forwards'
                      )}
                      {render_table_roster_preview(
                        poolInfo.context.pooler_roster[participant].chosen_defenders,
                        'Defenders'
                      )}
                      {render_table_roster_preview(
                        poolInfo.context.pooler_roster[participant].chosen_goalies,
                        'Goalies'
                      )}
                    </>
                  )}
                </table>
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </>
    );
  }

  if (gameStatus === 'N/A') {
    return <h1>No game on {formatDate}.</h1>;
  }

  if (forwDailyStats && defDailyStats && goalDailyStats) {
    return (
      <>
        <table className="content-table-no-min">
          <thead>{render_table_rank_header()}</thead>
          <tbody>{render_table_rank_body()}</tbody>
        </table>
        <Tabs selectedIndex={selectedParticipantIndex} onSelect={index => setUserTab(index)} forceRenderTabPanel>
          <TabList>
            {poolInfo.participants.map(participant => (
              <Tab key={participant}>
                <User id={participant} user={user} DictUsers={DictUsers} />
              </Tab>
            ))}
          </TabList>
          {poolInfo.participants.map(participant => (
            <TabPanel>
              <div className="half-cont">
                <table className="content-table-no-min">
                  <thead>
                    <NaviguateToday
                      formatDate={formatDate}
                      todayFormatDate={todayFormatDate}
                      msg="Daily Roster Points"
                      colSpan={9}
                    />
                  </thead>
                  <tbody>
                    {render_skaters_headers_stats(participant, 'Forwards', poolInfo.number_forwards, forwDailyStats)}
                    {render_skaters_stats(participant, forwDailyStats)}
                    {render_skaters_total(participant, 'F_tot')}
                    {render_skaters_headers_stats(participant, 'Defenders', poolInfo.number_defenders, defDailyStats)}
                    {render_skaters_stats(participant, defDailyStats)}
                    {render_skaters_total(participant, 'D_tot')}
                    {render_goalies_headers_stats(participant)}
                    {render_goalies_stats(participant)}
                    {render_goalies_total(participant)}
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
    <div className="cont">
      <h1>Processing pool informations...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

DailyRanking.propTypes = {};