import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

// icons
import { GiEntryDoor, GiExitDoor } from 'react-icons/gi';
import { BsCalendarDay } from 'react-icons/bs';

// Components
import User from '../user';
import PlayerLink from '../playerLink';
import { logos } from '../img/logos';

export default function PoolHistory({
  poolInfo,
  playerIdToPlayersDataMap,
  injury,
  user,
  DictUsers,
  isUserParticipant,
}) {
  const [history, setHistory] = useState(null);

  const parse_all_movement = async () => {
    const startDate = new Date(poolInfo.season_start);
    const endDate = new Date();

    const currentRoster = {};
    const historyTmp = [];
    let isFirstDay = true;

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      const dailyMovements = []; // Will capture all movement that happened on this date.

      if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
        for (let i = 0; i < poolInfo.participants.length; i += 1) {
          const participant = poolInfo.participants[i];
          const forwards = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.F);
          const defenders = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.D);
          const goalies = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.G);

          const roster = forwards.concat(defenders, goalies);

          if (!isFirstDay) {
            // see if a changes was made to the roster and note it in historyTmp.

            const removedPlayers = currentRoster[participant].filter(player => !roster.includes(player));
            const addedPlayers = roster.filter(player => !currentRoster[participant].includes(player));

            if (removedPlayers.length > 0 || addedPlayers.length > 0) {
              const movement = { participant, removedPlayers, addedPlayers };
              dailyMovements.push(movement);
            }
          }

          // update the current roster.
          currentRoster[participant] = roster;
        }

        if (dailyMovements.length > 0) {
          historyTmp.unshift({ date: jDate, dailyMovements });
        }

        if (isFirstDay) isFirstDay = false; // We will start to note changes applied to rosters after the first day.
      }
    }

    if (historyTmp.length > 0) setHistory(historyTmp);
  };

  useEffect(() => {
    parse_all_movement();
  }, []);

  const render_daily_roster_movement = dailyMovements => {
    console.log(dailyMovements);
    return (
      <>
        <tr>
          <th colSpan={3}>
            <BsCalendarDay size={30} />
            {dailyMovements.date}
          </th>
        </tr>
        {dailyMovements.dailyMovements.map(d => (
          <>
            <tr>
              <th colSpan={3}>
                <User id={d.participant} user={user} DictUsers={DictUsers} />
              </th>
            </tr>
            {d.addedPlayers.map(p => (
              <tr>
                <td>
                  <PlayerLink name={playerIdToPlayersDataMap[p].name} id={p} />
                </td>
                <td>
                  <img src={logos[playerIdToPlayersDataMap[p].team]} alt="" width="50" height="50" />
                </td>
                <td>
                  <GiEntryDoor color="green" size={30} />
                </td>
              </tr>
            ))}
            {d.removedPlayers.map(p => (
              <tr>
                <td>
                  <PlayerLink name={playerIdToPlayersDataMap[p].name} id={p} />
                </td>
                <td>
                  <img src={logos[playerIdToPlayersDataMap[p].team]} alt="" width="50" height="50" />
                </td>
                <td>
                  <GiExitDoor color="red" size={30} />
                </td>
              </tr>
            ))}
          </>
        ))}
      </>
    );
  };

  if (history) {
    return (
      <div>
        <table className="content-table">
          <thead>
            <tr>
              <th colSpan={3}>Season Movements</th>
            </tr>
          </thead>
          <tbody>{history.map(dailyMovements => render_daily_roster_movement(dailyMovements))}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>Processing history...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
